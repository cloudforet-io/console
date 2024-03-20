import { computed, reactive } from 'vue';

import { find, uniqBy } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { CloudServiceAnalyzeParameters } from '@/schema/inventory/cloud-service/api-verbs/analyze';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CloudServiceTypeItem } from '@/store/reference/cloud-service-type-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getCloudServiceAnalyzeQuery } from '@/services/asset-inventory/helpers/cloud-service-analyze-query-helper';
import type { CloudServiceAnalyzeResult } from '@/services/asset-inventory/types/cloud-service-card-type';

interface CloudServiceTypeListItem {
    provider?: string;
    group?: string;
    items?: CloudServiceTypeItem[];
    titleIcon?: string;
}
export const useSecurityPageStore = defineStore('security-page', () => {
    const allReferenceStore = useAllReferenceStore();
    const allReferenceGetters = allReferenceStore.getters;

    const _getters = reactive({
        cloudServiceType: computed(() => allReferenceGetters.cloudServiceType),
    });

    const state = reactive({
        loading: false,
        searchFilters: [] as ConsoleFilter[],
        cloudServiceAnalyzeList: [] as CloudServiceAnalyzeResult[],
        cloudServiceTypeList: [] as CloudServiceTypeListItem[],
        selectedCloudServiceType: undefined as undefined | CloudServiceTypeItem,
    });

    const getters = reactive({
        loading: computed<boolean>(() => state.loading),
        cloudServiceAnalyzeList: computed<CloudServiceAnalyzeResult[]>(() => state.cloudServiceAnalyzeList),
        cloudServiceTypeList: computed<CloudServiceTypeListItem[]>(() => state.cloudServiceTypeList),
        selectedCloudServiceType: computed<CloudServiceTypeItem|undefined>(() => state.selectedCloudServiceType),
        allFilters: computed<ConsoleFilter[]>(() => {
            const filters: ConsoleFilter[] = [];
            // TODO: will be changed to 'CSPM'
            filters.push({ k: 'ref_cloud_service_type.labels', v: ['Security'], o: '=' });
            return filters.concat(state.searchFilters);
        }),
    });

    const actions = {
        fetchCloudServiceAnalyze: async () => {
            state.loading = true;
            try {
                const { results } = await SpaceConnector.clientV2.inventory.cloudService.analyze<CloudServiceAnalyzeParameters>({
                    query: getCloudServiceAnalyzeQuery(
                        getters.allFilters,
                    ),
                });
                state.cloudServiceAnalyzeList = results || [];
                if (state.cloudServiceAnalyzeList.length > 0) {
                    state.cloudServiceTypeList = state.cloudServiceAnalyzeList.map((listItem) => {
                        const items = Object.values(_getters.cloudServiceType).filter((dataItem) => dataItem.data.group === listItem.cloud_service_group);
                        return {
                            provider: listItem.provider,
                            group: listItem.cloud_service_group,
                            items: uniqBy(items || [], 'name'),
                        };
                    });
                }
            } catch (e) {
                state.cloudServiceAnalyzeList = [];
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        },
        setSelectedCloudServiceType: async (group?: string, name?: string) => {
            if (name) {
                const cloudServiceTypeList = find(state.cloudServiceTypeList, { group });
                state.selectedCloudServiceType = find(cloudServiceTypeList?.items, { name });
            } else if (state.cloudServiceTypeList[0]?.items) {
                state.selectedCloudServiceType = state.cloudServiceTypeList[0]?.items[0];
            }
        },
        initState: () => {
            state.searchFilters = [] as ConsoleFilter[];
            state.cloudServiceAnalyzeList = [] as CloudServiceAnalyzeResult[];
            state.cloudServiceTypeList = [] as CloudServiceTypeListItem[];
            state.selectedCloudServiceType = undefined as undefined | CloudServiceTypeItem;
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
