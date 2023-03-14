import { computed, reactive } from 'vue';

import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@/query/type';
import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/cloud-service/lib/config';
import type { CloudServiceCategory, CloudServiceFilterMap, Period } from '@/services/asset-inventory/cloud-service/type';


export const useCloudServicePageStore = defineStore('cloud-service-page', () => {
    const state = reactive({
        selectedProvider: 'all',
        period: undefined as undefined | Period,
        additionalFilters: {
            [CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY]: [],
            [CLOUD_SERVICE_FILTER_KEY.REGION]: [],
        } as CloudServiceFilterMap,
        searchFilters: [] as ConsoleFilter[],
    });

    const getters = reactive({
        selectedCategories: computed<CloudServiceCategory[]>(() => state.additionalFilters[CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY] ?? []),
        selectedRegions: computed<string[]>(() => state.additionalFilters[CLOUD_SERVICE_FILTER_KEY.REGION] ?? []),
        allFilters: computed<ConsoleFilter[]>(() => {
            const filters: ConsoleFilter[] = [];
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

    /* Actions */
    const setSelectedProvider = async (provider = 'all') => {
        let providers: ProviderReferenceMap = store.getters['reference/providerItems'];
        if (isEmpty(providers)) {
            await store.dispatch('reference/provider/load', undefined, { root: true });
            providers = store.getters['reference/providerItems'];
        }

        const providerReference = providers[provider];
        if (!providerReference) {
            state.selectedProvider = 'all';
            return;
        }

        state.selectedProvider = provider;
    };

    const setSelectedCategoriesToFilters = (categories: CloudServiceCategory[] = []) => {
        const additionalFilters = { ...state.additionalFilters };
        additionalFilters[CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY] = categories;
        state.additionalFilters = additionalFilters;
    };

    const setSelectedRegionsToFilters = (regions: string[] = []) => {
        const additionalFilters = { ...state.additionalFilters };
        additionalFilters[CLOUD_SERVICE_FILTER_KEY.REGION] = regions;
        state.additionalFilters = additionalFilters;
    };

    return {
        state,
        getters,
        setSelectedProvider,
        setSelectedCategoriesToFilters,
        setSelectedRegionsToFilters,
    };
});
