/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { z } from 'zod';

import { knownDevicePcas } from '../device';
import { nrfModules, semver } from '../MetaFiles';
import { parseWithPrettifiedErrorMessage } from './parseJson';

const nrfConnectForDesktop = z.object({
    supportedDevices: z.enum(knownDevicePcas).array().nonempty().optional(),
    nrfutil: nrfModules.optional(),
    html: z.string(),
});

const recordOfOptionalStrings = z.record(z.string().optional());

const engines = recordOfOptionalStrings.and(
    z.object({ nrfconnect: z.string() })
);

const packageJson = z.object({
    name: z.string(),
    version: semver,

    author: z.string().optional(),
    bin: z.string().or(recordOfOptionalStrings).optional(),
    dependencies: recordOfOptionalStrings.optional(),
    description: z.string(),
    homepage: z.string().url().optional(),
    devDependencies: recordOfOptionalStrings.optional(),
    displayName: z.string(),
    engines,
    nrfConnectForDesktop,
    files: z.string().array().optional(),
    license: z.string().optional(),
    main: z.string().optional(),
    peerDependencies: recordOfOptionalStrings.optional(),
    repository: z
        .object({
            type: z.string(),
            url: z.string().url(),
        })
        .optional(),
    scripts: recordOfOptionalStrings.optional(),
});

export type PackageJson = z.infer<typeof packageJson>;

export const parsePackageJson =
    parseWithPrettifiedErrorMessage<PackageJson>(packageJson);

// In the launcher we want to handle that the whole nrfConnectForDesktop may be missing
// and the html in it can also be undefined, so there we need to use this legacy variant
const legacyPackageJson = packageJson.merge(
    z.object({
        nrfConnectForDesktop: nrfConnectForDesktop
            .partial({ html: true })
            .optional(),
    })
);

export type LegacyPackageJson = z.infer<typeof legacyPackageJson>;

export const parseLegacyPackageJson =
    parseWithPrettifiedErrorMessage<LegacyPackageJson>(legacyPackageJson);
