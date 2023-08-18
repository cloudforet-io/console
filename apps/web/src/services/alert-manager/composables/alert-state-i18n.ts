import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { i18n } from '@/translations';

import type { AlertState } from '@/services/alert-manager/lib/config';

export const useAlertStateI18n = (): ComputedRef<Record<AlertState, string>> => computed(() => ({
    TRIGGERED: i18n.global.t('MONITORING.ALERT.ALERT_LIST.TRIGGERED'),
    ACKNOWLEDGED: i18n.global.t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED'),
    RESOLVED: i18n.global.t('MONITORING.ALERT.ALERT_LIST.RESOLVED'),
    ERROR: i18n.global.t('MONITORING.ALERT.ALERT_LIST.ERROR'),
}));
