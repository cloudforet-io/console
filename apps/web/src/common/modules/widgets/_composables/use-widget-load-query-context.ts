import { computed, type ComputedRef } from 'vue';

import type { WidgetLoadParams, WidgetLoadResponse, WidgetLoadSumParams } from '@/api-clients/dashboard/_types/widget-type';
import { usePrivateWidgetApi } from '@/api-clients/dashboard/private-widget/composables/use-private-widget-api';
import { usePublicWidgetApi } from '@/api-clients/dashboard/public-widget/composables/use-public-widget-api';
import type { QueryKeyArray } from '@/query/query-key/_types/query-key-type';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';



interface UseWidgetLoadQueryContextOptions {
    widgetId: ComputedRef<string>;
    params: ComputedRef<WidgetLoadParams>;
    additionalDeps?: ComputedRef<object>;
}

interface UseWidgetLoadQueryContextResult {
    fetcher: () => Promise<WidgetLoadResponse>;
    key: ComputedRef<QueryKeyArray>;
}


export const useWidgetLoadQueryContext = ({
    widgetId,
    params,
    additionalDeps,
}: UseWidgetLoadQueryContextOptions): UseWidgetLoadQueryContextResult => {
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

    const fetcher = () => {
        if (!params.value) {
            throw new Error('Widget parameters are required');
        }
        return isPrivate.value
            ? privateWidgetAPI.load(privateWidgetLoadParams.value)
            : publicWidgetAPI.load(publicWidgetLoadParams.value);
    };

    return {
        fetcher,
        key: isPrivate.value ? privateWidgetLoadQueryKey : publicWidgetLoadQueryKey,
    };
};


interface UseWidgetLoadSumQueryContextOptions {
    widgetId: ComputedRef<string>;
    params: ComputedRef<WidgetLoadSumParams>;
    additionalDeps?: ComputedRef<object>;
}
interface UseWidgetLoadSumQueryContextResult {
    fetcher: () => Promise<WidgetLoadResponse>;
    key: ComputedRef<QueryKeyArray>;
}

export const useWidgetLoadSumQueryContext = ({
    widgetId,
    params,
    additionalDeps,
}: UseWidgetLoadSumQueryContextOptions): UseWidgetLoadSumQueryContextResult => {
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

    const fetcher = () => {
        if (!params.value) {
            throw new Error('Widget parameters are required');
        }
        return isPrivate.value
            ? privateWidgetAPI.loadSum(privateWidgetLoadSumParams.value)
            : publicWidgetAPI.loadSum(publicWidgetLoadSumParams.value);
    };

    return {
        fetcher,
        key: isPrivate.value ? privateWidgetLoadSumQueryKey : publicWidgetLoadSumQueryKey,
    };
};
