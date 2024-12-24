import type {
    ALERT_SEVERITY, ALERT_STATE, ALERT_TRIGGERED_TYPE, ALERT_URGENCY,
    ALERT_EVENT_ACTION,
} from '@/schema/alert-manager/alert/constants';

export type AlertStateType = typeof ALERT_STATE[keyof typeof ALERT_STATE];
export type AlertUrgencyType = typeof ALERT_URGENCY[keyof typeof ALERT_URGENCY];
export type AlertSeverityType = typeof ALERT_SEVERITY[keyof typeof ALERT_SEVERITY];
export type AlertTriggeredType = typeof ALERT_TRIGGERED_TYPE[keyof typeof ALERT_TRIGGERED_TYPE];

export type AlertEventActionType = typeof ALERT_EVENT_ACTION[keyof typeof ALERT_EVENT_ACTION];

export type AlertResourcesType = {
    name: string;
    asset_id?: string;
    asset_type?: string;
};
