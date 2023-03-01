/// <reference types="node" />
import { Device, DeviceAutoSelectState, RootState, WaitForDevice } from '../state';
export declare const reducer: import("redux").Reducer<DeviceAutoSelectState, import("redux").AnyAction>, setWaitForDeviceTimeout: import("@reduxjs/toolkit").ActionCreatorWithPayload<NodeJS.Timeout, string>, clearWaitForDeviceTimeout: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, setAutoSelectDevice: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<Device | undefined, string>, setDisconnectedTime: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<number | undefined, string>, setAutoReselect: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, string>, setWaitForDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<WaitForDevice, string>, clearAutoReselect: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>;
export declare const getAutoReselectDevice: (state: RootState) => Device | undefined;
export declare const getAutoReselect: (state: RootState) => boolean;
export declare const getWaitingToAutoReselect: (state: RootState) => boolean;
export declare const getWaitingForDevice: (state: RootState) => boolean;
export declare const getDisconnectionTime: (state: RootState) => number | undefined;
export declare const getWaitForDevice: (state: RootState) => WaitForDevice | undefined;
