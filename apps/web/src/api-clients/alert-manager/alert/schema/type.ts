import type {
    ALERT_SEVERITY, ALERT_STATUS, ALERT_TRIGGERED_TYPE, ALERT_URGENCY,
    ALERT_HISTORY_ACTION,
    ALERT_HISTORY_NOTIFICATION_STATE,
} from '@/api-clients/alert-manager/alert/schema/constants';

export type AlertStatusType = typeof ALERT_STATUS[keyof typeof ALERT_STATUS];
export type AlertUrgencyType = typeof ALERT_URGENCY[keyof typeof ALERT_URGENCY];
export type AlertSeverityType = typeof ALERT_SEVERITY[keyof typeof ALERT_SEVERITY];
export type AlertTriggeredType = typeof ALERT_TRIGGERED_TYPE[keyof typeof ALERT_TRIGGERED_TYPE];

export type AlertHistoryActionType = typeof ALERT_HISTORY_ACTION[keyof typeof ALERT_HISTORY_ACTION];
export type AlertHistoryNotificationStateType = typeof ALERT_HISTORY_NOTIFICATION_STATE[keyof typeof ALERT_HISTORY_NOTIFICATION_STATE];

export type AlertResourcesType = {
    name: string;
    asset_id?: string;
    asset_type?: string;
};

export type AlertHistoryNotificationInfoType = {
    notification_id: string;
    service_channels: AlertHistoryNotificationChannelInfoType[];
    user_channels: AlertHistoryNotificationChannelInfoType[];
    user_group_channels: AlertHistoryNotificationChannelInfoType[];
};

export type AlertHistoryNotificationChannelInfoType = {
    state: AlertHistoryNotificationStateType;
    name: string;
    plugin_id: string;
    error_message?: string;
    user_group_id?: string;
    user_id?: string;
};
