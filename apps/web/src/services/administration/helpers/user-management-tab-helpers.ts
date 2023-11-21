import dayjs from 'dayjs';

import { iso8601Formatter } from '@cloudforet/core-lib';

import { pluginStateColor, userStateColor } from '@/services/administration/constants/user-table-constants';

const colorBindFactory = (colorMapping, textFnc) => (value) => ({
    text: textFnc(value),
    ...colorMapping[value],
});

export const calculateTime = (lastAccessedDay, timezone) => {
    const today = dayjs().toISOString();
    const lastAccessedTime = iso8601Formatter(lastAccessedDay, timezone);
    const todayTime = iso8601Formatter(today, timezone);
    let calculatedTime = dayjs(todayTime).diff(lastAccessedTime, 'day');
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(calculatedTime)) calculatedTime = -1;
    return calculatedTime;
};

export const userStateFormatter = colorBindFactory(userStateColor, (value) => value.toLowerCase());

export const pluginStateFormatter = colorBindFactory(pluginStateColor, (value) => value);
