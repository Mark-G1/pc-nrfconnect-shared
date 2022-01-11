/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    setLogLevel,
    startLogEvents,
} from '@nordicsemiconductor/nrf-device-lib-js';
import { ipcRenderer } from 'electron';

import { getDeviceLibContext } from '../Device/deviceLister';
import logger from '../logging';
import { TDispatch } from '../state';
import { getAppDataDir } from '../utils/appDirs';
import { addEntries } from './logSlice';

let initialMessageSent = false;
const sendInitialMessage = () => {
    if (initialMessageSent) return;

    initialMessageSent = true;
    logger.info(`Application data folder: ${getAppDataDir()}`);

    ipcRenderer.once('app-details', (_event, details) => {
        const {
            name,
            currentVersion,
            engineVersion,
            coreVersion,
            corePath,
            isOfficial,
            path,
            homeDir,
            tmpDir,
        } = details;
        const official = isOfficial ? 'official' : 'local';
        logger.debug(`App ${name} v${currentVersion} ${official}`);
        logger.debug(`App path: ${path}`);
        logger.debug(
            `nRFConnect ${coreVersion}, required by the app is (${engineVersion})`
        );
        logger.debug(`nRFConnect path: ${corePath}`);
        logger.debug(`HomeDir: ${homeDir}`);
        logger.debug(`TmpDir: ${tmpDir}`);
    });
    ipcRenderer.send('get-app-details');
};

const addLogEntriesToStore = (dispatch: TDispatch) => () => {
    const entries = logger.getAndClearEntries();
    if (entries.length > 0) {
        dispatch(addEntries(entries));
    }
};

const formatNrfdlLogs = (msg: string) => msg.split(' ').slice(1).join(' ');

/**
 * Starts listening to new log entries from the application's log buffer.
 * Incoming entries are added to the state, so that they can be displayed
 * in the UI.
 *
 * @param {function} dispatch The redux dispatch function.
 * @returns {function(*)} Function that stops the listener.
 */
function startListening(dispatch: TDispatch) {
    sendInitialMessage();

    setLogLevel(getDeviceLibContext(), 'NRFDL_LOG_CRITICAL');
    startLogEvents(
        getDeviceLibContext(),
        err => console.log(err),
        event => logger.debug(formatNrfdlLogs(event.message))
    );

    const LOG_UPDATE_INTERVAL = 400;
    const logListener = setInterval(
        addLogEntriesToStore(dispatch),
        LOG_UPDATE_INTERVAL
    );

    return () => {
        clearInterval(logListener);
    };
}

export const useLogListener = () => {
    const dispatch = useDispatch();
    useEffect(() => startListening(dispatch), [dispatch]);
};
