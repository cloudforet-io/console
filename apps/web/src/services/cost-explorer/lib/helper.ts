import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import dayjs from 'dayjs';

import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import type {
    Period, Granularity,
} from '@/services/cost-explorer/type';


export const getTimeUnitByGranularity = (granularity: Granularity): TimeUnit => {
    if (granularity === GRANULARITY.YEARLY) return 'year';
    if (granularity === GRANULARITY.MONTHLY) return 'month';
    return 'day';
};
export const getPeriodByGranularity = (granularity: Granularity, period: Period): Period => {
    if (granularity === GRANULARITY.DAILY) {
        return {
            start: dayjs.utc(period.start).startOf('month').format('YYYY-MM-DD'),
            end: dayjs.utc(period.end).endOf('month').format('YYYY-MM-DD'),
        };
    }
    return period;
};
