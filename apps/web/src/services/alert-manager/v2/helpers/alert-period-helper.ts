import dayjs from 'dayjs';

import type { AlertRelativePeriod, Period } from '@/services/alert-manager/v2/types/alert-manager-type';

export const convertRelativePeriodToPeriod = (alertRelativePeriod: AlertRelativePeriod): Period => {
    const today = dayjs.utc();
    return {
        start: today.subtract(alertRelativePeriod.value, 'month').format('YYYY-MM-DD'),
    };
};

export const initiatePeriodByGranularity = (): [Period, AlertRelativePeriod|undefined] => {
    const last1MonthsRelativePeriod: AlertRelativePeriod = { value: 1 };
    return [convertRelativePeriodToPeriod(last1MonthsRelativePeriod), last1MonthsRelativePeriod];
};
