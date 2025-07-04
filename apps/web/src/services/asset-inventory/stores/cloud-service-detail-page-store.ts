import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';


import type { CloudServiceDetailPageParams } from '@/services/asset-inventory/types/cloud-service-detail-page-type';

interface CloudServiceDetailPageState {
    provider: string;
    group: string;
    name: string | undefined;
    searchFilters: ConsoleFilter[];
}

interface CloudServiceDetailPageGetters {
    sheetNamePrefix: ComputedRef<string>;
}


export const useCloudServiceDetailPageStore = defineStore('page-cloud-service-detail', () => {
    const state = reactive<CloudServiceDetailPageState>({
        provider: '' as string,
        group: '' as string,
        name: undefined as undefined | string,
        searchFilters: [] as ConsoleFilter[],
    });
    const getters = reactive<CloudServiceDetailPageGetters>({
        sheetNamePrefix: computed(() => (`${state.provider}_${state.group}_${state.name}`.replace(/\//g, '')).toLowerCase()),
    });

    const mutations = {
        setSearchFilters(searchFilters: ConsoleFilter[]) {
            state.searchFilters = searchFilters;
        },
    };
    const actions = {
        setProviderGroupName({ provider, group, name }: CloudServiceDetailPageParams) {
            state.provider = provider;
            state.group = group;
            state.name = name;
        },
        reset() {
            state.provider = '';
            state.group = '';
            state.name = undefined;
            state.searchFilters = [];
        },
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
