import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AlertGetParameters } from '@/schema/alert-manager/alert/api-verbs/get';
import type { AlertUpdateParameters } from '@/schema/alert-manager/alert/api-verbs/update';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
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
        async init() {
            state.alertInfo = {} as AlertModel;
        },
        async fetchAlertDetail(alertId: string): Promise<void|Error> {
            try {
                state.alertInfo = await SpaceConnector.clientV2.alertManager.alert.get<AlertGetParameters, AlertModel>({
                    alert_id: alertId,
                });
            } catch (e: any) {
                ErrorHandler.handleError(e);
            }
        },
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
