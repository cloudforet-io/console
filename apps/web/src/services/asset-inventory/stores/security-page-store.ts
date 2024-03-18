import { computed, reactive } from 'vue';

import { find } from 'lodash';
import { defineStore } from 'pinia';

import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CloudServiceTypeListParameters } from '@/schema/inventory/cloud-service-type/api-verbs/list';
import type { CloudServiceTypeModel } from '@/schema/inventory/cloud-service-type/model';
import type { CloudServiceAnalyzeParameters } from '@/schema/inventory/cloud-service/api-verbs/analyze';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { getCloudServiceAnalyzeQuery } from '@/services/asset-inventory/helpers/cloud-service-analyze-query-helper';
import { getCloudServiceTypeQuery } from '@/services/asset-inventory/helpers/cloud-service-type-list-helper';
import type { CloudServiceAnalyzeResult } from '@/services/asset-inventory/types/cloud-service-card-type';

interface CloudServiceTypeItem {
    provider: string;
    group: string;
    items: CloudServiceTypeModel[];
    titleIcon: string;
}
export const useSecurityPageStore = defineStore('security-page', () => {
    const state = reactive({
        loading: false,
        searchFilters: [] as ConsoleFilter[],
        cloudServiceAnalyzeList: [] as CloudServiceAnalyzeResult[],
        cloudServiceTypeList: [] as CloudServiceTypeItem[],
        selectedCloudServiceType: undefined as undefined | CloudServiceTypeModel,
    });

    const getters = reactive({
        loading: computed<boolean>(() => state.loading),
        cloudServiceAnalyzeList: computed<CloudServiceAnalyzeResult[]>(() => state.cloudServiceAnalyzeList),
        cloudServiceTypeList: computed<CloudServiceTypeItem[]>(() => state.cloudServiceTypeList),
        selectedCloudServiceType: computed<CloudServiceTypeModel|undefined>(() => state.selectedCloudServiceType),
        allFilters: computed<ConsoleFilter[]>(() => {
            const filters: ConsoleFilter[] = [];
            // TODO: will be changed to 'CSPM'
            filters.push({ k: 'ref_cloud_service_type.labels', v: ['Security'], o: '=' });
            return filters.concat(state.searchFilters);
        }),
    });

    const actions = {
        fetchCloudServiceAnalyze: async (): Promise<CloudServiceAnalyzeResult[] | undefined> => {
            try {
                const { results } = await SpaceConnector.clientV2.inventory.cloudService.analyze<CloudServiceAnalyzeParameters>({
                    query: getCloudServiceAnalyzeQuery(
                        getters.allFilters,
                    ),
                });
                state.cloudServiceAnalyzeList = results;
                return results || [];
            } catch (e) {
                state.cloudServiceAnalyzeList = [];
                ErrorHandler.handleError(e);
                return undefined;
            }
        },
        listCloudServiceTypeData: async (provider: string, group: string) => {
            try {
                const { results } = await SpaceConnector.clientV2.inventory.cloudServiceType.list<CloudServiceTypeListParameters, ListResponse<CloudServiceTypeModel>>({
                    query: getCloudServiceTypeQuery(provider, group),
                });
                const existingGroupIndex = state.cloudServiceTypeList.findIndex((item) => item.group === group);
                if (existingGroupIndex === -1) {
                    const groupObject = {
                        provider,
                        group,
                        items: results || [],
                        titleIcon: Object.values((results || [])[0].tags)[0],
                    };
                    state.cloudServiceTypeList.push(groupObject);
                } else {
                    state.cloudServiceTypeList[existingGroupIndex].items = results || [];
                }
            } catch (e) {
                state.cloudServiceTypeList = [];
                ErrorHandler.handleError(e);
            }
        },
        setSelectedCloudServiceType: async (group?: string, name?: string) => {
            if (name) {
                const cloudServiceTypeList = find(state.cloudServiceTypeList, { group });
                state.selectedCloudServiceType = find(cloudServiceTypeList?.items, { name });
            } else state.selectedCloudServiceType = state.cloudServiceTypeList[0].items[0];
        },
        initState: () => {
            state.searchFilters = [] as ConsoleFilter[];
            state.cloudServiceAnalyzeList = [] as CloudServiceAnalyzeResult[];
            state.cloudServiceTypeList = [] as CloudServiceTypeItem[];
            state.selectedCloudServiceType = undefined as undefined | CloudServiceTypeModel;
        },
    };

    return {
        state,
        getters,
        ...actions,
    };
});
