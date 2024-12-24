import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AlertGetParameters } from '@/schema/alert-manager/alert/api-verbs/get';
import type { AlertUpdateParameters } from '@/schema/alert-manager/alert/api-verbs/update';
import type { AlertModel } from '@/schema/alert-manager/alert/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface AlertDetailPageStoreState {
    alertInfo: AlertModel;
}

export const useAlertDetailPageStore = defineStore('page-alert-detail', () => {
    const state = reactive<AlertDetailPageStoreState>({
        alertInfo: {} as AlertModel,
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
                ErrorHandler.handleError(e, true);
            }
        },
        async updateAlertDetail(param: AlertUpdateParameters): Promise<void|Error> {
            try {
                state.alertInfo = await SpaceConnector.clientV2.alertManager.alert.update<AlertUpdateParameters, AlertModel>(param);
            } catch (e: any) {
                ErrorHandler.handleError(e, true);
            }
        },

    };

    return {
        state,
        ...actions,
    };
});
