import { computed, type ComputedRef } from 'vue';

import type { WidgetLoadParams, WidgetLoadSumParams } from '@/api-clients/dashboard/_types/widget-type';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import { WIDGET_LOAD_STALE_TIME } from '@/common/modules/widgets/_constants/widget-constant';



interface UseWidgetLoadQueryOptions {
    widgetId: ComputedRef<string>;
    params: ComputedRef<WidgetLoadParams>;
    additionalDeps?: ComputedRef<object>;
    enabled?: ComputedRef<boolean>;
}


export const useWidgetLoadQuery = ({
    widgetId,
    params,
    additionalDeps,
    enabled,
}: UseWidgetLoadQueryOptions) => {
    const { publicWidgetAPI } = usePublicWidgetApi();
    const { privateWidgetAPI } = usePrivateWidgetApi();

    const isPrivate = computed(() => {
        if (!widgetId.value) return false;
        return widgetId.value.startsWith('private');
    });

    const { key: publicWidgetLoadQueryKey, params: publicWidgetLoadParams } = useServiceQueryKey('dashboard', 'public-widget', 'load', {
        contextKey: [
            widgetId.value,
            ...(additionalDeps ? [additionalDeps.value] : []),
        ],
        params,
    });

    const { key: privateWidgetLoadQueryKey, params: privateWidgetLoadParams } = useServiceQueryKey('dashboard', 'private-widget', 'load', {
        contextKey: widgetId,
        params,
    });

    return useScopedQuery({
        queryKey: isPrivate.value ? privateWidgetLoadQueryKey : publicWidgetLoadQueryKey,
        queryFn: () => {
            if (isPrivate.value) {
                if (!privateWidgetLoadParams.value) {
                    throw new Error('Widget parameters are required');
                }
                return privateWidgetAPI.load(privateWidgetLoadParams.value);
            }
            if (!publicWidgetLoadParams.value) {
                throw new Error('Widget parameters are required');
            }
            return publicWidgetAPI.load(publicWidgetLoadParams.value);
        },
        enabled,
        staleTime: WIDGET_LOAD_STALE_TIME,
    }, ['DOMAIN', 'WORKSPACE']);
};


interface UseWidgetLoadSumQueryOptions {
    widgetId: ComputedRef<string>;
    params: ComputedRef<WidgetLoadSumParams>;
    additionalDeps?: ComputedRef<object>;
    enabled?: ComputedRef<boolean>;
}

export const useWidgetLoadSumQuery = ({
    widgetId,
    params,
    additionalDeps,
    enabled,
}: UseWidgetLoadSumQueryOptions) => {
    const { publicWidgetAPI } = usePublicWidgetApi();
    const { privateWidgetAPI } = usePrivateWidgetApi();

    const isPrivate = computed(() => {
        if (!widgetId.value) return false;
        return widgetId.value.startsWith('private');
    });

    const { key: publicWidgetLoadSumQueryKey, params: publicWidgetLoadSumParams } = useServiceQueryKey('dashboard', 'public-widget', 'load-sum', {
        contextKey: [
            widgetId.value,
            ...(additionalDeps ? [additionalDeps.value] : []),
        ],
        params,
    });

    const { key: privateWidgetLoadSumQueryKey, params: privateWidgetLoadSumParams } = useServiceQueryKey('dashboard', 'private-widget', 'load-sum', {
        contextKey: widgetId,
        params,
    });

    return useScopedQuery({
        queryKey: isPrivate.value ? privateWidgetLoadSumQueryKey : publicWidgetLoadSumQueryKey,
        queryFn: () => {
            if (isPrivate.value) {
                if (!privateWidgetLoadSumParams.value) {
                    throw new Error('Widget parameters are required');
                }
                return privateWidgetAPI.loadSum(privateWidgetLoadSumParams.value);
            }
            if (!publicWidgetLoadSumParams.value) {
                throw new Error('Widget parameters are required');
            }
            return publicWidgetAPI.loadSum(publicWidgetLoadSumParams.value);
        },
        enabled,
        staleTime: WIDGET_LOAD_STALE_TIME,
    }, ['DOMAIN', 'WORKSPACE']);
};
