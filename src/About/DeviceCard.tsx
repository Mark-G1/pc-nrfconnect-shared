/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import Card from '../Card/Card';
import {
    buyOnlineUrl,
    deviceInfo,
    productPageUrl,
} from '../Device/deviceInfo/deviceInfo';
import {
    // deviceInfo as deviceInfoSelector,
    selectedDevice,
} from '../Device/deviceSlice';
import AboutButton from './AboutButton';
import Section from './Section';

// const memorySize = (memoryInBytes: number) => {
//     if (memoryInBytes == null) {
//         return 'Unknown';
//     }

//     return `${memoryInBytes / 1024}KiB`;
// };

export default () => {
    const device = useSelector(selectedDevice);
    // const extendedDeviceInfo = useSelector(deviceInfoSelector);

    if (device == null) {
        return (
            <Card title="Device">
                <Section title="No device selected" />
            </Card>
        );
    }

    const pca = device.boardVersion;
    const { name, cores } = deviceInfo(device);

    return (
        <Card title="Device">
            <Section title="Name">{name || 'Unknown'}</Section>
            <Section title="ID">{device.serialNumber}</Section>
            <Section title="PCA">{pca || 'Unknown'}</Section>
            <Section title="Cores">{cores || 'Unknown'}</Section>
            {/* 
            <Section title="RAM">
                {memorySize(extendedDeviceInfo?.ramSize)}
            </Section>
            <Section title="Flash">
                {memorySize(extendedDeviceInfo?.codeSize)}
            </Section> */}
            <Section>
                <AboutButton
                    url={buyOnlineUrl(device)}
                    label="Find distributor"
                />
            </Section>
            <Section>
                <AboutButton
                    url={productPageUrl(device)}
                    label="Go to product page"
                />
            </Section>
        </Card>
    );
};
