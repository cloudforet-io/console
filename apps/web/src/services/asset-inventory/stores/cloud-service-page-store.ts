import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderReferenceMap } from '@/store/reference/provider-reference-store';

import { CLOUD_SERVICE_FILTER_KEY, UNIDENTIFIED_PROVIDER } from '@/services/asset-inventory/constants/cloud-service-constant';
import type { CloudServiceCategory, CloudServiceFilterMap } from '@/services/asset-inventory/types/cloud-service-page-type';

export const useCloudServicePageStore = defineStore('page-cloud-service', {
    state: () => ({
        selectedProvider: 'all',
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
            const filters: ConsoleFilter[] = [
                { k: 'ref_cloud_service_type.labels', v: ['CSPM'], o: '!=' },
            ];
            if (state.selectedProvider !== 'all') {
                filters.push({ k: 'provider', v: [state.selectedProvider, 'google'], o: '=' });
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
            const allReferenceStore = useAllReferenceStore();
            const providers: ProviderReferenceMap = allReferenceStore.getters.provider;

            const providerReference = providers[provider];

            if (!providerReference && provider !== UNIDENTIFIED_PROVIDER) {
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
