import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { AlertAssignUserParameters } from '@/schema/monitoring/alert/api-verbs/assign-user';
import type { AlertGetParameters } from '@/schema/monitoring/alert/api-verbs/get';
import type { AlertUpdateParameters } from '@/schema/monitoring/alert/api-verbs/update';
import type { AlertModel } from '@/schema/monitoring/alert/model';

import ErrorHandler from '@/common/composables/error/errorHandler';


interface UpdateAlertPayload {
    alertId: string;
    updateParams: Omit<AlertUpdateParameters, 'alert_id'>;
}

export const useAlertPageStore = defineStore('alert-page', {
    state: () => ({
        alertData: null as Partial<AlertModel>|null,
    }),
    actions: {
        async getAlertData(alertId: string): Promise<void|Error> {
            try {
                this.alertData = await SpaceConnector.clientV2.monitoring.alert.get<AlertGetParameters, AlertModel>({
                    alert_id: alertId,
                });
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        async updateAlertData({ alertId, updateParams }: UpdateAlertPayload): Promise<void|Error> {
            try {
                this.alertData = await SpaceConnector.clientV2.monitoring.alert.update<AlertUpdateParameters, AlertModel>({
                    ...updateParams,
                    alert_id: alertId,
                });
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        async assignUserToAlert(alertId: string, assignee: string): Promise<void|Error> {
            try {
                this.alertData = await SpaceConnector.clientV2.monitoring.alert.assignUser<AlertAssignUserParameters, AlertModel>({
                    alert_id: alertId,
                    assignee,
                });
            } catch (e: any) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
    },
});
