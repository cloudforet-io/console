import { pluginStateColor, userStateColor } from '@/views/identity/user/lib/config';
import { timestampFormatter } from '@/lib/util';
import dayjs from 'dayjs';

const colorBindFactory = (colorMapping, textFnc) => value => ({
    text: textFnc(value),
    ...colorMapping[value],
});

export const calculateTime = (lastAccessedDay, today, timezone) => {
    const lastAccessedTime = timestampFormatter(lastAccessedDay, timezone);
    const todayTime = timestampFormatter(today, timezone);
    let calculatedTime = dayjs(todayTime).diff(lastAccessedTime, 'day');
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(calculatedTime)) calculatedTime = -1;
    return calculatedTime;
};

export const userStateFormatter = colorBindFactory(userStateColor, value => value.toLowerCase());

export const pluginStateFormatter = colorBindFactory(pluginStateColor, value => value);
