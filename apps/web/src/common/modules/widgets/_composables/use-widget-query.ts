import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import type { QueryKey } from '@tanstack/vue-query';

import type { WidgetModel, WidgetUpdateParams } from '@/api-clients/dashboard/_types/widget-type';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import type { PrivateWidgetGetParameters } from '@/api-clients/dashboard/private-widget/schema/api-verbs/get';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';
import type { PublicWidgetGetParameters } from '@/api-clients/dashboard/public-widget/schema/api-verbs/get';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';


const STALE_TIME = 1000 * 60 * 5;

interface UseWidgetFormQueryOptions {
    widgetId?: ComputedRef<string|undefined>;
    preventLoad?: boolean;
}

interface UseWidgetFormQueryReturn {
    widget: ComputedRef<WidgetModel|undefined>;
    widgetLoading: ComputedRef<boolean>;
    keys: {
        publicWidgetGetQueryKey: ComputedRef<QueryKey>;
        privateWidgetGetQueryKey: ComputedRef<QueryKey>;
    };
    api: {
        publicWidgetAPI: ReturnType<typeof usePublicWidgetApi>['publicWidgetAPI'];
        privateWidgetAPI: ReturnType<typeof usePrivateWidgetApi>['privateWidgetAPI'];
    };
    fetcher: {
        updateWidgetFn: (params: WidgetUpdateParams) => Promise<WidgetModel>;
    };
}

export const useWidgetQuery = ({
    widgetId,
    preventLoad = false,
}: UseWidgetFormQueryOptions): UseWidgetFormQueryReturn => {
    const {
        publicWidgetAPI,
    } = usePublicWidgetApi();
    const {
        privateWidgetAPI,
    } = usePrivateWidgetApi();

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


    /* Fetchers */
    const updateWidgetFn = (params: WidgetUpdateParams): Promise<WidgetModel> => {
        if (isPrivate.value) {
            return privateWidgetAPI.update(params);
        }
        return publicWidgetAPI.update(params);
    };

    /* State */
    const widgetLoading = computed<boolean>(() => (isPrivate.value
        ? privateWidgetQuery.isFetching.value
        : publicWidgetQuery.isFetching.value));

    return {
        widget: computed(() => (isPrivate.value ? privateWidgetQuery.data.value : publicWidgetQuery.data.value)),
        widgetLoading,
        api: {
            publicWidgetAPI,
            privateWidgetAPI,
        },
        keys: {
            publicWidgetGetQueryKey,
            privateWidgetGetQueryKey,
        },
        fetcher: {
            updateWidgetFn,
        },
    };
};
