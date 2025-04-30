// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Query } from '@cloudforet/core-lib/space-connector/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { AlertListParameters } from '@/schema/alert-manager/alert/api-verbs/list';
import type { AlertModel } from '@/schema/alert-manager/alert/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface AlertPageStoreState {
    alertList: AlertModel[]
    totalAlertCount: number;
    alertListQuery?: Query;
    selectedServiceId: string;
    selectedStatus: string;
    selectedUrgency: string;
    selectedLabels: SelectDropdownMenuItem[];
    selectedSearchFilter?: string[];
}

export const useAlertPageStore = defineStore('page-alert', () => {
    const allReferenceStore = useAllReferenceStore();
    const allReferenceGetters = allReferenceStore.getters;
    const state = reactive<AlertPageStoreState>({
        alertList: [],
        totalAlertCount: 0,
        alertListQuery: undefined,
        selectedServiceId: '',
        selectedStatus: 'OPEN',
        selectedUrgency: 'ALL',
        selectedLabels: [],
        selectedSearchFilter: undefined,
    });
    const getters = {
        serviceDropdownList: computed<SelectDropdownMenuItem[]>(() => Object.values(allReferenceGetters.service).map((d) => ({
            name: d.name,
            label: d.label,
        }))),
    };
    const mutations = {
        setAlertListQuery(query: Query) {
            state.alertListQuery = query;
        },
        setSelectedServiceId(serviceId: string) {
            state.selectedServiceId = serviceId;
        },
        setSelectedStatus(status: string) {
            state.selectedStatus = status;
        },
        setSelectedUrgency(urgency: string) {
            state.selectedUrgency = urgency;
        },
        setSelectedLabels(labels?: string) {
            if (!labels) {
                state.selectedLabels = [];
                return;
            }
            state.selectedLabels = [{ name: labels, label: labels }];
        },
        setSelectedSearchFilter(searchFilter?: string[]) {
            state.selectedSearchFilter = searchFilter;
        },
    };
    const actions = {
        async init() {
            state.alertList = [];
            state.totalAlertCount = 0;
            state.alertListQuery = undefined;
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
