import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { AlertListParameters } from '@/schema/alert-manager/alert/api-verbs/list';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import type { ServiceListParameters } from '@/schema/alert-manager/service/api-verbs/list';
import type { ServiceModel } from '@/schema/alert-manager/service/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface AlertPageStoreState {
    alertList: AlertModel[]
    alertListParams?: AlertListParameters;
    serviceList: SelectDropdownMenuItem[];
}

export const useAlertPageStore = defineStore('page-alert', () => {
    const state = reactive<AlertPageStoreState>({
        alertList: [],
        alertListParams: undefined,
        serviceList: [],
    });
    const mutations = {
        setAlertListParams(params: AlertListParameters) {
            state.alertListParams = params;
        },
    };
    const actions = {
        async init() {
            state.alertList = [];
            state.alertListParams = undefined;
            state.serviceList = [];
        },
        async fetchAlertsList(params?: AlertListParameters) {
            try {
                const { results } = await SpaceConnector.clientV2.alertManager.alert.list<AlertListParameters, ListResponse<AlertModel>>(params);
                state.alertList = results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.alertList = [];
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

    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
