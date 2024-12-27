import type { ComputedRef } from 'vue';
import { computed } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import type { AlertUrgency } from '@/schema/monitoring/alert/type';
import { i18n } from '@/translations';


export const useAlertUrgencyI18n = (): ComputedRef<Record<AlertUrgency, TranslateResult>> => computed(() => ({
    ALL: i18n.t('MONITORING.ALERT.ALERT_LIST.ALL'),
    HIGH: i18n.t('MONITORING.ALERT.ALERT_LIST.HIGH'),
    LOW: i18n.t('MONITORING.ALERT.ALERT_LIST.LOW'),
}));
