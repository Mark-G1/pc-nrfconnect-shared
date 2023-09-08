/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuid } from 'uuid';

import { TaskEnd } from '../sandboxTypes';
import { BatchOperationWrapper2, Callbacks } from './batchTypes';
import {
    DeviceCore,
    DeviceTraits,
    deviceTraitsToArgs,
    getDeviceSandbox,
    NrfutilDeviceWithSerialnumber,
    ResetKind,
} from './common';
import { DeviceBuffer } from './firmwareRead';
import { DeviceCoreInfo } from './getCoreInfo';
import { FWInfo } from './getFwInfo';
import { GetProtectionStatusResult } from './getProtectionStatus';
import {
    FirmwareType,
    ProgrammingOptions,
    programmingOptionsToArgs,
} from './program';

type BatchOperationWrapperUnknown = BatchOperationWrapper2<unknown>;
type CallbacksUnknown = Callbacks<unknown>;

export class Batch {
    private operations: BatchOperationWrapperUnknown[];

    private collectOperations: {
        callback: (completedTasks: TaskEnd<unknown>[]) => void;
        operationId: number;
        count: number;
    }[] = [];

    private async enqueueBatchOperationObject(
        command: string,
        core: DeviceCore,
        callbacks?: Callbacks<unknown>,
        args: string[] = []
    ) {
        const box = await getDeviceSandbox();
        box.singleInfoOperationOptionalData<object>(
            command,
            undefined,
            [' --serial-number', '123', '--generate', '--core', core].concat(
                args
            )
        ).then(batchOperation =>
            this.operations.push({
                operation: {
                    ...batchOperation,
                },
                ...callbacks,
            })
        );
    }

    constructor(operations?: BatchOperationWrapperUnknown[]) {
        this.operations = operations ?? [];
    }

    public erase(core: DeviceCore, callbacks?: Callbacks) {
        this.enqueueBatchOperationObject(
            'erase',
            core,
            callbacks as CallbacksUnknown
        );

        return this;
    }

    public firmwareRead(core: DeviceCore, callbacks?: Callbacks<Buffer>) {
        this.enqueueBatchOperationObject('fw-read', core, {
            ...callbacks,
            onTaskEnd: (taskEnd: TaskEnd<DeviceBuffer>) => {
                if (taskEnd.result === 'success' && taskEnd.data)
                    callbacks?.onTaskEnd?.({
                        ...taskEnd,
                        data: Buffer.from(taskEnd.data.buffer, 'base64'),
                    });
                else {
                    callbacks?.onException?.(new Error('Read failed'));
                }
            },
        } as CallbacksUnknown);

        return this;
    }

    public getCoreInfo(
        core: DeviceCore,
        callbacks?: Callbacks<DeviceCoreInfo>
    ) {
        this.enqueueBatchOperationObject(
            'core-info',
            core,
            callbacks as CallbacksUnknown
        );

        return this;
    }

    public getFwInfo(core: DeviceCore, callbacks?: Callbacks<FWInfo>) {
        this.enqueueBatchOperationObject(
            'fw-info',
            core,
            callbacks as CallbacksUnknown
        );

        return this;
    }

    public getProtectionStatus(
        core: DeviceCore,
        callbacks?: Callbacks<GetProtectionStatusResult>
    ) {
        this.enqueueBatchOperationObject(
            'protection-get',
            core,
            callbacks as CallbacksUnknown
        );

        return this;
    }

    public program(
        firmware: FirmwareType,
        core: DeviceCore,
        programmingOptions?: ProgrammingOptions,
        deviceTraits?: DeviceTraits,
        callbacks?: Callbacks
    ) {
        let args = [
            ...(deviceTraits ? deviceTraitsToArgs(deviceTraits) : []),
            ...programmingOptionsToArgs(programmingOptions),
        ];
        if (typeof firmware === 'string') {
            args = ['--firmware', firmware].concat(args);
        } else {
            const saveTemp = (): string => {
                let tempFilePath;
                do {
                    tempFilePath = path.join(
                        os.tmpdir(),
                        `${uuid()}.${firmware.type}`
                    );
                } while (fs.existsSync(tempFilePath));

                fs.writeFileSync(tempFilePath, firmware.buffer);

                return tempFilePath;
            };
            const tempFilePath = saveTemp();
            args = ['--firmware', tempFilePath].concat(args);

            callbacks = {
                ...callbacks,
                onTaskEnd: (taskEnd: TaskEnd<void>) => {
                    fs.unlinkSync(tempFilePath);
                    callbacks?.onTaskEnd?.(taskEnd);
                },
            } as CallbacksUnknown;
        }

        this.enqueueBatchOperationObject(
            'program',
            core,
            callbacks as CallbacksUnknown,
            args
        );

        return this;
    }

    public recover(core: DeviceCore, callbacks?: Callbacks) {
        this.enqueueBatchOperationObject(
            'recover',
            core,
            callbacks as CallbacksUnknown
        );

        return this;
    }

    public reset(core: DeviceCore, reset?: ResetKind, callbacks?: Callbacks) {
        this.enqueueBatchOperationObject(
            'reset',
            core,
            callbacks as CallbacksUnknown,
            reset ? ['--reset-kind', reset] : undefined
        );

        return this;
    }

    public collect(
        count: number,
        callback: (completedTasks: TaskEnd<unknown>[]) => void
    ) {
        this.collectOperations.push({
            callback,
            operationId: this.operations.length - 1,
            count,
        });

        return this;
    }

    public async run(
        device: NrfutilDeviceWithSerialnumber,
        controller?: AbortController | undefined
    ): Promise<unknown[]> {
        let beginId = 0;
        let endId = 0;
        const results: TaskEnd<unknown>[] = [];

        const operations = {
            operations: this.operations.map((operation, index) => ({
                operationId: index.toString(),
                ...operation.operation,
            })),
        };

        const sandbox = await getDeviceSandbox();
        try {
            await sandbox.execSubcommand<unknown>(
                'x-execute-batch',
                [
                    '--serial-number',
                    device.serialNumber,
                    '--batch-json',
                    JSON.stringify(operations),
                ],
                (progress, task) => {
                    if (task) {
                        this.operations[endId].onProgress?.(progress, task);
                    }
                },
                onTaskBegin => {
                    beginId += 1;
                    this.operations[endId].onTaskBegin?.(onTaskBegin);
                },
                taskEnd => {
                    results.push(taskEnd);

                    this.operations[endId].onTaskEnd?.(taskEnd);

                    this.collectOperations
                        .filter(operation => operation.operationId === endId)
                        .forEach(operation => {
                            operation.callback(
                                results.slice(
                                    results.length - operation.count,
                                    results.length
                                )
                            );
                        });

                    endId += 1;
                },
                controller
            );

            const errors = results.filter(result => result.result === 'fail');
            if (errors.length > 0) {
                const error = new Error(
                    `Batch failed: ${errors
                        .map(e => `error: ${e.error}, message: ${e.message}`)
                        .join('\n')}`
                );
                this.operations[endId].onException?.(error);
                throw error;
            }
        } catch (error) {
            if (beginId !== endId) {
                this.operations[beginId].onException?.(error as Error);
            }
            throw error;
        }

        return results.map(result => result.data);
    }
}
