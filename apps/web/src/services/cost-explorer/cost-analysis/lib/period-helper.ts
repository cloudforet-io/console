import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { COST_ANALYSIS_PERIOD_TYPE } from '@/services/cost-explorer/cost-analysis/config';
import type { CostAnalysisPeriodType } from '@/services/cost-explorer/cost-analysis/type';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import type { Period, Granularity } from '@/services/cost-explorer/type';


export const getPeriod = (granularity: Granularity, periodType: CostAnalysisPeriodType, period: Period): { start?: Dayjs; end?: Dayjs; } => {
    const today = dayjs.utc();
    if (periodType === COST_ANALYSIS_PERIOD_TYPE.CUSTOM || granularity === GRANULARITY.DAILY) return period;

    // monthly case
    if (periodType === COST_ANALYSIS_PERIOD_TYPE.THIS_MONTH) {
        return {
            start: today.startOf('month'),
            end: today.endOf('month'),
        };
    } if (periodType === COST_ANALYSIS_PERIOD_TYPE.LAST_MONTH) {
        return {
            start: today.subtract(1, 'month').startOf('month'),
            end: today.subtract(1, 'month').endOf('month'),
        };
    } if (periodType === COST_ANALYSIS_PERIOD_TYPE.LAST_3_MONTHS) {
        return {
            start: today.subtract(2, 'month').startOf('month'),
            end: today.endOf('month'),
        };
    } if (periodType === COST_ANALYSIS_PERIOD_TYPE.LAST_6_MONTHS) {
        return {
            start: today.subtract(5, 'month').startOf('month'),
            end: today.endOf('month'),
        };
    } if (periodType === COST_ANALYSIS_PERIOD_TYPE.LAST_12_MONTHS) {
        return {
            start: today.subtract(11, 'month').startOf('month'),
            end: today.endOf('month'),
        };
    }

    // yearly case
    if (periodType === COST_ANALYSIS_PERIOD_TYPE.THIS_YEAR) {
        return {
            start: today.startOf('year'),
            end: today.endOf('year'),
        };
    } if (periodType === COST_ANALYSIS_PERIOD_TYPE.LAST_YEAR) {
        return {
            start: today.subtract(1, 'year').startOf('year'),
            end: today.subtract(1, 'year').endOf('year'),
        };
    } if (periodType === COST_ANALYSIS_PERIOD_TYPE.LAST_3_YEARS) {
        return {
            start: today.subtract(2, 'year').startOf('year'),
            end: today.endOf('year'),
        };
    } if (periodType === COST_ANALYSIS_PERIOD_TYPE.LAST_5_YEARS) {
        return {
            start: today.subtract(4, 'year').startOf('year'),
            end: today.endOf('year'),
        };
    }

    return period;
};
