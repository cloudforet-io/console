import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import dayjs from 'dayjs';

import { iso8601Formatter } from '@cloudforet/utils';

import { ALERT_STATUS } from '@/schema/alert-manager/alert/constants';
import type { AlertStatusType, AlertUrgencyType } from '@/schema/alert-manager/alert/type';
import { i18n } from '@/translations';

export const getAlertStateI18n = (): ComputedRef<Record<AlertStatusType, TranslateResult>> => computed(() => ({
    ALL: i18n.t('ALERT_MANAGER.ALERTS.ALL'),
    TRIGGERED: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'),
    ACKNOWLEDGED: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'),
    RESOLVED: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'),
    IGNORED: i18n.t('ALERT_MANAGER.ALERTS.IGNORED'),
}));

export const getAlertUrgencyI18n = (): ComputedRef<Record<AlertUrgencyType, TranslateResult>> => computed(() => ({
    ALL: i18n.t('ALERT_MANAGER.ALERTS.ALL'),
    HIGH: i18n.t('ALERT_MANAGER.ALERTS.HIGH'),
    LOW: i18n.t('ALERT_MANAGER.ALERTS.LOW'),
}));

export const alertStatusBadgeStyleTypeFormatter = (alertState) => {
    let style = '';
    switch (alertState) {
    case ALERT_STATUS.TRIGGERED:
        style = 'alert';
        break;
    case ALERT_STATUS.ACKNOWLEDGED:
        style = 'primary3';
        break;
    case ALERT_STATUS.RESOLVED:
        style = 'gray200';
        break;
    case ALERT_STATUS.IGNORED:
        style = 'red200';
        break;
    default: style = '';
        break;
    }
    return style;
};

export const calculateTime = (time: string, timezone: string): string => {
    const today = dayjs().toISOString();
    const createdTime = iso8601Formatter(time, timezone);
    const todayTime = iso8601Formatter(today, timezone);
    const timeForCalculate = dayjs(todayTime).diff(createdTime, 'minute');
    const days = Math.floor((timeForCalculate / 1440) % 365);
    const hours = Math.floor((timeForCalculate / 60) % 24);
    const minutes = Math.floor(timeForCalculate % 60);
    let result = '';

    if (days > 0) {
        result += `${days}d `;
    }
    if (hours > 0) {
        result += `${hours}h `;
    }
    if (minutes > 0) {
        result += `${minutes}m`;
    }

    return result.trim();
};
