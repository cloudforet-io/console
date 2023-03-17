import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { AlertDataModel } from '@/services/alert-manager/type';


export interface UpdateAlertParams {
    alertId: string;
    updateParams: any;
}

export const useAlertPageStore = defineStore('alert-page', () => {
    const state = reactive({
        alertData: null as Partial<AlertDataModel>|null,
    });

    /* Actions */
    const getAlertData = async (alertId: string): Promise<void|Error> => {
        try {
            state.alertData = await SpaceConnector.client.monitoring.alert.get({
                alert_id: alertId,
            });
        } catch (e: any) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };
    const updateAlertData = async ({ alertId, updateParams }: UpdateAlertParams): Promise<void|Error> => {
        try {
            state.alertData = await SpaceConnector.client.monitoring.alert.update({
                ...updateParams,
                alert_id: alertId,
            });
        } catch (e: any) {
            ErrorHandler.handleError(e);
            throw e;
        }
    };

    return {
        state,
        getAlertData,
        updateAlertData,
    };
});
