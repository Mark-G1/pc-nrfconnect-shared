import { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
export interface FlashMessages {
    idCounter: number;
    messages: FlashMessage[];
}
export type FlashMessageVariant = 'success' | 'warning' | 'error' | 'info';
export interface FlashMessage {
    id: number;
    message: string;
    variant: FlashMessageVariant;
    dismissTime?: number;
}
export type FlashMessagePayload = Omit<FlashMessage, 'id'>;
type TAction = ThunkAction<void, RootState, null, AnyAction>;
export declare const newCopiedFlashMessage: () => TAction;
export declare const newSuccessFlashMessage: (message: string, dismissTime?: number) => TAction;
export declare const newWarningFlashMessage: (message: string, dismissTime?: number) => TAction;
export declare const newErrorFlashMessage: (message: string, dismissTime?: number) => TAction;
export declare const newInfoFlashMessage: (message: string, dismissTime?: number) => TAction;
export declare const getMessages: (state: RootState) => FlashMessage[];
export declare const reducer: import("redux").Reducer<FlashMessages, AnyAction>, addNewMessage: import("@reduxjs/toolkit").ActionCreatorWithPayload<FlashMessagePayload, "flashMessages/addNewMessage">, removeMessage: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "flashMessages/removeMessage">;
export {};
