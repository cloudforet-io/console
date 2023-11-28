import dayjs from 'dayjs';

import { iso8601Formatter } from '@cloudforet/utils';

import {
    pluginStateColor,
    USER_MFA_COLOR,
    userStateColor,
} from '@/services/administration/constants/user-table-constant';

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
export const userMfaFormatter = colorBindFactory(USER_MFA_COLOR, (value) => value.toLowerCase());
export const pluginStateFormatter = colorBindFactory(pluginStateColor, (value) => value);
