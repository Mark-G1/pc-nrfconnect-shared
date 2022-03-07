#!/usr/bin/env -S ts-node --swc

/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { spawnSync } from 'child_process';
import path from 'path';

const args = process.argv.slice(2);
const script = args[0];
const extraArgs = args.slice(1);

const SCRIPTS: Record<string, string[]> = {
    'build-watch': [require.resolve('../scripts/build.ts'), '--watch'],
    'build-dev': [require.resolve('../scripts/build.ts'), '--dev'],
    'build-prod': [require.resolve('../scripts/build.ts'), '--prod'],
    lint: [require.resolve('../scripts/lint.ts')].concat(extraArgs),
    test: [require.resolve('../scripts/test.ts')].concat(extraArgs),
    'nordic-publish': [require.resolve('../scripts/nordic-publish.ts')].concat(
        extraArgs
    ),
};

const env = {
    ...process.env,
    NODE_PATH: path.join(__dirname, '..', 'node_modules'),
};

const result = spawnSync('ts-node', ['--swc', ...SCRIPTS[script]], {
    stdio: 'inherit',
    env,
});
process.exit(result.status ?? undefined);
