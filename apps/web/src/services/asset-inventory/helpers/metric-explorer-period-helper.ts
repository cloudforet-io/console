import dayjs from 'dayjs';

import { GRANULARITY, METRIC_PERIOD_MENU, METRIC_PERIOD_MENU_ITEM_MAP } from '@/services/asset-inventory/constants/metric-explorer-constant';
import type {
    Granularity, Period, RelativePeriod, MetricPeriodMenu,
} from '@/services/asset-inventory/types/metric-explorer-type';


export const convertRelativePeriodToPeriod = (granularity: Granularity, relativePeriod: RelativePeriod): Period => {
    const today = dayjs.utc();
    const includeToday = relativePeriod?.include_today;
    const dateFormat = granularity === GRANULARITY.DAILY ? 'YYYY-MM-DD' : 'YYYY-MM';
    if (granularity === GRANULARITY.MONTHLY) {
        if (relativePeriod?.unit === 'year') {
            if (includeToday) {
                return {
                    start: today.subtract(relativePeriod.value, relativePeriod.unit).startOf('year').format(dateFormat),
                    end: today.startOf('month').format(dateFormat),
                };
            }
            return {
                start: today.subtract(relativePeriod.value, relativePeriod.unit).startOf('year').format(dateFormat),
                end: today.subtract(relativePeriod.value, relativePeriod.unit).endOf('year').format(dateFormat),
            };
        }
        return {
            start: today.subtract(relativePeriod.value, relativePeriod.unit).format(dateFormat),
            end: today.subtract(relativePeriod.include_today ? 0 : 1, 'month').format(dateFormat),
        };
    }
    if (includeToday) {
        if (relativePeriod.unit === 'day') {
            return {
                start: today.subtract(relativePeriod.value, 'day').format(dateFormat),
                end: today.format(dateFormat),
            };
        }
    }
    return {
        start: today.subtract(relativePeriod.value, relativePeriod.unit).startOf('month').format(dateFormat),
        end: today.subtract(relativePeriod.value, relativePeriod.unit).endOf('month').format(dateFormat),
    };
};

export const getRefinedDailyPeriod = (yearMonth: string): Period => ({
    start: dayjs.utc(yearMonth).startOf('month').format('YYYY-MM-DD'),
    end: dayjs.utc(yearMonth).endOf('month').format('YYYY-MM-DD'),
});

export const getInitialPeriodByGranularity = (granularity: Granularity): [Period, RelativePeriod|undefined] => {
    let periodMenu: MetricPeriodMenu = METRIC_PERIOD_MENU.LAST_6_MONTHS;
    if (granularity === GRANULARITY.DAILY) {
        periodMenu = METRIC_PERIOD_MENU.LAST_14_DAYS;
    }
    const relativePeriod: RelativePeriod = METRIC_PERIOD_MENU_ITEM_MAP[periodMenu].relativePeriod;
    return [convertRelativePeriodToPeriod(granularity, relativePeriod), relativePeriod];
};
