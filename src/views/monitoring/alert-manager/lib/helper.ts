import { ALERT_STATE_FILTER } from '@/views/monitoring/alert-manager/lib/config';

export const alertStateBadgeStyleTypeFormatter = (alertState) => {
    if (alertState === ALERT_STATE_FILTER.TRIGGERED) return 'red100';
    if (alertState === ALERT_STATE_FILTER.ACKNOWLEDGED) return 'blue200';
    return 'gray200';
};
