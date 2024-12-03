import type { ALERT_STATUS_FILTER, ALERT_URGENCY_FILTER } from '@/services/alert-manager-v2/constants/alert-manager-constant';

export type AlertStatusFilterType = typeof ALERT_STATUS_FILTER[keyof typeof ALERT_STATUS_FILTER];
export type AlertUrgencyFilterType = typeof ALERT_URGENCY_FILTER[keyof typeof ALERT_URGENCY_FILTER];
