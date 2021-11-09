/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import formatDate from 'date-fns/format';
import { number, shape, string } from 'prop-types';
import { LogEntry } from 'winston';

import { openUrl } from '../utils/open';

import './log-entry.scss';

const regex = /(.*?)(https?:\/\/[^\s]+)/g;

/**
 * Convert strings to array of strings and JSX <a> tags for hrefs
 *
 * E.g. 'For reference see: https://github.com/example/doc.md or reboot Windows.'
 * will be converted to:
 * [
 *    'For reference see: ',
 *    <a href='https://github.com/example/doc.md'>https://github.com/example/doc.md</a>,
 *    ' or reboot Windows.',
 * ]
 *
 * @param {string} str input string
 * @returns {Array} strings and JSX <a> tags
 */
function hrefReplacer(str: string) {
    const message = [];
    const remainder = str.replace(regex, (match, before, href, index) => {
        message.push(before);
        message.push(
            <a
                href={href}
                key={index}
                tabIndex={index}
                onClick={() => openUrl(href)}
                onKeyPress={() => {}}
            >
                {href}
            </a>
        );
        return '';
    });
    message.push(remainder);
    return message;
}

interface Props {
    entry: LogEntry;
}

const LogEntry: FC<Props> = ({ entry }) => {
    const className = `core19-log-entry core19-log-level-${entry.level}`;
    const time = formatDate(new Date(entry.timestamp), 'HH:mm:ss.SSS');

    return (
        <div className={className}>
            <div className="core19-log-cell core19-log-time">{time}</div>
            <div className="core19-log-cell">{hrefReplacer(entry.message)}</div>
        </div>
    );
};

const entryShape = shape({
    id: number.isRequired,
    timestamp: string.isRequired,
    level: string.isRequired,
    message: string.isRequired,
});

LogEntry.propTypes = {
    entry: entryShape.isRequired,
};

export default LogEntry;
