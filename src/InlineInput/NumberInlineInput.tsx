/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';

import { isFactor } from '../Slider/factor';
import {
    isValues,
    NewRange,
    RangeOrValues,
    Values,
} from '../Slider/rangeShape';
import InlineInput from './InlineInput';

import './number-inline-input.scss';

export interface Props {
    disabled?: boolean;
    value: number;
    range: RangeOrValues;
    onChange: (value: number) => void;
    onChangeComplete?: (value: number) => void;
}

const isInValues = (value: number, values: Values) => values.includes(value);

const isInRange = (
    value: number,
    { min, max, decimals = 0, step = 0 }: NewRange
) =>
    value >= min &&
    value <= max &&
    value === Number(value.toFixed(decimals)) &&
    (step > 0 ? isFactor(value, step) : true);

const isValid = (value: number, rangeOrValues: RangeOrValues) =>
    isValues(rangeOrValues)
        ? isInValues(value, rangeOrValues)
        : isInRange(value, rangeOrValues);

const nextInValues = (
    current: number,
    values: Values,
    steps: number
): number | undefined => {
    const currentIndex = values.indexOf(current);
    const newIndex = currentIndex + steps;

    return values[newIndex];
};

const nextInRange = (current: number, range: NewRange, steps: number) => {
    const decimal = range.decimals ?? 0;
    const stepValue =
        range.step && range.step != null ? range.step : 0.1 ** decimal;
    const newValue = Number((current + steps * stepValue).toFixed(decimal));

    if (newValue >= range.min && newValue <= range.max) {
        return newValue;
    }
};

const changeValueStepwise = (
    current: number,
    rangeOrValues: RangeOrValues,
    steps: number,
    action: (v: number) => void
) => {
    const nextValue = isValues(rangeOrValues)
        ? nextInValues(current, rangeOrValues, steps)
        : nextInRange(current, rangeOrValues, steps);

    if (nextValue != null) {
        action(nextValue);
    }
};

const NumberInlineInput: FC<Props> = ({
    disabled,
    value,
    range,
    onChange,
    onChangeComplete = () => {},
}) => (
    <InlineInput
        className="number-inline-input"
        disabled={disabled}
        value={String(value)}
        isValid={newValue => isValid(Number(newValue), range)}
        onChange={newValue => onChange(Number(newValue))}
        onChangeComplete={newValue => onChangeComplete(Number(newValue))}
        onKeyboardIncrementAction={() =>
            changeValueStepwise(value, range, 1, onChange)
        }
        onKeyboardDecrementAction={() =>
            changeValueStepwise(value, range, -1, onChange)
        }
    />
);

export default NumberInlineInput;
