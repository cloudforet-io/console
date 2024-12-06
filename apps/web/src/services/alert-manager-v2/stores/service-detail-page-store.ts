import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SERVICE_DETAIL_TABS } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import type { ServiceDetailTabsType } from '@/services/alert-manager-v2/types/alert-manager-type';

interface ServiceFormStoreState {
    currentTab: ServiceDetailTabsType;
}

export const useServiceDetailPageStore = defineStore('page-service-detail', () => {
    const state = reactive<ServiceFormStoreState>({
        currentTab: SERVICE_DETAIL_TABS.OVERVIEW,
    });

    const actions = {
        initState() {
            state.currentTab = SERVICE_DETAIL_TABS.OVERVIEW;
        },
        setCurrentTab(currentTab: ServiceDetailTabsType) {
            state.currentTab = currentTab;
        },
    };

    return {
        state,
        ...actions,
    };
});
