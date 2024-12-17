import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { AlertGetParameters } from '@/schema/alert-manager/alert/api-verbs/get';
import type { AlertListParameters } from '@/schema/alert-manager/alert/api-verbs/list';
import type { AlertUpdateParameters } from '@/schema/alert-manager/alert/api-verbs/update';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import type { ServiceListParameters } from '@/schema/alert-manager/service/api-verbs/list';
import type { ServiceModel } from '@/schema/alert-manager/service/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface AlertPageStoreState {
    serviceList: SelectDropdownMenuItem[];
    alertData: Partial<AlertModel>|null;
}
interface UpdateAlertPayload {
    alertId: string;
    updateParams: Omit<AlertUpdateParameters, 'alert_id'>;
}

export const useAlertPageStore = defineStore('page-alert', () => {
    const state = reactive<AlertPageStoreState>({
        serviceList: [],
        alertData: null,
    });
    const actions = {
        async fetchAlertsList(params?: AlertListParameters) {
            try {
                const { results } = await SpaceConnector.clientV2.alertManager.alert.list<AlertListParameters, ListResponse<AlertModel>>(params);
                return results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                throw e;
            }
        },
        async fetchServiceList() {
            try {
                const { results } = await SpaceConnector.clientV2.alertManager.service.list<ServiceListParameters, ListResponse<ServiceModel>>();
                state.serviceList = (results || []).map((i) => ({
                    name: i.service_id,
                    label: i.name,
                }));
            } catch (e) {
                state.serviceList = [];
                ErrorHandler.handleError(e, true);
            }
        },
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
