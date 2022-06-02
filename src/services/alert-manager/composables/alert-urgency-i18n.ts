import { computed, ComputedRef } from '@vue/composition-api';

import { TranslateResult } from 'vue-i18n';

import { i18n } from '@/translations';

import { AlertUrgency } from '@/services/alert-manager/lib/config';

export const useAlertUrgencyI18n = (): ComputedRef<Record<AlertUrgency, TranslateResult>> => computed(() => ({
    ALL: i18n.t('MONITORING.ALERT.ALERT_LIST.ALL'),
    HIGH: i18n.t('MONITORING.ALERT.ALERT_LIST.HIGH'),
    LOW: i18n.t('MONITORING.ALERT.ALERT_LIST.LOW'),
}));
