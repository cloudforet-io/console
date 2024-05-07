import { computed, reactive } from 'vue';

import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostDataSourceListParameters } from '@/schema/cost-analysis/data-source/api-verbs/list';
import type { DataSourceModel } from '@/schema/monitoring/data-source/model';
import { store } from '@/store';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DataSourceItem } from '@/services/cost-explorer/types/data-sources-type';

export const useDataSourcesPageStore = defineStore('page-data-sources', () => {
    const allReferenceStore = useAllReferenceStore();
    const allReferenceGetters = allReferenceStore.getters;

    const state = reactive({
        dataSourceList: [] as DataSourceModel[],
        totalCount: 0,
        selectedIndices: [] as number[],
    });

    const _getters = reactive({
        provider: computed(() => allReferenceGetters.provider),
        timezone: computed(() => store.state.user.timezone),
    });

    const getters = reactive({
        dataSourceList: computed<DataSourceItem[]>(() => state.dataSourceList.map((i) => {
            const icon = _getters.provider[i.provider].icon;
            return {
                ...i,
                icon: assetUrlConverter(icon),
                created_at: dayjs(i.created_at).tz(_getters.timezone).format('YYYY-MM-DD HH:mm:ss'),
            };
        })),
        selectedItem: computed<DataSourceItem>(() => getters.dataSourceList[state.selectedIndices[0]]),
    });

    const mutation = {
        setSelectedIndices: (indices: number[]) => {
            state.selectedIndices = indices;
        },
    };

    const actions = {
        fetchDataSourceList: async () => {
            try {
                const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.dataSource.list<CostDataSourceListParameters, ListResponse<DataSourceModel>>();
                state.dataSourceList = results || [];
                state.totalCount = total_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.dataSourceList = [];
                state.totalCount = 0;
            }
        },
    };

    return {
        state,
        getters,
        ...mutation,
        ...actions,
    };
});
