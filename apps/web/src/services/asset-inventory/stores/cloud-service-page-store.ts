import type { ComputedRef } from 'vue';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import { CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/constants/cloud-service-constant';
import type { CloudServiceCategory, CloudServiceFilterMap } from '@/services/asset-inventory/types/cloud-service-page-type';
import type { Period } from '@/services/asset-inventory/types/type';

interface CloudServicePageState {
    selectedProvider: string;
    additionalFilters: CloudServiceFilterMap;
    searchFilters: ConsoleFilter[];
    period: Period | undefined;
}

interface CloudServicePageGetters {
    selectedCategories: ComputedRef<CloudServiceCategory[]>;
    selectedRegions: ComputedRef<string[]>;
    allFilters: ComputedRef<ConsoleFilter[]>;
}

export const useCloudServicePageStore = defineStore('page-cloud-service', () => {
    const state = reactive<CloudServicePageState>({
        selectedProvider: 'all',
        additionalFilters: {
            [CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY]: [],
            [CLOUD_SERVICE_FILTER_KEY.REGION]: [],
        } as CloudServiceFilterMap,
        searchFilters: [] as ConsoleFilter[],
        period: undefined as Period | undefined,
    });

    const getters = reactive<CloudServicePageGetters>({
        selectedCategories: computed(() => state.additionalFilters[CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY] ?? []),
        selectedRegions: computed(() => state.additionalFilters[CLOUD_SERVICE_FILTER_KEY.REGION] ?? []),
        allFilters: computed(() => {
            const filters: ConsoleFilter[] = [
                { k: 'ref_cloud_service_type.labels', v: ['CSPM'], o: '!=' },
            ];
            if (state.selectedProvider !== 'all') {
                filters.push({ k: 'provider', v: state.selectedProvider, o: '=' });
            }
            if (getters.selectedRegions.length) {
                filters.push({ k: CLOUD_SERVICE_FILTER_KEY.REGION, v: getters.selectedRegions, o: '=' });
            }
            if (getters.selectedCategories.length) {
                filters.push({ k: CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY, v: getters.selectedCategories, o: '=' });
            }
            return filters.concat(state.searchFilters);
        }),
    });

    const mutations = {
        setSelectedProvider(provider: string) {
            state.selectedProvider = provider;
        },
        setPeriod(period: Period | undefined) {
            state.period = period;
        },
        setAdditionalFilters(additionalFilters: CloudServiceFilterMap) {
            state.additionalFilters = additionalFilters;
        },
        setSearchFilters(searchFilters: ConsoleFilter[]) {
            state.searchFilters = searchFilters;
        },
    };

    const actions = {
        setSelectedCategoriesToFilters(categories: CloudServiceCategory[] = []) {
            const additionalFilters = { ...state.additionalFilters };
            additionalFilters[CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY] = categories;
            state.additionalFilters = additionalFilters;
        },
        setSelectedRegionsToFilters(regions: string[] = []) {
            const additionalFilters = { ...state.additionalFilters };
            additionalFilters[CLOUD_SERVICE_FILTER_KEY.REGION] = regions;
            state.additionalFilters = additionalFilters;
        },
        reset() {
            state.selectedProvider = 'all';
            state.additionalFilters = {
                [CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY]: [],
                [CLOUD_SERVICE_FILTER_KEY.REGION]: [],
            };
            state.searchFilters = [];
            state.period = undefined;
        },
    };


    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
