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

import { ALERT_PERIOD_DROPDOWN_MENU } from '@/services/alert-manager/v2/constants/alert-table-constant';
import type { Period } from '@/services/alert-manager/v2/types/alert-manager-type';

interface AlertPageStoreState {
    alertList: AlertModel[]
    totalAlertCount: number;
    alertListQuery?: Query;
    selectedServiceId: string;
    selectedStatus: string;
    selectedUrgency: string;
    selectedLabels: SelectDropdownMenuItem[];
    selectedSearchFilter?: string[];
    selectedPeriod: Period;
    selectedPeriodRange: string;
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
        selectedPeriod: { start: undefined, end: undefined },
        selectedPeriodRange: ALERT_PERIOD_DROPDOWN_MENU.ALL,
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
        setSelectedPeriod(period: Period) {
            state.selectedPeriod = period;
        },
        setSelectedPeriodRange(periodRange: string) {
            state.selectedPeriodRange = periodRange;
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
