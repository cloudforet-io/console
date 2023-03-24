import { isEmpty } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { CLOUD_SERVICE_FILTER_KEY } from '@/services/asset-inventory/cloud-service/lib/config';
import type { CloudServiceCategory, CloudServiceFilterMap, Period } from '@/services/asset-inventory/cloud-service/type';


export const useCloudServicePageStore = defineStore('cloud-service-page', {
    state: () => ({
        selectedProvider: 'all',
        period: undefined as undefined | Period,
        additionalFilters: {
            [CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY]: [],
            [CLOUD_SERVICE_FILTER_KEY.REGION]: [],
        } as CloudServiceFilterMap,
        searchFilters: [] as ConsoleFilter[],
    }),
    getters: {
        selectedCategories: (state): CloudServiceCategory[] => state.additionalFilters[CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY] ?? [],
        selectedRegions: (state): string[] => state.additionalFilters[CLOUD_SERVICE_FILTER_KEY.REGION] ?? [],
        allFilters(state): ConsoleFilter[] {
            const filters: ConsoleFilter[] = [];
            if (state.selectedProvider !== 'all') {
                filters.push({ k: 'provider', v: state.selectedProvider, o: '=' });
            }
            if (this.selectedRegions.length) {
                filters.push({ k: CLOUD_SERVICE_FILTER_KEY.REGION, v: this.selectedRegions, o: '=' });
            }
            if (this.selectedCategories.length) {
                filters.push({ k: CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY, v: this.selectedCategories, o: '=' });
            }
            return filters.concat(state.searchFilters);
        },
    },
    actions: {
        async setSelectedProvider(provider = 'all') {
            let providers: ProviderReferenceMap = store.getters['reference/providerItems'];
            if (isEmpty(providers)) {
                await store.dispatch('reference/provider/load', undefined, { root: true });
                providers = store.getters['reference/providerItems'];
            }

            const providerReference = providers[provider];
            if (!providerReference) {
                this.selectedProvider = 'all';
                return;
            }

            this.selectedProvider = provider;
        },
        setSelectedCategoriesToFilters(categories: CloudServiceCategory[] = []) {
            const additionalFilters = { ...this.additionalFilters };
            additionalFilters[CLOUD_SERVICE_FILTER_KEY.SERVICE_CATEGORY] = categories;
            this.additionalFilters = additionalFilters;
        },
        setSelectedRegionsToFilters(regions: string[] = []) {
            const additionalFilters = { ...this.additionalFilters };
            additionalFilters[CLOUD_SERVICE_FILTER_KEY.REGION] = regions;
            this.additionalFilters = additionalFilters;
        },
    },
});
