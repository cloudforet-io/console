import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { ALERT_PERIOD_DROPDOWN_MENU } from '@/services/alert-manager/v2/constants/alert-table-constant';
import type { Period } from '@/services/alert-manager/v2/types/alert-manager-type';

interface AlertPageStoreState {
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

    return {
        state,
        getters,
        ...mutations,
    };
});
