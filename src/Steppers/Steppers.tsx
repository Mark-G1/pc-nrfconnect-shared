/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';

import classNames from '../utils/classNames';

import './steppers.scss';

export type Step = {
    title: string;
    caption?: string;
    active?: boolean;
    success?: boolean;
    warn?: boolean;
    fail?: boolean;
};

export interface Steppers {
    title?: string;
    steps: Step[];
}

const Steppers = ({ title, steps }: Steppers) => (
    <>
        {title && <div>{title}</div>}
        {steps.map(step => {
            console.log(step);
            return (
                <div
                    key={step.title}
                    className={classNames(
                        'step',
                        step.active && 'step-active',
                        step.success && 'step-success',
                        step.fail && 'step-fail',
                        step.warn && 'step-warn'
                    )}
                >
                    <div>
                        <div className="circle">
                            {step.active && <div className="loading" />}
                            {step.success && <div className="check-mark" />}
                            {step.fail && <div className="cross-mark" />}
                            {step.warn && <div className="warning-mark" />}
                        </div>
                        <div className="step-line" />
                    </div>
                    <div>
                        <div className="title">{step.title}</div>
                        <div className="caption">{step.caption}</div>
                    </div>
                </div>
            );
        })}
    </>
);

export default Steppers;
