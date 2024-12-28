import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { AlertListParameters } from '@/schema/alert-manager/alert/api-verbs/list';
import type { AlertModel } from '@/schema/alert-manager/alert/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface AlertPageStoreState {
    alertList: AlertModel[]
    totalAlertCount: number;
    alertListParams?: AlertListParameters;
}

export const useAlertPageStore = defineStore('page-alert', () => {
    const allReferenceStore = useAllReferenceStore();
    const allReferenceGetters = allReferenceStore.getters;
    const state = reactive<AlertPageStoreState>({
        alertList: [],
        totalAlertCount: 0,
        alertListParams: undefined,
    });
    const getters = {
        serviceDropdownList: computed<SelectDropdownMenuItem[]>(() => Object.values(allReferenceGetters.service).map((i) => ({
            name: i.name,
            label: i.label,
        }))),
    };
    const mutations = {
        setAlertListParams(params: AlertListParameters) {
            state.alertListParams = params;
        },
    };
    const actions = {
        async init() {
            state.alertList = [];
            state.totalAlertCount = 0;
            state.alertListParams = undefined;
        },
        async fetchAlertsList(params?: AlertListParameters) {
            try {
                const { results, total_count } = await SpaceConnector.clientV2.alertManager.alert.list<AlertListParameters, ListResponse<AlertModel>>(params);
                state.alertList = results || [];
                state.totalAlertCount = total_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.alertList = [];
                state.totalAlertCount = 0;
                throw e;
            }
        },

    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
