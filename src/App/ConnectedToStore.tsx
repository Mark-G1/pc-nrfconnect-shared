/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { func, node } from 'prop-types';
import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import coreReducers from '../coreReducers';

const rootReducer = (appReducer: Reducer) =>
    combineReducers({ app: appReducer, ...coreReducers });
const middleware = composeWithDevTools(applyMiddleware(thunk));

const ConnectedToStore: FC<{
    appReducer: Reducer;
    children: ReactNode;
}> = ({ appReducer, children }) => (
    <Provider store={createStore(rootReducer(appReducer), middleware)}>
        {children}
    </Provider>
);
ConnectedToStore.propTypes = {
    appReducer: func.isRequired,
    children: node.isRequired,
};

export default ConnectedToStore;
