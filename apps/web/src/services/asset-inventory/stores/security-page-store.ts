import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import type { CloudServiceTypeModel } from '@/api-clients/inventory/cloud-service-type/schema/model';


interface SecurityPageState {
    searchFilters: ConsoleFilter[];
    selectedCloudServiceType?: CloudServiceTypeModel;
}
interface SecurityPageGetters {
    selectedCloudServiceType: ComputedRef<CloudServiceTypeModel | undefined>;
    allFilters: ComputedRef<ConsoleFilter[]>;
}

export const useSecurityPageStore = defineStore('page-security', () => {
    const state = reactive<SecurityPageState>({
        searchFilters: [] as ConsoleFilter[],
        selectedCloudServiceType: undefined as undefined | CloudServiceTypeModel,
    });

    const getters = reactive<SecurityPageGetters>({
        selectedCloudServiceType: computed<CloudServiceTypeModel|undefined>(() => state.selectedCloudServiceType),
        allFilters: computed<ConsoleFilter[]>(() => {
            const filters: ConsoleFilter[] = [];
            filters.push({ k: 'ref_cloud_service_type.labels', v: ['CSPM'], o: '=' });
            return filters.concat(state.searchFilters);
        }),
    });

    const mutations = {
        setSelectedCloudServiceType: (cloudServiceType?: CloudServiceTypeModel) => {
            state.selectedCloudServiceType = cloudServiceType;
        },
    };

    const actions = {
        initState: () => {
            state.searchFilters = [] as ConsoleFilter[];
            state.selectedCloudServiceType = undefined as undefined | CloudServiceTypeModel;
        },
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
