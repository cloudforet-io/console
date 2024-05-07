import { computed, reactive } from 'vue';

import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { durationFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostDataSourceListParameters } from '@/schema/cost-analysis/data-source/api-verbs/list';
import type { CostJobListParameters } from '@/schema/cost-analysis/job/api-verbs/list';
import type { CostJobModel } from '@/schema/cost-analysis/job/model';
import type { DataSourceModel } from '@/schema/monitoring/data-source/model';
import { store } from '@/store';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DataSourceItem, CostJobItem } from '@/services/cost-explorer/types/data-sources-type';

export const useDataSourcesPageStore = defineStore('page-data-sources', () => {
    const allReferenceStore = useAllReferenceStore();
    const allReferenceGetters = allReferenceStore.getters;

    const state = reactive({
        dataSourceList: [] as DataSourceModel[],
        totalCount: 0,
        selectedIndices: [] as number[],
        jobList: [] as CostJobModel[],
    });

    const _getters = reactive({
        plugin: computed(() => allReferenceGetters.plugin),
        timezone: computed(() => store.state.user.timezone),
    });

    const getters = reactive({
        dataSourceList: computed<DataSourceItem[]>(() => state.dataSourceList.map((i) => {
            const icon = _getters.plugin[i.plugin_info?.plugin_id || '']?.icon;
            return {
                ...i,
                icon: assetUrlConverter(icon),
                created_at: dayjs(i.created_at).tz(_getters.timezone).format('YYYY-MM-DD HH:mm:ss'),
            };
        })),
        jobList: computed<CostJobItem[]>(() => (state.jobList.map((i) => ({
            ...i,
            created_at: dayjs(i.created_at).tz(_getters.timezone).format('YYYY-MM-DD HH:mm:ss'),
            duration: durationFormatter(i.created_at, i.finished_at, _getters.timezone) || '--',
        })))),
        selectedItem: computed<DataSourceItem>(() => {
            const item = getters.dataSourceList[state.selectedIndices[0]];
            if (!item) return {} as DataSourceItem;
            const pluginItem = _getters.plugin[item.plugin_info?.plugin_id || ''];
            return {
                ...item,
                description: pluginItem.description,
            };
        }),
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
        fetchJobList: async (dataSourceId: string) => {
            try {
                const { results } = await SpaceConnector.clientV2.costAnalysis.job.list<CostJobListParameters, ListResponse<CostJobModel>>({
                    data_source_id: dataSourceId,
                });
                state.jobList = results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.jobList = [];
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
