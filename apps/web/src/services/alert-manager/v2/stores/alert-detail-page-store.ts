import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AlertUpdateParameters } from '@/api-clients/alert-manager/alert/schema/api-verbs/update';
import type { AlertModel } from '@/api-clients/alert-manager/alert/schema/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface AlertDetailPageStoreState {
    alertInfo: AlertModel;
}
interface AlertDetailPageStoreGetters {
    timezone: ComputedRef<string>;
}

export const useAlertDetailPageStore = defineStore('page-alert-detail', () => {
    const userStore = useUserStore();
    const userState = userStore.state;

    const state = reactive<AlertDetailPageStoreState>({
        alertInfo: {} as AlertModel,
    });

    const getters = reactive<AlertDetailPageStoreGetters>({
        timezone: computed(() => userState.timezone || 'UTC'),
    });

    const actions = {
        async updateAlertDetail(param: AlertUpdateParameters): Promise<void|Error> {
            try {
                state.alertInfo = await SpaceConnector.clientV2.alertManager.alert.update<AlertUpdateParameters, AlertModel>(param);
                showSuccessMessage(i18n.t('ALERT_MANAGER.ALERTS.ALT_S_UPDATE'), '');
            } catch (e: any) {
                ErrorHandler.handleError(e, true);
            }
        },

    };

    return {
        state,
        getters,
        ...actions,
    };
});
