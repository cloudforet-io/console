import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { NamespaceGroupListParameters } from '@/schema/inventory-v2/namespace-group/api-verbs/list';
import type { NamespaceGroupModel } from '@/schema/inventory-v2/namespace-group/model';
import type { NamespaceGetParameters } from '@/schema/inventory-v2/namespace/api-verbs/get';
import type { NamespaceListParameters } from '@/schema/inventory-v2/namespace/api-verbs/list';
import type { NamespaceModel } from '@/schema/inventory-v2/namespace/model';
import type { MetricExampleListParameters } from '@/schema/inventory/metric-example/api-verbs/list';
import type { MetricExampleModel } from '@/schema/inventory/metric-example/model';
import type { MetricListParameters } from '@/schema/inventory/metric/api-verbs/list';
import type { MetricModel } from '@/schema/inventory/metric/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface MetricExplorerLSBPageStoreState {
    loading: boolean;
    namespaceLoadingMap: Record<string, boolean>;
    metricLoading: boolean;
    namespaceGroupList: NamespaceGroupModel[];
    currentNamespace?: NamespaceModel;
    namespaceMap: Record<string, NamespaceModel[]>
    namespaceMapByKeywordSearch: Record<string, NamespaceModel[]>
    metricList: MetricModel[];
    metricExampleList: MetricExampleModel[];
    selectedNamespaceId?: string;
}

