import dayjs from 'dayjs';

import { iso8601Formatter } from '@cloudforet/utils';

export const calculateTime = (lastAccessedDay, timezone) => {
    const today = dayjs().toISOString();
    const lastAccessedTime = iso8601Formatter(lastAccessedDay, timezone);
    const todayTime = iso8601Formatter(today, timezone);
    let calculatedTime = dayjs(todayTime).diff(lastAccessedTime, 'day');
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(calculatedTime)) calculatedTime = -1;
    return calculatedTime;
};
