import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { ALERT_STATUS } from '@/schema/alert-manager/alert/constants';
import type { AlertStatusType, AlertUrgencyType } from '@/schema/alert-manager/alert/type';
import { i18n } from '@/translations';

export const getAlertStateI18n = (): ComputedRef<Record<AlertStatusType, TranslateResult>> => computed(() => ({
    ALL: i18n.t('ALERT_MANAGER.ALERTS.ALL'),
    TRIGGERED: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'),
    ACKNOWLEDGED: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'),
    RESOLVED: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'),
    ERROR: i18n.t('ALERT_MANAGER.ALERTS.ERROR'),
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
    case ALERT_STATUS.ERROR:
        style = 'red200';
        break;
    default: style = '';
        break;
    }
    return style;
};
