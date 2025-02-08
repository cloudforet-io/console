import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { QueryClient, QueryKey } from '@tanstack/vue-query';
import { useQuery, useQueryClient } from '@tanstack/vue-query';

import type { WidgetModel, WidgetUpdateParams } from '@/api-clients/dashboard/_types/widget-type';
import { usePrivateDataTableApi } from '@/api-clients/dashboard/private-data-table/composables/use-private-data-table-api';
import type { PrivateDataTableModel } from '@/api-clients/dashboard/private-data-table/schema/model';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import { usePublicDataTableApi } from '@/api-clients/dashboard/public-data-table/composables/use-public-data-table-api';
import type { DataTableUpdateParameters } from '@/api-clients/dashboard/public-data-table/schema/api-verbs/update';
import type { PublicDataTableModel } from '@/api-clients/dashboard/public-data-table/schema/model';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';

import type { DataTableModel } from '@/common/modules/widgets/types/widget-data-table-type';

const DEFAULT_LIST_DATA = { results: [] };
const STALE_TIME = 1000 * 60 * 5;

interface UseDashboardWidgetFormQueryOptions {
    widgetId: ComputedRef<string|undefined>;
}

interface UseDashboardWidgetFormQueryReturn {
    widget: ComputedRef<WidgetModel|undefined>;
    dataTableList: ComputedRef<(PublicDataTableModel|PrivateDataTableModel)[]>;
    dataTableListLoading: ComputedRef<boolean>;
    widgetLoading: ComputedRef<boolean>;
    keys: {
        publicWidgetQueryKey: ComputedRef<QueryKey>;
        privateWidgetQueryKey: ComputedRef<QueryKey>;
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

export const useDashboardWidgetFormQuery = ({
    widgetId,
}: UseDashboardWidgetFormQueryOptions): UseDashboardWidgetFormQueryReturn => {
    const { publicWidgetAPI, publicWidgetQueryKey } = usePublicWidgetApi();
    const { privateWidgetAPI, privateWidgetQueryKey } = usePrivateWidgetApi();
    const { publicDataTableAPI, publicDataTableListQueryKey } = usePublicDataTableApi();
    const { privateDataTableAPI, privateDataTableListQueryKey } = usePrivateDataTableApi();
    const queryClient = useQueryClient();

    const isPrivate = computed(() => !!widgetId.value?.startsWith('private'));

    /* Query Keys */
    const _publicWidgetQueryKey = computed(() => [
        ...publicWidgetQueryKey.value,
        widgetId.value,
    ]);
    const _privateWidgetQueryKey = computed(() => [
        ...privateWidgetQueryKey.value,
        widgetId.value,
    ]);
    const _publicDataTableListQueryKey = computed(() => [
        ...publicDataTableListQueryKey.value,
        widgetId.value,
    ]);
    const _privateDataTableListQueryKey = computed(() => [
        ...privateDataTableListQueryKey.value,
        widgetId.value,
    ]);

    /* Querys */
    const publicWidgetQuery = useQuery({
        queryKey: _publicWidgetQueryKey,
        queryFn: () => publicWidgetAPI.get({
            widget_id: widgetId.value as string,
        }),
        enabled: computed(() => !!widgetId.value && !isPrivate.value),
        staleTime: STALE_TIME,
    });
    const privateWidgetQuery = useQuery({
        queryKey: _privateWidgetQueryKey,
        queryFn: () => privateWidgetAPI.get({
            widget_id: widgetId.value as string,
        }),
        enabled: computed(() => !!widgetId.value && isPrivate.value),
        staleTime: STALE_TIME,
    });
    const publicDataTableListQuery = useQuery({
        queryKey: _publicDataTableListQueryKey,
        queryFn: () => publicDataTableAPI.list({
            widget_id: widgetId.value as string,
        }),
        select: (data) => data?.results || [],
        enabled: computed(() => !!widgetId.value && !isPrivate.value),
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
    });
    const privateDataTableListQuery = useQuery({
        queryKey: _privateDataTableListQueryKey,
        queryFn: () => privateDataTableAPI.list({
            widget_id: widgetId.value as string,
        }),
        select: (data) => data?.results || [],
        enabled: computed(() => !!widgetId.value && isPrivate.value),
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
    });

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
        dataTableList: computed(() => (isPrivate.value ? privateDataTableListQuery.data.value : publicDataTableListQuery.data.value)),
        dataTableListLoading,
        widgetLoading,
        api: {
            publicWidgetAPI,
            privateWidgetAPI,
            publicDataTableAPI,
            privateDataTableAPI,
        },
        keys: {
            publicWidgetQueryKey: _publicWidgetQueryKey,
            privateWidgetQueryKey: _privateWidgetQueryKey,
            publicDataTableListQueryKey: _publicDataTableListQueryKey,
            privateDataTableListQueryKey: _privateDataTableListQueryKey,
        },
        fetcher: {
            updateDataTableFn,
            updateWidgetFn,
        },
        queryClient,
    };
};
