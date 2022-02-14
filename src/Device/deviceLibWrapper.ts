/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app } from '@electron/remote';
import nrfDeviceLib, {
    Error,
    LogEvent,
    setLogLevel,
    setLogPattern,
    startLogEvents,
    stopLogEvents,
} from '@nordicsemiconductor/nrf-device-lib-js';

import { nrfdlVerboseLoggingEnabled } from '../Log/logSlice';
import logger from '../logging';
import { RootState, TDispatch } from '../state';
import { getVerboseLoggingEnabled } from '../utils/persistentStore';

const deviceLibContext = nrfDeviceLib.createContext();
export const getDeviceLibContext = () => deviceLibContext;

export const logNrfdlLogs =
    (evt: LogEvent) => (_: unknown, getState: () => RootState) => {
        if (app.isPackaged && !nrfdlVerboseLoggingEnabled(getState())) return;
        switch (evt.level) {
            case 'NRFDL_LOG_TRACE':
                logger.verbose(evt.message);
                break;
            case 'NRFDL_LOG_DEBUG':
                logger.debug(evt.message);
                break;
            case 'NRFDL_LOG_INFO':
                logger.info(evt.message);
                break;
            case 'NRFDL_LOG_WARNING':
                logger.warn(evt.message);
                break;
            case 'NRFDL_LOG_ERROR':
                logger.error(evt.message);
                break;
            case 'NRFDL_LOG_CRITICAL':
                logger.error(evt.message);
                break;
        }
    };

export const forwardLogEventsFromDeviceLib = (dispatch: TDispatch) => {
    const taskId = startLogEvents(
        getDeviceLibContext(),
        (err?: Error) => {
            if (err)
                logger.logError(
                    'Error while listening to log messages from nrf-device-lib',
                    err
                );
        },
        (evt: LogEvent) => dispatch(logNrfdlLogs(evt))
    );
    return () => {
        stopLogEvents(taskId);
    };
};

export const setDeviceLibLogLevel = (verboseLogging: boolean) =>
    setLogLevel(
        getDeviceLibContext(),
        verboseLogging ? 'NRFDL_LOG_TRACE' : 'NRFDL_LOG_ERROR'
    );

setLogPattern(getDeviceLibContext(), '[%n][%l](%T.%e) %v');
setDeviceLibLogLevel(getVerboseLoggingEnabled());
nrfDeviceLib.setTimeoutConfig(deviceLibContext, {
    enumerateMs: 3 * 60 * 1000,
});
