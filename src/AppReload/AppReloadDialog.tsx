/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentWindow } from '@electron/remote';

import ConfirmationDialog from '../Dialog/ConfirmationDialog';
import {
    hideDialog,
    isVisible as isVisibleSelector,
    message as messageSelector,
} from './appReloadDialogSlice';

const reloadApp = () => setImmediate(() => getCurrentWindow().reload());

const AppReloadDialog = () => {
    const dispatch = useDispatch();

    const isVisible = useSelector(isVisibleSelector);
    const message = useSelector(messageSelector);

    return (
        <ConfirmationDialog
            isVisible={isVisible}
            onOk={reloadApp}
            onCancel={() => dispatch(hideDialog())}
            okButtonText="Yes"
            cancelButtonText="No"
            text={message}
        />
    );
};

export default AppReloadDialog;
