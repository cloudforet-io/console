import dayjs from 'dayjs';

import type { AlertRelativePeriod, Period } from '@/services/alert-manager/v2/types/alert-manager-type';

export const convertRelativePeriodToPeriod = (alertRelativePeriod: AlertRelativePeriod): Period => {
    const today = dayjs.utc();
    return {
        start: today.subtract(alertRelativePeriod.value, 'month').format('YYYY-MM-DD'),
    };
};
