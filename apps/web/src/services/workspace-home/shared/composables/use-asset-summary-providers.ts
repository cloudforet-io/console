import type { Ref } from 'vue';
import { computed } from 'vue';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProviderItem } from '@/store/reference/provider-reference-store';

import { useMetricDataQuery } from '@/services/workspace-home/shared/composables/use-metric-data-query';

type ResourceKey = 'server' | 'database' | 'storage';

export type ProviderResourceDataItem = ProviderItem & {
    server?: number;
    database?: number;
    storage?: number;
};
export const useAssetSummaryProviders = (ops?: {
    enabled?: Ref<boolean>;
}) => {
    const { enabled } = ops ?? {};
    const { metricData, loadingMetricData } = useMetricDataQuery({ enabled });
    const allReferenceStore = useAllReferenceStore();

    const resourceTypes: {key: ResourceKey; dataRef: Ref<any>}[] = [
        { key: 'server', dataRef: metricData.server.data },
        { key: 'database', dataRef: metricData.database.data },
        { key: 'storage', dataRef: metricData.storage.data },
    ];

    const providers = computed((): ProviderResourceDataItem[] => {
        const providerMap: Record<string, ProviderResourceDataItem> = {};

        Object.entries(allReferenceStore.getters.provider).forEach(([key, provider]) => {
            providerMap[key] = {
                ...provider as ProviderItem,
                server: 0,
                database: 0,
                storage: 0,
            };
        });

        resourceTypes.forEach(({ key, dataRef }) => {
            if (dataRef.value) {
                dataRef.value.forEach((result) => {
                    if (providerMap[result.Provider]) {
                        providerMap[result.Provider][key] = result._total_count;
                    }
                });
            }
        });

        return Object.values(providerMap);
    });

    return {
        providers,
        loadingProviders: loadingMetricData,
    };
};
