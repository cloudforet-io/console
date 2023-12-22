import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';


import type { TimeStamp } from '@/schema/_common/model';
import type { AlertState } from '@/schema/monitoring/alert/model';

import type { RouteQueryString } from '@/lib/router-query-string';

import type {
    ALERT_STATE_FILTER, ASSIGNED_STATE,
    EXTENDED_ALERT_URGENCY,
    ACTION,
} from '@/services/alert-manager/constants/alert-constant';

export type ExtendedAlertUrgency = typeof EXTENDED_ALERT_URGENCY[keyof typeof EXTENDED_ALERT_URGENCY];

export type ActionMode = typeof ACTION[keyof typeof ACTION];


export interface Event {
    additional_info: any;
    alert_id: string;
    created_at: TimeStamp;
    description: string;
    event_id: string;
    event_key: string;
    event_type: string;
    occurred_at: TimeStamp;
    project_id: string;
    raw_data: any;
    resource: any;
    rule: string;
    severity: string;
    title: string;
    webhook_id: string;
}

type AlertStateFilter = typeof ALERT_STATE_FILTER[keyof typeof ALERT_STATE_FILTER];
type AssignedState = typeof ASSIGNED_STATE[keyof typeof ASSIGNED_STATE];
export interface AlertBottomFilters {
    state: AlertStateFilter;
    urgency: ExtendedAlertUrgency;
    assigned: AssignedState;
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
