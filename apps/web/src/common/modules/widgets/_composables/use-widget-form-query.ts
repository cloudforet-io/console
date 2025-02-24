import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { QueryClient, QueryKey } from '@tanstack/vue-query';
import { useQueryClient } from '@tanstack/vue-query';

import { useScopedQuery } from '@/api-clients/_common/composables/use-scoped-query';
import type { WidgetModel, WidgetUpdateParams } from '@/api-clients/dashboard/_types/widget-type';
import { usePrivateDataTableApi } from '@/api-clients/dashboard/private-data-table/composables/use-private-data-table-api';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import { usePublicDataTableApi } from '@/api-clients/dashboard/public-data-table/composables/use-public-data-table-api';
import type { DataTableUpdateParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/update';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';

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
        publicWidgetLoadQueryKey: ComputedRef<QueryKey>;
        privateWidgetLoadQueryKey: ComputedRef<QueryKey>;
        publicWidgetLoadSumQueryKey: ComputedRef<QueryKey>;
        privateWidgetLoadSumQueryKey: ComputedRef<QueryKey>;
        publicDataTableListQueryKey: ComputedRef<QueryKey>;
        privateDataTableListQueryKey: ComputedRef<QueryKey>;
        publicDataTableLoadQueryKey: ComputedRef<QueryKey>;
        privateDataTableLoadQueryKey: ComputedRef<QueryKey>;
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
        publicWidgetGetQueryKey,
        publicWidgetLoadQueryKey,
        publicWidgetLoadSumQueryKey,
    } = usePublicWidgetApi();
    const {
        privateWidgetAPI,
        privateWidgetGetQueryKey,
        privateWidgetLoadQueryKey,
        privateWidgetLoadSumQueryKey,
    } = usePrivateWidgetApi();
    const {
        publicDataTableAPI,
        publicDataTableListQueryKey,
        publicDataTableLoadQueryKey,
    } = usePublicDataTableApi();
    const {
        privateDataTableAPI,
        privateDataTableListQueryKey,
        privateDataTableLoadQueryKey,
    } = usePrivateDataTableApi();
    const queryClient = useQueryClient();

    const isPrivate = computed(() => !!widgetId?.value?.startsWith('private'));

    /* Query Keys */
    const _publicWidgetGetQueryKey = computed(() => [
        ...publicWidgetGetQueryKey.value,
        widgetId?.value,
    ]);
    const _privateWidgetGetQueryKey = computed(() => [
        ...privateWidgetGetQueryKey.value,
        widgetId?.value,
    ]);
    const _publicDataTableListQueryKey = computed(() => [
        ...publicDataTableListQueryKey.value,
        widgetId?.value,
    ]);
    const _privateDataTableListQueryKey = computed(() => [
        ...privateDataTableListQueryKey.value,
        widgetId?.value,
    ]);

    /* Querys */
    const publicWidgetQuery = useScopedQuery({
        queryKey: _publicWidgetGetQueryKey,
        queryFn: () => publicWidgetAPI.get({
            widget_id: widgetId?.value as string,
        }),
        enabled: computed(() => !!widgetId?.value && !isPrivate.value && !preventLoad),
        staleTime: STALE_TIME,
    }, ['DOMAIN', 'WORKSPACE']);
    const privateWidgetQuery = useScopedQuery({
        queryKey: _privateWidgetGetQueryKey,
        queryFn: () => privateWidgetAPI.get({
            widget_id: widgetId?.value as string,
        }),
        enabled: computed(() => !!widgetId?.value && isPrivate.value && !preventLoad),
        staleTime: STALE_TIME,
    }, ['WORKSPACE']);
    const publicDataTableListQuery = useScopedQuery({
        queryKey: _publicDataTableListQueryKey,
        queryFn: () => publicDataTableAPI.list({
            widget_id: widgetId?.value as string,
        }),
        select: (data) => data?.results || [],
        enabled: computed(() => !!widgetId?.value && !isPrivate.value && !preventLoad),
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
    }, ['DOMAIN', 'WORKSPACE']);
    const privateDataTableListQuery = useScopedQuery({
        queryKey: _privateDataTableListQueryKey,
        queryFn: () => privateDataTableAPI.list({
            widget_id: widgetId?.value as string,
        }),
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
            publicWidgetGetQueryKey: _publicWidgetGetQueryKey,
            privateWidgetGetQueryKey: _privateWidgetGetQueryKey,
            publicDataTableListQueryKey: _publicDataTableListQueryKey,
            privateDataTableListQueryKey: _privateDataTableListQueryKey,
            publicWidgetLoadQueryKey: computed(() => publicWidgetLoadQueryKey.value),
            privateWidgetLoadQueryKey: computed(() => privateWidgetLoadQueryKey.value),
            publicWidgetLoadSumQueryKey: computed(() => publicWidgetLoadSumQueryKey.value),
            privateWidgetLoadSumQueryKey: computed(() => privateWidgetLoadSumQueryKey.value),
            publicDataTableLoadQueryKey: computed(() => publicDataTableLoadQueryKey.value),
            privateDataTableLoadQueryKey: computed(() => privateDataTableLoadQueryKey.value),
        },
        fetcher: {
            updateDataTableFn,
            updateWidgetFn,
        },
        queryClient,
    };
};
