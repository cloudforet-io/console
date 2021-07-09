import { pluginStateColor, userStateColor } from '@/views/identity/user/lib/config';
import { iso8601Formatter } from '@spaceone/console-core-lib';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Timezone from 'dayjs/plugin/timezone';

dayjs.extend(Timezone);

dayjs.extend(utc);

const colorBindFactory = (colorMapping, textFnc) => value => ({
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

export const userStateFormatter = colorBindFactory(userStateColor, value => value.toLowerCase());

export const pluginStateFormatter = colorBindFactory(pluginStateColor, value => value);
