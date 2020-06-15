/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';
import {
    func, node, string,
} from 'prop-types';

import './pseudo-button.scss';

const invokeIfSpaceOrEnterPressed = onClick => event => {
    event.stopPropagation();
    if (event.key === ' ' || event.key === 'Enter') {
        onClick();
    }
};

const blurAndInvoke = onClick => event => {
    event.stopPropagation();
    event.currentTarget.blur();
    onClick();
};

// Motivation for this class: A normal button in HTML must not contain divs or other buttons,
// but we do have things that behave like buttons and at the same time should contain such things
const PseudoButton = ({
    onClick, className = '', children, style,
}) => (
    <div
        role="button"
        className={`core19-pseudo-button ${className}`}
        tabIndex={0}
        onClick={blurAndInvoke(onClick)}
        onKeyUp={invokeIfSpaceOrEnterPressed(onClick)}
        style={style}
    >
        {children}
    </div>
);
PseudoButton.propTypes = {
    onClick: func.isRequired,
    className: string, // eslint-disable-line react/require-default-props
    children: node, // eslint-disable-line react/require-default-props
    style: string,
};

PseudoButton.defaultProps = {
    style: null,
};

export default PseudoButton;
