import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AlertModel } from '@/schema/alert-manager/alert/model';
import type { AlertGetParameters } from '@/schema/monitoring/alert/api-verbs/get';
import type { AlertUpdateParameters } from '@/schema/monitoring/alert/api-verbs/update';

import ErrorHandler from '@/common/composables/error/errorHandler';


interface UpdateAlertPayload {
    alertId: string;
    updateParams: Omit<AlertUpdateParameters, 'alert_id'>;
}

export const useAlertPageStore = defineStore('page-alert', () => {
    const state = reactive({
        alertData: null as Partial<AlertModel>|null,
    });
    const actions = {
        async getAlertData(alertId: string): Promise<void|Error> {
            try {
                state.alertData = await SpaceConnector.clientV2.monitoring.alert.get<AlertGetParameters, AlertModel>({
                    alert_id: alertId,
                });
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        async updateAlertData({ alertId, updateParams }: UpdateAlertPayload): Promise<void|Error> {
            try {
                state.alertData = await SpaceConnector.clientV2.monitoring.alert.update<AlertUpdateParameters, AlertModel>({
                    ...updateParams,
                    alert_id: alertId,
                });
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        async setAlertData(alertData: AlertModel): Promise<void|Error> {
            state.alertData = alertData;
        },

    };

    return {
        state,
        ...actions,
    };
});
