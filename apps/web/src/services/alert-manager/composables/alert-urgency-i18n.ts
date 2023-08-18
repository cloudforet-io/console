import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { i18n } from '@/translations';

import type { AlertUrgency } from '@/services/alert-manager/lib/config';

export const useAlertUrgencyI18n = (): ComputedRef<Record<AlertUrgency, string>> => computed(() => ({
    ALL: i18n.global.t('MONITORING.ALERT.ALERT_LIST.ALL'),
    HIGH: i18n.global.t('MONITORING.ALERT.ALERT_LIST.HIGH'),
    LOW: i18n.global.t('MONITORING.ALERT.ALERT_LIST.LOW'),
}));
