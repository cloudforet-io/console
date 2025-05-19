import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import type { AlertState } from '@/api-clients/monitoring/alert/schema/type';
import { i18n } from '@/translations';


export const useAlertStateI18n = (): ComputedRef<Record<AlertState, TranslateResult>> => computed(() => ({
    TRIGGERED: i18n.t('MONITORING.ALERT.ALERT_LIST.TRIGGERED'),
    ACKNOWLEDGED: i18n.t('MONITORING.ALERT.ALERT_LIST.ACKNOWLEDGED'),
    RESOLVED: i18n.t('MONITORING.ALERT.ALERT_LIST.RESOLVED'),
    ERROR: i18n.t('MONITORING.ALERT.ALERT_LIST.ERROR'),
}));
