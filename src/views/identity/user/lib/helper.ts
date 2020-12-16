import { userStateColor } from '@/views/identity/user/lib/config';
import { timestampFormatter } from '@/lib/util';
import dayjs from 'dayjs';

const colorBindFactory = (colorMapping, textFnc) => value => ({
    text: textFnc(value),
    ...colorMapping[value],
});

export const calculateTime = (lastAccessedDay, today, timezone) => {
    const lastAccessedTime = timestampFormatter(lastAccessedDay, timezone);
    const todayTime = timestampFormatter(today, timezone);
    const calculatedTime = dayjs(todayTime).diff(lastAccessedTime, 'day');
    return calculatedTime;
};

export const userStateFormatter = colorBindFactory(userStateColor, value => value.toLowerCase());
