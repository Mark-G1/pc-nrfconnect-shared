/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

export const parseWithPrettifiedErrorMessage =
    <Out, T extends z.ZodType<Out> = z.ZodTypeAny>(schema: T) =>
    (content: string) => {
        const result = schema.safeParse(JSON.parse(content));

        if (result.success) {
            return result;
        }

        return {
            ...result,
            error: fromZodError(result.error, {
                prefix: 'Error in package.json',
                prefixSeparator: ':\n- ',
                issueSeparator: '\n- ',
            }),
        };
    };