export const useMetricExplorerLSBStore = defineStore('metric-explorer-l-s-b', () => {
    const appContextStore = useAppContextStore();

    const _getters = reactive({
        isAdminMode: computed<boolean>(() => appContextStore.getters.isAdminMode),
    });

    const state = reactive<MetricExplorerLSBPageStoreState>({
        // loading
        loading: false,
        namespaceLoadingMap: {},
        metricLoading: false,
        // data
        namespaceGroupList: [],
        currentNamespace: undefined,
        namespaceMap: {},
        namespaceMapByKeywordSearch: {},
        metricList: [],
        metricExampleList: [],
        selectedNamespaceId: undefined,
    });
    const getters = reactive({
        selectedNamespaceId: computed<string|undefined>(() => state.selectedNamespace?.namespace_id),
    });

    /* Mutations */
    const setSelectedNamespaceId = (namespaceId: string) => {
        state.selectedNamespaceId = namespaceId;
    };

    /* Actions */
    const reset = () => {
        state.loading = false;
        state.namespaceLoadingMap = {};
        state.metricLoading = false;
        state.namespaceGroupList = [];
        state.namespaceMap = {};
        state.metricList = [];
    };
    const loadNamespaceGroupListFetcher = getCancellableFetcher<NamespaceGroupListParameters, ListResponse<NamespaceGroupModel>>(SpaceConnector.clientV2.inventoryV2.namespaceGroup.list);
    const loadNamespaceGroupList = async () => {
        try {
            state.loading = true;
            const { status, response } = await loadNamespaceGroupListFetcher({});
            if (status === 'succeed') {
                state.namespaceGroupList = response.results || [];
            }
        } catch (e) {
            state.namespaceGroupList = [];
            ErrorHandler.handleError(e);
        } finally {
            state.loading = false;
        }
    };
    const loadNamespaceGetFetcher = getCancellableFetcher<NamespaceGetParameters, NamespaceModel>(SpaceConnector.clientV2.inventoryV2.namespace.get);
    const loadNamespace = async (namespaceId: string) => {
        const getParams: NamespaceGetParameters = {
            namespace_id: namespaceId,
        };
        try {
            const { status, response } = await loadNamespaceGetFetcher(getParams);
            if (status === 'succeed') {
                state.currentNamespace = response;
            }
        } catch (e) {
            state.currentNamespace = undefined;
            ErrorHandler.handleError(e);
        }
    };
    const loadNamespaceListFetcher = getCancellableFetcher<NamespaceListParameters, ListResponse<NamespaceModel>>(SpaceConnector.clientV2.inventoryV2.namespace.list);
    const loadNamespaceListByNamespaceGroupId = async (namespaceGroupId: string) => {
        const listParams: NamespaceListParameters = {
            namespace_group_id: namespaceGroupId,
            resource_group: _getters.isAdminMode ? RESOURCE_GROUP.DOMAIN : RESOURCE_GROUP.WORKSPACE,
        };
        try {
            state.namespaceLoadingMap = {
                ...state.namespaceLoadingMap,
                [namespaceGroupId]: true,
            };
            const { status, response } = await loadNamespaceListFetcher(listParams);
            if (status === 'succeed') {
                state.namespaceMap = {
                    ...state.namespaceMap,
                    [namespaceGroupId]: response.results || [],
                };
            }
        } catch (e) {
            state.namespaceMap = {
                ...state.namespaceMap,
                [namespaceGroupId]: [],
            };
            ErrorHandler.handleError(e);
        } finally {
            state.namespaceLoadingMap = {
                ...state.namespaceLoadingMap,
                [namespaceGroupId]: false,
            };
        }
    };
    const loadNamespaceListByKeywordSearch = async (keyword: string) => {
        state.namespaceMapByKeywordSearch = {}; // initialize
        if (!keyword) return;
        const listParams: NamespaceListParameters = {
            resource_group: _getters.isAdminMode ? RESOURCE_GROUP.DOMAIN : RESOURCE_GROUP.WORKSPACE,
            query: {
                filter: [{ k: 'name', v: keyword, o: 'contain' }],
            },
        };
        try {
            state.loading = true;
            const { status, response } = await loadNamespaceListFetcher(listParams);
            if (status === 'succeed') {
                const namespaceList = response.results || [];
                namespaceList.forEach((namespace) => {
                    if (state.namespaceMapByKeywordSearch[namespace.namespace_group_id]) {
                        state.namespaceMapByKeywordSearch = {
                            ...state.namespaceMapByKeywordSearch,
                            [namespace.namespace_group_id]: [
                                ...state.namespaceMapByKeywordSearch[namespace.namespace_group_id],
                                namespace,
                            ],
                        };
                    } else {
                        state.namespaceMapByKeywordSearch = {
                            ...state.namespaceMapByKeywordSearch,
                            [namespace.namespace_group_id]: [namespace],
                        };
                    }
                });
            }
        } catch (e) {
            state.namespaceMapByKeywordSearch = {};
            ErrorHandler.handleError(e);
        } finally {
            state.loading = false;
        }
    };
    const loadMetricListFetcher = getCancellableFetcher<MetricListParameters, ListResponse<MetricModel>>(SpaceConnector.clientV2.inventoryV2.metric.list);
    const loadMetricList = async (namespaceId: string) => {
        const listParams: MetricListParameters = {
            namespace_id: namespaceId,
        };
        try {
            state.metricLoading = true;
            const { status, response } = await loadMetricListFetcher(listParams);
            if (status === 'succeed') {
                state.metricList = response.results || [];
            }
        } catch (e) {
            state.metricList = [];
            ErrorHandler.handleError(e);
        } finally {
            state.metricLoading = false;
        }
    };
    const loadMetricExampleListFetcher = getCancellableFetcher<MetricExampleListParameters, ListResponse<MetricExampleModel>>(SpaceConnector.clientV2.inventoryV2.metricExample.list);
    const loadMetricExampleList = async (namespaceId: string) => {
        const listParams: MetricExampleListParameters = {
            namespace_id: namespaceId,
        };
        try {
            const { status, response } = await loadMetricExampleListFetcher(listParams);
            if (status === 'succeed') {
                state.metricExampleList = response.results || [];
            }
        } catch (e) {
            state.metricExampleList = [];
            ErrorHandler.handleError(e);
        }
    };

    const actions = {
        reset,
        loadNamespaceGroupList,
        loadNamespace,
        loadNamespaceListByNamespaceGroupId,
        loadNamespaceListByKeywordSearch,
        loadMetricList,
        loadMetricExampleList,
    };
    const mutations = {
        setSelectedNamespaceId,
    };

    return {
        state,
        getters,
        ...mutations,
        ...actions,
    };
});
