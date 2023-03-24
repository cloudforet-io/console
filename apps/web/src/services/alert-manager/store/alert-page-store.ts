import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { AlertDataModel } from '@/services/alert-manager/type';


export interface UpdateAlertParams {
    alertId: string;
    updateParams: any;
}

export const useAlertPageStore = defineStore('alert-page', {
    state: () => ({
        alertData: null as Partial<AlertDataModel>|null,
    }),
    actions: {
        async getAlertData(alertId: string): Promise<void|Error> {
            try {
                this.alertData = await SpaceConnector.client.monitoring.alert.get({
                    alert_id: alertId,
                });
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        async updateAlertData({ alertId, updateParams }: UpdateAlertParams): Promise<void|Error> {
            try {
                this.alertData = await SpaceConnector.client.monitoring.alert.update({
                    ...updateParams,
                    alert_id: alertId,
                });
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
    },
});
