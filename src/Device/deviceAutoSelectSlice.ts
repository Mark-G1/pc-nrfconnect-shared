/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { AppDispatch, RootState } from '../store';
import type { Device } from './deviceSlice';

export interface WaitForDevice {
    timeout: number;
    when:
        | 'always'
        | 'applicationMode'
        | 'dfuBootLoaderMode'
        | 'sameTraits'
        | ((device: Device) => boolean);
    once: boolean;
    onSuccess?: (device: Device) => void;
    onFail?: (reason?: string) => void;
}

export interface DeviceAutoSelectState {
    autoReselect: boolean;
    device?: Device;
    disconnectionTime?: number;
    waitForDevice?: WaitForDevice;
    autoReconnectTimeout?: NodeJS.Timeout;
    lastArrivedDeviceId?: number;
    arrivedButWrongWhen?: boolean;
    onCancelTimeout?: () => void;
}

const initialState: DeviceAutoSelectState = {
    autoReselect: false,
};

const slice = createSlice({
    name: 'deviceAutoSelect',
    initialState,
    reducers: {
        setWaitForDeviceTimeout: (
            state,
            action: PayloadAction<NodeJS.Timeout>
        ) => {
            clearTimeout(state.autoReconnectTimeout);
            state.autoReconnectTimeout = action.payload;
        },

        clearWaitForDeviceTimeout: (
            state,
            { payload: clearDevice }: PayloadAction<boolean>
        ) => {
            clearTimeout(state.autoReconnectTimeout);
            state.autoReconnectTimeout = undefined;

            if (clearDevice) {
                state.onCancelTimeout = undefined;
                state.waitForDevice = undefined;
            }
        },

        setAutoSelectDevice: (
            state,
            action: PayloadAction<Device | undefined>
        ) => {
            state.device = action.payload ? { ...action.payload } : undefined;
            state.disconnectionTime = undefined;
            clearTimeout(state.autoReconnectTimeout);
            state.autoReconnectTimeout = undefined;
        },

        setDisconnectedTime: (
            state,
            action: PayloadAction<number | undefined>
        ) => {
            if (state.device) {
                state.disconnectionTime = action.payload;
            }
        },

        setAutoReselect: (state, action: PayloadAction<boolean>) => {
            state.autoReselect = action.payload;
            if (state.autoReselect) {
                state.disconnectionTime = undefined;
            }
        },

        setWaitForDevice: (state, action: PayloadAction<WaitForDevice>) => {
            if (state.device) state.waitForDevice = action.payload;
        },

        setLastArrivedDeviceId: (
            state,
            action: PayloadAction<number | undefined>
        ) => {
            if (state.device) state.lastArrivedDeviceId = action.payload;
        },
        setArrivedButWrongWhen: (
            state,
            action: PayloadAction<boolean | undefined>
        ) => {
            state.arrivedButWrongWhen = action.payload;
        },
        setOnCancelTimeout: (state, action: PayloadAction<() => void>) => {
            state.onCancelTimeout = action.payload;
        },
    },
});

export const clearWaitForDevice =
    () => (dispatch: AppDispatch, getState: () => RootState) => {
        if (getState().deviceAutoSelect.autoReconnectTimeout) {
            const onCancel = getState().deviceAutoSelect.onCancelTimeout;
            if (onCancel) {
                onCancel();
            }
        }
        dispatch(slice.actions.clearWaitForDeviceTimeout(true));
    };

export const {
    reducer,
    actions: {
        setWaitForDeviceTimeout,
        clearWaitForDeviceTimeout,
        setAutoSelectDevice,
        setDisconnectedTime,
        setAutoReselect,
        setWaitForDevice,
        setLastArrivedDeviceId,
        setArrivedButWrongWhen,
        setOnCancelTimeout,
    },
} = slice;

export const getAutoReselectDevice = (state: RootState) =>
    state.deviceAutoSelect.device;

export const getAutoReselect = (state: RootState) =>
    state.deviceAutoSelect.autoReselect;

export const getWaitingToAutoReselect = (state: RootState) =>
    state.deviceAutoSelect.disconnectionTime !== undefined &&
    state.deviceAutoSelect.autoReselect;

export const getWaitingForDeviceTimeout = (state: RootState) =>
    state.deviceAutoSelect.autoReconnectTimeout !== undefined;

export const getDisconnectionTime = (state: RootState) =>
    state.deviceAutoSelect.disconnectionTime;

export const getWaitForDevice = (state: RootState) =>
    state.deviceAutoSelect.waitForDevice;

export const getLastArrivedDeviceId = (state: RootState) =>
    state.deviceAutoSelect.lastArrivedDeviceId;
export const getArrivedButWrongWhen = (state: RootState) =>
    state.deviceAutoSelect.arrivedButWrongWhen;
