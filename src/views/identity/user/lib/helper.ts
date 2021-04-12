import { pluginStateColor, userStateColor } from '@/views/identity/user/lib/config';
import {iso8601Formatter} from '@/lib/util';
import dayjs from 'dayjs';

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

export const userStateFormatter = colorBindFactory(userStateColor, value => value.toLowerCase());

export const pluginStateFormatter = colorBindFactory(pluginStateColor, value => value);
