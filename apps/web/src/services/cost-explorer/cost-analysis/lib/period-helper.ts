import dayjs from 'dayjs';

import type { RelativePeriod } from '@/services/cost-explorer/cost-analysis/type';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import type { Granularity, Period, CostQuerySetOptionForPeriod } from '@/services/cost-explorer/type';


export const convertRelativePeriodToPeriod = (costQueryOption: CostQuerySetOptionForPeriod): { start: string; end: string; } => {
    const today = dayjs.utc();
    const includeToday = costQueryOption?.relativePeriod?.include_today;
    if (costQueryOption?.granularity === GRANULARITY.MONTHLY) {
        if (costQueryOption?.relativePeriod?.unit === 'year') {
            if (includeToday) {
                return {
                    start: today.subtract(costQueryOption?.relativePeriod.value, costQueryOption?.relativePeriod.unit).startOf('year')
                        .format('YYYY-MM'),
                    end: today.startOf('month').format('YYYY-MM'),
                };
            }
            return {
                start: today.subtract(costQueryOption?.relativePeriod.value, costQueryOption?.relativePeriod.unit).startOf('year')
                    .format('YYYY-MM'),
                end: today.subtract(costQueryOption?.relativePeriod.value, costQueryOption?.relativePeriod.unit).endOf('year')
                    .format('YYYY-MM'),
            };
        }
        return {
            start: today.subtract(costQueryOption?.relativePeriod.value, costQueryOption?.relativePeriod.unit)
                .format('YYYY-MM'),
            end: today.subtract(costQueryOption?.relativePeriod.include_today ? 0 : 1, 'month')
                .format('YYYY-MM'),
        };
    }
    if (costQueryOption?.granularity === GRANULARITY.YEARLY) {
        return {
            start: today.subtract(costQueryOption?.relativePeriod.value, costQueryOption?.relativePeriod.unit)
                .format('YYYY'),
            end: today.subtract(costQueryOption?.relativePeriod.include_today ? 0 : 1, 'year')
                .format('YYYY'),
        };
    }
    if (includeToday) {
        return {
            start: today.subtract(costQueryOption?.relativePeriod.value, 'month').startOf('month')
                .format('YYYY-MM-DD'),
            end: today.format('YYYY-MM-DD'),
        };
    }
    return {
        start: today.subtract(costQueryOption?.relativePeriod.value, costQueryOption?.relativePeriod.unit).startOf('month')
            .format('YYYY-MM-DD'),
        end: today.subtract(costQueryOption?.relativePeriod.value, costQueryOption?.relativePeriod.unit).endOf('month')
            .format('YYYY-MM-DD'),
    };
};
export const initiatePeriodByGranularity = (granularity?: Granularity): [Period, RelativePeriod|undefined] => {
    if (granularity === GRANULARITY.DAILY) {
        const thisMonthRelativePeriod: RelativePeriod = { unit: 'month', value: 0, include_today: true };
        return [convertRelativePeriodToPeriod({
            relativePeriod: thisMonthRelativePeriod,
            granularity,
        }), thisMonthRelativePeriod];
    } if (granularity === GRANULARITY.YEARLY) {
        const thisYearRelativePeriod:RelativePeriod = { unit: 'year', value: 2, include_today: true };
        return [convertRelativePeriodToPeriod({
            relativePeriod: thisYearRelativePeriod,
            granularity,
        }), thisYearRelativePeriod];
    } if (granularity === GRANULARITY.MONTHLY) {
        const last6MonthsRelativePeriod: RelativePeriod = { unit: 'month', value: 5, include_today: true };
        return [convertRelativePeriodToPeriod({
            relativePeriod: last6MonthsRelativePeriod,
            granularity,
        }), last6MonthsRelativePeriod];
    }
    return [{}, undefined];
};
