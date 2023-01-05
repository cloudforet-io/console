import dayjs from 'dayjs';

import type { DateRange } from '@/services/dashboards/config';

export const getInitialDates = (): DateRange => {
    const start = dayjs.utc().startOf('month').format();
    const end = dayjs.utc().endOf('month').format();
    return { start, end };
};
