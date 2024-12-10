import type {
    NOTIFICATION_URGENCY, RECOVERY_MODE, MEMBERS_TYPE, ALERTS_TYPE,
} from '@/schema/alert-manager/service/constants';

export type NotificationUrgencyType = typeof NOTIFICATION_URGENCY[keyof typeof NOTIFICATION_URGENCY];
export type RecoveryModeType = typeof RECOVERY_MODE[keyof typeof RECOVERY_MODE];
export type MembersType = typeof MEMBERS_TYPE[keyof typeof MEMBERS_TYPE];
export type AlertsType = typeof ALERTS_TYPE[keyof typeof ALERTS_TYPE];

export type ServiceOptionsType = {
    notification_urgency: NotificationUrgencyType;
    recovery_mode: RecoveryModeType;
};
export type AlertsInfoType = {
    high: number;
    low: number;
};
