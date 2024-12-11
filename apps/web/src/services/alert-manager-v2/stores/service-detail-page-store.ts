import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ServiceGetParameters } from '@/schema/alert-manager/service/api-verbs/get';
import type { ServiceModel } from '@/schema/alert-manager/service/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { SERVICE_DETAIL_TABS } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import type { ServiceDetailTabsType } from '@/services/alert-manager-v2/types/alert-manager-type';

interface ServiceFormStoreState {
    loading: boolean;
    currentTab: ServiceDetailTabsType;
    serviceInfo: ServiceModel;
}

export const useServiceDetailPageStore = defineStore('page-service-detail', () => {
    const state = reactive<ServiceFormStoreState>({
        loading: false,
        currentTab: SERVICE_DETAIL_TABS.OVERVIEW,
        serviceInfo: {} as ServiceModel,
    });
    const mutations = {
        setCurrentTab(currentTab: ServiceDetailTabsType) {
            state.currentTab = currentTab;
        },
    };

    const actions = {
        initState() {
            state.currentTab = SERVICE_DETAIL_TABS.OVERVIEW;
        },
        async fetchServiceDetailData(id: string) {
            state.loading = true;
            try {
                state.serviceInfo = await SpaceConnector.clientV2.alertManager.service.get<ServiceGetParameters, ServiceModel>({
                    service_id: id,
                });
            } catch (e) {
                ErrorHandler.handleError(e, true);
                state.serviceInfo = {} as ServiceModel;
            } finally {
                state.loading = false;
            }
        },
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
