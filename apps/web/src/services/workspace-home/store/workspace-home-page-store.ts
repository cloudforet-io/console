import { computed, reactive } from 'vue';

import dayjs from 'dayjs';
import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancallable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { AnalyzeResponse } from '@/schema/_common/api-verbs/analyze';
import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserConfigListParameters } from '@/schema/config/user-config/api-verbs/list';
import type { UserConfigModel } from '@/schema/config/user-config/model';
import type { CostReportConfigListParameters } from '@/schema/cost-analysis/cost-report-config/api-verbs/list';
import type { CostReportConfigModel } from '@/schema/cost-analysis/cost-report-config/model';
import type { CostDataSourceModel } from '@/schema/cost-analysis/data-source/model';
import type { AppListParameters } from '@/schema/identity/app/api-verbs/list';
import type { AppModel } from '@/schema/identity/app/model';
import type { WorkspaceUserListParameters } from '@/schema/identity/workspace-user/api-verbs/list';
import type { WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import type { MetricDataAnalyzeParameters } from '@/schema/inventory/metric-data/api-verbs/analyze';
import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { MENU_ID } from '@/lib/menu/config';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import { RECENT_TYPE } from '@/common/modules/navigations/type';

import type { MetricDataAnalyzeResult } from '@/services/asset-inventory/types/asset-analysis-type';
import { convertFormKeys } from '@/services/workspace-home/composables/use-workspace-home';
import type {
    ProviderReferenceDataMap, ProviderResourceDataItem, DailyUpdatesListItem,
} from '@/services/workspace-home/types/workspace-home-type';


export const useWorkspaceHomePageStore = defineStore('page-workspace-home', () => {
    const userWorkspaceStore = useUserWorkspaceStore();
    const userWorkspaceStoreGetters = userWorkspaceStore.getters;
    const allReferenceStore = useAllReferenceStore();
    const allReferenceGetters = allReferenceStore.getters;

    const state = reactive({
        recentList: [] as UserConfigModel[],
        favoriteMenuList: [] as FavoriteItem[],
        workspaceUserTotalCount: undefined as number|undefined,
        appsTotalCount: undefined as number|undefined,
        costReportConfig: null as CostReportConfigModel|null|undefined,
        dataSource: [] as CostDataSourceModel[],
        providers: [] as ProviderResourceDataItem[],
        dailyUpdatesListItems: {
            created: [],
            deleted: [],
        } as DailyUpdatesListItem,
    });

    const _getters = reactive({
        timezone: computed(() => store.state.user.timezone),
        userId: computed<string>(() => store.state.user.userId),
        currentWorkspaceId: computed<string|undefined>(() => userWorkspaceStoreGetters.currentWorkspaceId),
        providerMap: computed<ProviderReferenceDataMap>(() => allReferenceGetters.provider),
    });

    const recentListApiQuery = new ApiQueryHelper().setSort('updated_at', true);
    const favoriteListApiQuery = new ApiQueryHelper().setSort('updated_at', true);
    const costReportConfigApiHelper = new ApiQueryHelper().setSort('created_at', true);
    const listCountQueryHelper = new ApiQueryHelper().setCountOnly();

    const actions = {
        init: () => {
            state.recentList = [];
            state.favoriteMenuList = [];
            state.workspaceUserTotalCount = undefined;
            state.appsTotalCount = undefined;
            state.costReportConfig = null;
            state.dataSource = [];
        },
        fetchRecentList: async (currentWorkspaceId: string) => {
            recentListApiQuery.setFilters([
                { k: 'user_id', v: _getters.userId, o: '=' },
                { k: 'name', v: 'console:recent:', o: '' },
                { k: 'data.workspace_id', v: currentWorkspaceId, o: '=' },
                { k: 'data.type', v: RECENT_TYPE.WORKSPACE, o: '!=' },
                { k: 'data.id', v: MENU_ID.WORKSPACE_HOME, o: '!=' },
                // NOTE: Code corresponding to data stored as 'home-dashboard'
                { k: 'data.id', v: 'home-dashboard', o: '!=' },
            ]);

            try {
                const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
                    query: recentListApiQuery.data,
                });
                state.recentList = results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.recentList = [];
            }
        },
        fetchFavoriteList: async (selectedItem?: string) => {
            favoriteListApiQuery.setFilters([
                { k: 'user_id', v: _getters.userId, o: '=' },
                { k: 'data.workspaceId', v: _getters.currentWorkspaceId || '', o: '=' },
                { k: 'data.itemType', v: FAVORITE_TYPE.WORKSPACE, o: '!=' },
            ]);
            if (selectedItem === 'All' || !selectedItem) {
                favoriteListApiQuery.addFilter({ k: 'name', v: 'console:favorite:', o: '' });
            } else {
                favoriteListApiQuery.addFilter({ k: 'name', v: `console:favorite:${selectedItem}`, o: '' });
            }
            try {
                const { results } = await SpaceConnector.clientV2.config.userConfig.list<UserConfigListParameters, ListResponse<UserConfigModel>>({
                    query: favoriteListApiQuery.data,
                });
                const _recentList = (results ?? []).map((i) => i.data as FavoriteItem);
                state.favoriteMenuList = _recentList.filter((i) => !i?.isDeleted);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.favoriteMenuList = [];
            }
        },
        fetchWorkspaceUserList: async () => {
            try {
                const { total_count } = await SpaceConnector.clientV2.identity.workspaceUser.list<WorkspaceUserListParameters, ListResponse<WorkspaceUserModel>>({
                    workspace_id: _getters.currentWorkspaceId,
                    query: listCountQueryHelper.data,
                });
                state.workspaceUserTotalCount = total_count || undefined;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        fetchAppList: async () => {
            try {
                const { total_count } = await SpaceConnector.clientV2.identity.app.list<AppListParameters, ListResponse<AppModel>>({
                    workspace_id: _getters.currentWorkspaceId,
                    query: listCountQueryHelper.data,
                });
                state.appsTotalCount = total_count || undefined;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        },
        fetchCostReportConfig: async () => {
            if (state.costReportConfig !== null) return;
            try {
                const { results } = await SpaceConnector.clientV2.costAnalysis.costReportConfig.list<CostReportConfigListParameters, ListResponse<CostReportConfigModel>>({
                    query: costReportConfigApiHelper.data,
                });
                state.costReportConfig = results?.[0];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.costReportConfig = undefined;
            }
        },
        fetchDataSource: async () => {
            try {
                const response = await SpaceConnector.clientV2.costAnalysis.dataSource.list({
                    query: {
                        sort: [{ key: 'workspace_id', desc: false }],
                    },
                });
                state.dataSource = response?.results || [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.dataSource = [];
            }
        },
        fetchCloudServiceResources: async () => {
            const labels = ['Server', 'Database', 'Storage'];

            try {
                await Promise.all(labels.map(async (label) => {
                    const metricId = `metric-managed-${label.toLowerCase()}-${label !== 'Storage' ? 'count' : 'size'}`;
                    const fetcher = getCancellableFetcher<MetricDataAnalyzeParameters, AnalyzeResponse<MetricDataAnalyzeResult>>(SpaceConnector.clientV2.inventory.metricData.analyze);
                    const { status, response } = await fetcher({
                        metric_id: metricId,
                        query: {
                            granularity: 'DAILY',
                            group_by: ['labels.Provider'],
                            start: dayjs.tz(dayjs.utc(), _getters.timezone).subtract(5, 'days').format('YYYY-MM-DD'),
                            end: dayjs.tz(dayjs.utc(), _getters.timezone).format('YYYY-MM-DD'),
                            fields: {
                                count: {
                                    key: 'value',
                                    operator: 'sum',
                                },
                            },
                            sort: [{ key: '_total_count', desc: true }],
                            field_group: ['date'],
                        },
                    });

                    if (status === 'succeed') {
                        (response?.results || []).forEach((i) => {
                            _getters.providerMap[i.Provider][label.toLowerCase()] = i._total_count;
                        });
                    }
                }));
                state.providers = Object.keys(_getters.providerMap).map((key) => _getters.providerMap[key]);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.providers = [];
            }
        },
        fetchDailyUpdatesList: async (): Promise<void> => {
            const labels = ['created', 'deleted'];

            try {
                await Promise.all(labels.map(async (label) => {
                    const metricId = `metric-managed-${label.toLowerCase()}-count`;
                    const fetcher = getCancellableFetcher<MetricDataAnalyzeParameters, AnalyzeResponse<MetricDataAnalyzeResult>>(SpaceConnector.clientV2.inventory.metricData.analyze);
                    const { status, response } = await fetcher({
                        metric_id: metricId,
                        query: {
                            granularity: 'DAILY',
                            group_by: ['labels.Provider', 'labels.Cloud Service Group', 'labels.Cloud Service Type'],
                            start: dayjs.tz(dayjs.utc(), _getters.timezone).format('YYYY-MM-DD'),
                            end: dayjs.tz(dayjs.utc(), _getters.timezone).format('YYYY-MM-DD'),
                            fields: {
                                count: {
                                    key: 'value',
                                    operator: 'sum',
                                },
                            },
                            sort: [{ key: '_total_count', desc: true }],
                            field_group: ['date'],
                        },
                    });

                    if (status === 'succeed') {
                        const results = convertFormKeys(response.results || []);
                        state.dailyUpdatesListItems[label] = results.map((i) => ({
                            cloud_service_group: i.cloud_service_group,
                            cloud_service_type: i.cloud_service_type,
                            total_count: i._total_count,
                            provider: i.provider,
                            [`${label}_count`]: i.count[0].value,
                        }));
                    }
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
                state.dailyUpdatesListItems = { created: state.dailyUpdatesListItems.created || [], deleted: state.dailyUpdatesListItems.deleted || [] };
            }
        },
    };

    return {
        state,
        ...actions,
    };
});
