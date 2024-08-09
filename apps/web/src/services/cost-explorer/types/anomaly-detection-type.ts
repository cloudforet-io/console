import type { NOTIFY_LEVEL, NOTIFICATION_UNIT, NOTIFICATION_VARIATION } from '@/services/cost-explorer/constants/anomaly-detection-constant';

export interface Period {
    start?: string;
    end?: string;
}

export type NotifyLevel = typeof NOTIFY_LEVEL[keyof typeof NOTIFY_LEVEL];

export type NotificationUnit = typeof NOTIFICATION_UNIT[keyof typeof NOTIFICATION_UNIT];

export type NotificationVariation = typeof NOTIFICATION_VARIATION[keyof typeof NOTIFICATION_VARIATION];


export interface NotificationRule {
    threshold: number;
    unit: NotificationUnit;
    variation: NotificationVariation[];
    notifyLevel: NotifyLevel;
}
