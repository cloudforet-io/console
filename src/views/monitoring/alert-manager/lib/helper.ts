import { ALERT_STATE_FILTER, SCOPE } from '@/views/monitoring/alert-manager/lib/config';

export const alertStateBadgeStyleTypeFormatter = (alertState) => {
    if (alertState === ALERT_STATE_FILTER.TRIGGERED) return 'red100';
    if (alertState === ALERT_STATE_FILTER.ACKNOWLEDGED) return 'blue200';
    return 'gray200';
};

export const alertScopeBadgeStyleTypeFormatter = (scope) => {
    if (scope === SCOPE.global) return 'green200';
    return 'primary3';
};
