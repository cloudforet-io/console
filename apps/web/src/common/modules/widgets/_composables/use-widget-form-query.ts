import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { QueryClient, QueryKey } from '@tanstack/vue-query';
import { useQueryClient } from '@tanstack/vue-query';

import { useScopedQuery } from '@/api-clients/_common/composables/use-scoped-query';
import type { WidgetModel, WidgetUpdateParams } from '@/api-clients/dashboard/_types/widget-type';
import { usePrivateDataTableApi } from '@/api-clients/dashboard/private-data-table/composables/use-private-data-table-api';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import type { PrivateWidgetGetParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/get';
import { usePublicDataTableApi } from '@/api-clients/dashboard/public-data-table/composables/use-public-data-table-api';
import type { DataTableListParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/list';
import type { DataTableUpdateParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/update';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';
import type { PublicWidgetGetParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';

const DEFAULT_LIST_DATA = { results: [] };
// const DEFAULT_LOAD_DATA = { results: {}, labels_info: {}, data_info: {} };
const STALE_TIME = 1000 * 60 * 5;

interface UseWidgetFormQueryOptions {
    widgetId?: ComputedRef<string|undefined>;
    preventLoad?: boolean;
}

interface UseWidgetFormQueryReturn {
    widget: ComputedRef<WidgetModel|undefined>;
    dataTableList: ComputedRef<DataTableModel[]>;
    dataTableListLoading: ComputedRef<boolean>;
    widgetLoading: ComputedRef<boolean>;
    keys: {
        publicWidgetGetQueryKey: ComputedRef<QueryKey>;
        privateWidgetGetQueryKey: ComputedRef<QueryKey>;
        publicDataTableListQueryKey: ComputedRef<QueryKey>;
        privateDataTableListQueryKey: ComputedRef<QueryKey>;
    };
    api: {
        publicWidgetAPI: ReturnType<typeof usePublicWidgetApi>['publicWidgetAPI'];
        privateWidgetAPI: ReturnType<typeof usePrivateWidgetApi>['privateWidgetAPI'];
        publicDataTableAPI: ReturnType<typeof usePublicDataTableApi>['publicDataTableAPI'];
        privateDataTableAPI: ReturnType<typeof usePrivateDataTableApi>['privateDataTableAPI'];
    };
    fetcher: {
        updateDataTableFn: (params: DataTableUpdateParameters) => Promise<DataTableModel>;
        updateWidgetFn: (params: WidgetUpdateParams) => Promise<WidgetModel>;
    };
    queryClient: QueryClient;
}

export const useWidgetFormQuery = ({
    widgetId,
    preventLoad = false,
}: UseWidgetFormQueryOptions): UseWidgetFormQueryReturn => {
    const {
        publicWidgetAPI,
    } = usePublicWidgetApi();
    const {
        privateWidgetAPI,
    } = usePrivateWidgetApi();
    const {
        publicDataTableAPI,
    } = usePublicDataTableApi();
    const {
        privateDataTableAPI,
    } = usePrivateDataTableApi();
    const queryClient = useQueryClient();

    const isPrivate = computed(() => !!widgetId?.value?.startsWith('private'));

    /* Query Keys */
    const { key: publicWidgetGetQueryKey, params: publicWidgetGetParams } = useServiceQueryKey('dashboard', 'public-widget', 'get', {
        contextKey: widgetId,
        params: computed<PublicWidgetGetParameters>(() => ({
            widget_id: widgetId?.value as string,
        })),
    });
    const { key: privateWidgetGetQueryKey, params: privateWidgetGetParams } = useServiceQueryKey('dashboard', 'private-widget', 'get', {
        contextKey: widgetId,
        params: computed<PrivateWidgetGetParameters>(() => ({
            widget_id: widgetId?.value as string,
        })),
    });
    const { key: publicDataTableListQueryKey, params: publicDataTableListParams } = useServiceQueryKey('dashboard', 'public-data-table', 'list', {
        params: computed<DataTableListParameters>(() => ({
            widget_id: widgetId?.value as string,
        })),
    });
    const { key: privateDataTableListQueryKey, params: privateDataTableListParams } = useServiceQueryKey('dashboard', 'private-data-table', 'list', {
        params: computed<DataTableListParameters>(() => ({
            widget_id: widgetId?.value as string,
        })),
    });

    /* Querys */
    const publicWidgetQuery = useScopedQuery({
        queryKey: publicWidgetGetQueryKey,
        queryFn: () => publicWidgetAPI.get(publicWidgetGetParams.value),
        enabled: computed(() => !!widgetId?.value && !isPrivate.value && !preventLoad),
        staleTime: STALE_TIME,
    }, ['DOMAIN', 'WORKSPACE']);
    const privateWidgetQuery = useScopedQuery({
        queryKey: privateWidgetGetQueryKey,
        queryFn: () => privateWidgetAPI.get(privateWidgetGetParams.value),
        enabled: computed(() => !!widgetId?.value && isPrivate.value && !preventLoad),
        staleTime: STALE_TIME,
    }, ['WORKSPACE']);
    const publicDataTableListQuery = useScopedQuery({
        queryKey: publicDataTableListQueryKey,
        queryFn: () => publicDataTableAPI.list(publicDataTableListParams.value),
        select: (data) => data?.results || [],
        enabled: computed(() => !!widgetId?.value && !isPrivate.value && !preventLoad),
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
    }, ['DOMAIN', 'WORKSPACE']);
    const privateDataTableListQuery = useScopedQuery({
        queryKey: privateDataTableListQueryKey,
        queryFn: () => privateDataTableAPI.list(privateDataTableListParams.value),
        select: (data) => data?.results || [],
        enabled: computed(() => !!widgetId?.value && isPrivate.value && !preventLoad),
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
    const updateWidgetFn = (params: WidgetUpdateParams): Promise<WidgetModel> => {
        if (isPrivate.value) {
            return privateWidgetAPI.update(params);
        }
        return publicWidgetAPI.update(params);
    };

    /* State */
    const dataTableListLoading = computed<boolean>(() => (isPrivate.value
        ? privateDataTableListQuery.isFetching.value
        : publicDataTableListQuery.isFetching.value));
    const widgetLoading = computed<boolean>(() => (isPrivate.value
        ? privateWidgetQuery.isFetching.value
        : publicWidgetQuery.isFetching.value));

    return {
        widget: computed(() => (isPrivate.value ? privateWidgetQuery.data.value : publicWidgetQuery.data.value)),
        dataTableList: computed(() => (isPrivate.value ? privateDataTableListQuery.data.value : publicDataTableListQuery.data.value) ?? []),
        dataTableListLoading,
        widgetLoading,
        api: {
            publicWidgetAPI,
            privateWidgetAPI,
            publicDataTableAPI,
            privateDataTableAPI,
        },
        keys: {
            publicWidgetGetQueryKey,
            privateWidgetGetQueryKey,
            publicDataTableListQueryKey,
            privateDataTableListQueryKey,
        },
        fetcher: {
            updateDataTableFn,
            updateWidgetFn,
        },
        queryClient,
    };
};
