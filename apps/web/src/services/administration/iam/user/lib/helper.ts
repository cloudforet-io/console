import { iso8601Formatter } from '@cloudforet/core-lib';
import dayjs from 'dayjs';


import { pluginStateColor, userStateColor } from '@/services/administration/iam/user/lib/config';

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

export const timezoneToUtcFormatter = (hour, timezone) => {
    let offsetHours = 0;
    if (timezone !== 'UTC') offsetHours = (dayjs().tz(timezone).utcOffset()) / 60;
    const newTime = hour - offsetHours;
    if (newTime >= 24) return newTime - 24;
    if (newTime < 0) return newTime + 24;

    return newTime;
};

export const utcToTimezoneFormatter = (hour, timezone) => {
    let offsetHours = 0;
    if (timezone !== 'UTC') offsetHours = (dayjs().tz(timezone).utcOffset()) / 60;
    const newTime = hour + offsetHours;
    if (newTime >= 24) return newTime - 24;
    if (newTime < 0) return newTime + 24;

    return newTime;
};

export const userStateFormatter = colorBindFactory(userStateColor, (value) => value.toLowerCase());

export const pluginStateFormatter = colorBindFactory(pluginStateColor, (value) => value);
