import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import type { WidgetModel, WidgetUpdateParams } from '@/api-clients/dashboard/_types/widget-type';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import type { PrivateWidgetListParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/list';
import type { PrivateWidgetUpdateParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/update';
import type { PrivateWidgetModel } from '@/api-clients/dashboard/private-widget/schema/model';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';
import type { PublicWidgetListParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/list';
import type { PublicWidgetUpdateParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/update';
import type { PublicWidgetModel } from '@/api-clients/dashboard/public-widget/schema/model';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

const DEFAULT_LIST_DATA = { results: [] };
const STALE_TIME = 1000 * 60 * 5;

interface UseDashboardWidgetListQueryOptions {
    dashboardId: ComputedRef<string|undefined>;
}

interface UseDashboardWidgetListQueryReturn {
    widgetList: ComputedRef<(PublicWidgetModel|PrivateWidgetModel)[]>;
    isLoading: ComputedRef<boolean>;
    isError: ComputedRef<boolean>;
    keys: {
        publicWidgetListQueryKey: ComputedRef<QueryKey>;
        privateWidgetListQueryKey: ComputedRef<QueryKey>;
    };
    api: {
        publicWidgetAPI: ReturnType<typeof usePublicWidgetApi>['publicWidgetAPI'];
        privateWidgetAPI: ReturnType<typeof usePrivateWidgetApi>['privateWidgetAPI'];
    };
    fetcher: {
        updateWidgetFn: (args: WidgetUpdateParams) => Promise<WidgetModel>
    };
}

export const useDashboardWidgetListQuery = ({
    dashboardId,
}: UseDashboardWidgetListQueryOptions): UseDashboardWidgetListQueryReturn => {
    const { publicWidgetAPI } = usePublicWidgetApi();
    const { privateWidgetAPI } = usePrivateWidgetApi();

    const isPrivate = computed(() => !!dashboardId.value?.startsWith('private'));


    /* Query Keys */
    const { key: publicWidgetListQueryKey, params: publicWidgetListParams } = useServiceQueryKey('dashboard', 'public-widget', 'list', {
        contextKey: dashboardId.value,
        params: computed<PublicWidgetListParameters>(() => ({
            dashboard_id: dashboardId.value as string,
        })),
    });
    const { key: privateWidgetListQueryKey, params: privateWidgetListParams } = useServiceQueryKey('dashboard', 'private-widget', 'list', {
        contextKey: dashboardId.value,
        params: computed<PrivateWidgetListParameters>(() => ({
            dashboard_id: dashboardId.value as string,
        })),
    });

    /* Querys */
    const publicWidgetListQuery = useScopedQuery({
        queryKey: publicWidgetListQueryKey,
        queryFn: () => publicWidgetAPI.list(publicWidgetListParams.value),
        select: (data) => data?.results || [],
        enabled: computed(() => !!dashboardId.value && !isPrivate.value),
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
    }, ['DOMAIN', 'WORKSPACE']);
    const privateWidgetListQuery = useScopedQuery({
        queryKey: privateWidgetListQueryKey,
        queryFn: () => privateWidgetAPI.list(privateWidgetListParams.value),
        select: (data) => data?.results || [],
        enabled: computed(() => !!dashboardId.value && isPrivate.value),
        initialData: DEFAULT_LIST_DATA,
        initialDataUpdatedAt: 0,
        staleTime: STALE_TIME,
    }, ['WORKSPACE']);

    /* Functions */
    const updateWidgetFn = (params: WidgetUpdateParams): Promise<WidgetModel> => {
        const _isPrivate = params.widget_id.startsWith('private');
        if (_isPrivate) {
            return privateWidgetAPI.update(params as PrivateWidgetUpdateParameters);
        }
        return publicWidgetAPI.update(params as PublicWidgetUpdateParameters);
    };

    /* State */
    const isLoading = computed<boolean>(() => (isPrivate.value
        ? privateWidgetListQuery.isFetching.value
        : publicWidgetListQuery.isFetching.value));
    const isError = computed<boolean>(() => (isPrivate.value
        ? privateWidgetListQuery.isError.value
        : publicWidgetListQuery.isError.value));

    return {
        widgetList: computed(() => (isPrivate.value ? privateWidgetListQuery.data?.value : publicWidgetListQuery.data?.value) ?? []),
        isLoading,
        isError,
        api: {
            publicWidgetAPI,
            privateWidgetAPI,
        },
        keys: {
            publicWidgetListQueryKey,
            privateWidgetListQueryKey,
        },
        fetcher: {
            updateWidgetFn,
        },
    };
};
