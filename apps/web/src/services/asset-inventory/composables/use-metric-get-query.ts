import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useMetricApi } from '@/api-clients/inventory/metric/composables/use-metric-api';
import type { MetricGetParameters } from '@/api-clients/inventory/metric/schema/api-verbs/get';
import type { MetricLabelKey } from '@/api-clients/inventory/metric/schema/type';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useAppContextStore } from '@/store/app-context/app-context-store';

interface UseMetricGetQueryOptions {
    metricId: ComputedRef<string>;
}

export const useMetricGetQuery = ({ metricId }: UseMetricGetQueryOptions) => {
    const { metricAPI } = useMetricApi();
    const appContextStore = useAppContextStore();
    const isAdminMode = computed<boolean>(() => appContextStore.getters.isAdminMode);

    const { key, params: queryParams } = useServiceQueryKey('inventory', 'metric', 'get', {
        params: computed<MetricGetParameters>(() => ({ metric_id: metricId.value })),
    });

    const query = useScopedQuery({
        queryKey: key,
        queryFn: () => metricAPI.get(queryParams.value),
        enabled: computed(() => !!metricId.value),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 2, // 2 minutes
    }, ['DOMAIN', 'WORKSPACE']);

    const labelKeys = computed<MetricLabelKey[]>(() => {
        if (!query.data.value?.labels_info?.length) return [];
        if (isAdminMode.value) {
            return query.data.value.labels_info;
        }
        return query.data.value.labels_info?.filter((d) => d.key !== 'workspace_id');
    });

    return {
        data: query.data,
        isLoading: query.isLoading,
        metricGetQueryKey: key,
        labelKeys,
    };
};
