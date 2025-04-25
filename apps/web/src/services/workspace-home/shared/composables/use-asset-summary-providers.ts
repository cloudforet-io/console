import type { Ref } from 'vue';
import { computed } from 'vue';

import dayjs from 'dayjs';

import { useMetricDataApi } from '@/api-clients/inventory/metric-data/composables/use-metric-data-api';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import type { ProviderItem } from '@/store/reference/provider-reference-store';
import { useProviderReferenceStore } from '@/store/reference/provider-reference-store';

import type { AssetProviderItem } from '@/services/workspace-home/shared/types/asset-provider-type';
import type { WidgetMode } from '@/services/workspace-home/shared/types/widget-mode-type';

type ResourceLabel = 'server' | 'database' | 'storage';


interface ProviderResourceMetricsResult {
    Provider: string;
    _total_count: number;
    [key: string]: any;
}

const useResourceMetricQuery = (resourceType: ResourceLabel, opts: {
    enabled: Ref<boolean>;
    mode: Ref<WidgetMode>;
    projectIds?: Ref<string[]>;
}) => {
    const { enabled, mode, projectIds } = opts;
    const { metricDataAPI } = useMetricDataApi();

    const metricType = resourceType === 'storage' ? 'size' : 'count';
    const metricId = `metric-managed-${resourceType}-${metricType}`;

    const { key, params } = useServiceQueryKey('inventory', 'metric-data', 'analyze', {
        contextKey: [mode.value, metricId],
        params: computed(() => {
            const today = dayjs.utc().format('YYYY-MM-DD');
            const filter = projectIds?.value?.length ? [{
                k: 'project_id', v: projectIds.value, o: 'in',
            }] : undefined;

            return {
                metric_id: metricId,
                query: {
                    granularity: 'DAILY',
                    group_by: ['labels.Provider'],
                    start: today,
                    end: today,
                    fields: {
                        count: {
                            key: 'value',
                            operator: 'sum',
                        },
                    },
                    sort: [{ key: '_total_count', desc: true }],
                    field_group: ['date'],
                    filter,
                },
            };
        }),
    });

    return useScopedQuery({
        queryKey: key,
        queryFn: () => metricDataAPI.analyze(params.value),
        select: (response): ProviderResourceMetricsResult[] => response.results ?? [],
        enabled,
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60, // 1 minute
    }, ['WORKSPACE']);
};

export const useAssetSummaryProviders = (opts: {
    enabled: Ref<boolean>;
    mode: Ref<WidgetMode>;
    projectIds?: Ref<string[]>;
}) => {
    const { enabled, mode, projectIds } = opts;
    const providerReferenceStore = useProviderReferenceStore();
    const providerMap = computed<Record<string, AssetProviderItem>>(() => {
        const map: Record<string, AssetProviderItem> = {};
        (Object.entries(providerReferenceStore.getters.providerItems) as [string, ProviderItem][])
            .forEach(([key, provider]) => {
                map[key] = {
                    provider: key,
                    name: provider.name,
                    icon: provider.icon,
                    order: provider.data?.order,
                    server: 0,
                    database: 0,
                    storage: 0,
                };
            });
        return map;
    });

    const serverQuery = useResourceMetricQuery('server', { enabled, projectIds, mode });
    const databaseQuery = useResourceMetricQuery('database', { enabled, projectIds, mode });
    const storageQuery = useResourceMetricQuery('storage', { enabled, projectIds, mode });

    const providers = computed((): AssetProviderItem[] => {
        if (serverQuery.data.value) {
            serverQuery.data.value.forEach((result) => {
                if (providerMap.value[result.Provider]) {
                    providerMap.value[result.Provider].server = result._total_count;
                }
            });
        }

        if (databaseQuery.data.value) {
            databaseQuery.data.value.forEach((result) => {
                if (providerMap.value[result.Provider]) {
                    providerMap.value[result.Provider].database = result._total_count;
                }
            });
        }

        if (storageQuery.data.value) {
            storageQuery.data.value.forEach((result) => {
                if (providerMap.value[result.Provider]) {
                    providerMap.value[result.Provider].storage = result._total_count;
                }
            });
        }

        return Object.values(providerMap.value);
    });

    const isLoading = computed(() => serverQuery.isLoading.value
        || databaseQuery.isLoading.value
        || storageQuery.isLoading.value);

    return {
        providers,
        isLoadingProviders: isLoading,
    };
};
