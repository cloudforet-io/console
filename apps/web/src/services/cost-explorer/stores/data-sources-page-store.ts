import { computed, reactive } from 'vue';

import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { durationFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { CostDataSourceAccountListParameters } from '@/schema/cost-analysis/data-source-account/api-verbs/list';
import type { CostDataSourceAccountModel } from '@/schema/cost-analysis/data-source-account/model';
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
        activeTab: 'detail',
        dataSourceList: [] as DataSourceModel[],
        dataSourceListTotalCount: 0,
        selectedIndices: [] as number[],
        jobList: [] as CostJobModel[],
        jobListTotalCount: 0,
        linkedAccounts: [] as CostDataSourceAccountModel[],
        linkedAccountsTotalCount: 0,
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
        linkedAccounts: computed<CostDataSourceAccountModel[]>(() => (state.linkedAccounts.map((i) => ({
            ...i,
            updated_at: dayjs(i.updated_at).tz(_getters.timezone).format('YYYY-MM-DD HH:mm:ss'),
        })))),
        selectedItem: computed<DataSourceItem>(() => {
            if (state.selectedIndices.length === 0) return {} as DataSourceItem;
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
        setActiveTab: (tab: string) => {
            state.activeTab = tab;
        },
    };

    const actions = {
        fetchDataSourceList: async () => {
            try {
                const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.dataSource.list<CostDataSourceListParameters, ListResponse<DataSourceModel>>();
                state.dataSourceList = results || [];
                state.dataSourceListTotalCount = total_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.dataSourceList = [];
                state.dataSourceListTotalCount = 0;
            }
        },
        fetchJobList: async (params: CostJobListParameters) => {
            try {
                const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.job.list<CostJobListParameters, ListResponse<CostJobModel>>(params);
                state.jobList = results || [];
                state.jobListTotalCount = total_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.jobList = [];
                state.jobListTotalCount = 0;
            }
        },
        fetchLinkedAccount: async (params: CostJobListParameters) => {
            try {
                const { results, total_count } = await SpaceConnector.clientV2.costAnalysis.dataSourceAccount.list<CostDataSourceAccountListParameters, ListResponse<CostDataSourceAccountModel>>(
                    params,
                );
                console.log({ results });
                state.linkedAccounts = results || [];
                state.linkedAccountsTotalCount = total_count || 0;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.linkedAccounts = [];
                state.linkedAccountsTotalCount = 0;
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
