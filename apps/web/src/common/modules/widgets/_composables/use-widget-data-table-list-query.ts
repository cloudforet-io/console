import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import { usePrivateDataTableApi } from '@/api-clients/dashboard/private-data-table/composables/use-private-data-table-api';
import { usePublicDataTableApi } from '@/api-clients/dashboard/public-data-table/composables/use-public-data-table-api';
import type { DataTableListParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/list';
import type { DataTableUpdateParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/update';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';

const DEFAULT_LIST_DATA = { results: [] };
// const DEFAULT_LOAD_DATA = { results: {}, labels_info: {}, data_info: {} };
const STALE_TIME = 1000 * 60 * 5;

interface UseWidgetDataTableListQueryOptions {
    widgetId: ComputedRef<string|undefined>;
}

interface UseWidgetDataTableListQueryReturn {
    dataTableList: ComputedRef<DataTableModel[]>;
    isLoading: ComputedRef<boolean>;
    keys: {
        publicDataTableListQueryKey: ComputedRef<QueryKey>;
        privateDataTableListQueryKey: ComputedRef<QueryKey>;
    };
    api: {
        publicDataTableAPI: ReturnType<typeof usePublicDataTableApi>['publicDataTableAPI'];
        privateDataTableAPI: ReturnType<typeof usePrivateDataTableApi>['privateDataTableAPI'];
    };
    fetcher: {
        updateDataTableFn: (params: DataTableUpdateParameters) => Promise<DataTableModel>;
    };
}

export const useWidgetDataTableListQuery = ({
    widgetId,
}: UseWidgetDataTableListQueryOptions): UseWidgetDataTableListQueryReturn => {
    const {
        publicDataTableAPI,
    } = usePublicDataTableApi();
    const {
        privateDataTableAPI,
    } = usePrivateDataTableApi();

    const isPrivate = computed(() => !!widgetId?.value?.startsWith('private'));

    /* Query Keys */
    const { key: publicDataTableListQueryKey, params: publicDataTableListParams } = useServiceQueryKey('dashboard', 'public-data-table', 'list', {
        contextKey: computed(() => widgetId.value),
        params: computed<DataTableListParameters>(() => ({
            widget_id: widgetId.value as string,
        })),
    });
    const { key: privateDataTableListQueryKey, params: privateDataTableListParams } = useServiceQueryKey('dashboard', 'private-data-table', 'list', {
        contextKey: computed(() => widgetId.value),
        params: computed<DataTableListParameters>(() => ({
            widget_id: widgetId.value as string,
        })),
    });

    /* Querys */
    const publicDataTableListQuery = useScopedQuery({
        queryKey: publicDataTableListQueryKey,
        queryFn: () => publicDataTableAPI.list(publicDataTableListParams.value),
        select: (data) => data?.results || [],
        enabled: computed(() => !!widgetId?.value && !isPrivate.value),
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
    }, ['DOMAIN', 'WORKSPACE']);
    const privateDataTableListQuery = useScopedQuery({
        queryKey: privateDataTableListQueryKey,
        queryFn: () => privateDataTableAPI.list(privateDataTableListParams.value),
        select: (data) => data?.results || [],
        enabled: computed(() => !!widgetId?.value && isPrivate.value),
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
    }, ['WORKSPACE']);

    /* Fetchers */
    const updateDataTableFn = (params: DataTableUpdateParameters): Promise<DataTableModel> => {
        if (isPrivate.value) {
            return privateDataTableAPI.update(params);
        }
        return publicDataTableAPI.update(params);
    };


    return {
        dataTableList: computed(() => (isPrivate.value ? privateDataTableListQuery.data.value : publicDataTableListQuery.data.value) ?? []),
        isLoading: computed(() => (isPrivate.value ? privateDataTableListQuery.isFetching.value : publicDataTableListQuery.isFetching.value)),
        api: {
            publicDataTableAPI,
            privateDataTableAPI,
        },
        keys: {
            publicDataTableListQueryKey,
            privateDataTableListQueryKey,
        },
        fetcher: {
            updateDataTableFn,
        },
    };
};
