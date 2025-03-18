import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { AlertState } from '@/schema/monitoring/alert/type';

import type { RouteQueryString } from '@/lib/router-query-string';

import type {
    ALERT_STATE_FILTER, ALERT_ASSIGNED_FILTER,
    ALERT_URGENCY_FILTER,
    ACTION,
} from '@/services/alert-manager/v1/constants/alert-constant';

export type ActionMode = typeof ACTION[keyof typeof ACTION];

export type AlertStateFilter = typeof ALERT_STATE_FILTER[keyof typeof ALERT_STATE_FILTER];
export type AlertUrgencyFilter = typeof ALERT_URGENCY_FILTER[keyof typeof ALERT_URGENCY_FILTER];
export type AlertAssignedFilter = typeof ALERT_ASSIGNED_FILTER[keyof typeof ALERT_ASSIGNED_FILTER];

export interface AlertBottomFilters {
    state: AlertStateFilter;
    urgency: AlertUrgencyFilter;
    assigned: AlertAssignedFilter;
}

export interface AlertListTableFilters extends AlertBottomFilters {
    filters: ConsoleFilter[];
}

export interface AlertStateUpdateParams {
    alerts: string[];
    state: AlertState;
    assignee?: string;
    note?: string;
}

export type AlertListPageUrlQuery = Partial<Record<'state' | 'urgency' | 'assigned' | 'filters', RouteQueryString>>;
