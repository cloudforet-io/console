import type { Ref } from 'vue';
import { computed } from 'vue';

import dayjs from 'dayjs';
import {
    groupBy, map, sumBy,
} from 'lodash';

import { useMetricDataApi } from '@/api-clients/inventory/metric-data/composables/use-metric-data-api';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import type { CloudServiceTypeItem } from '@/store/reference/cloud-service-type-reference-store';
import { useCloudServiceTypeReferenceStore } from '@/store/reference/cloud-service-type-reference-store';

import type { DailyUpdateItem } from '@/services/workspace-home/shared/types/asset-daily-updates-type';
import type { WidgetMode } from '@/services/workspace-home/shared/types/widget-mode-type';

export type UpdateLabel = 'created' | 'deleted';


interface AnalyzeResult {
    'Cloud Service Group': string; // group by
    'Cloud Service Type': string; // group by
    'Provider': string; // group by
    _total_count?: number;
    count?: { value: number; date: string; }[];
}
interface SelectResult extends Omit<DailyUpdateItem, 'createdCount' | 'deletedCount'> {
    createdCount?: number;
    deletedCount?: number;
}

const useDailyUpdateAnalyzeQuery = (label: UpdateLabel, opts: {
    enabled: Ref<boolean>;
    mode: Ref<WidgetMode>;
    projectIds?: Ref<string[]>;
}) => {
    const { enabled, projectIds, mode } = opts;
    const { metricDataAPI } = useMetricDataApi();
    const metricId = `metric-managed-${label}-count`;

    const { key, params } = useServiceQueryKey('inventory', 'metric-data', 'analyze', {
        contextKey: [mode?.value, metricId],
        params: computed(() => {
            const today = dayjs.utc().format('YYYY-MM-DD');
            const filter = projectIds?.value?.length ? [{
                k: 'project_id', v: projectIds.value, o: 'in',
            }] : undefined;

            return {
                metric_id: metricId,
                query: {
                    granularity: 'DAILY',
                    group_by: ['labels.Provider', 'labels.Cloud Service Group', 'labels.Cloud Service Type'],
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


    const { data, isLoading } = useScopedQuery({
        queryKey: key,
        queryFn: () => metricDataAPI.analyze(params.value),
        select: (response): SelectResult[] => {
            const results = response.results ?? [];
            return results.map((i: AnalyzeResult) => ({
                cloudServiceGroup: i['Cloud Service Group'],
                cloudServiceType: i['Cloud Service Type'],
                provider: i.Provider,
                totalCount: i._total_count ?? 0,
                [`${label}Count`]: i.count?.[0]?.value || 0,
            }));
        },
        enabled,
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60, // 1 minute
    }, ['WORKSPACE']);

    return {
        data,
        isLoading,
    };
};

export const useAssetDailyUpdates = (ops: {
    enabled: Ref<boolean>;
    mode: Ref<WidgetMode>;
    projectIds?: Ref<string[]>;
}) => {
    const { enabled, projectIds, mode } = ops;

    const created = useDailyUpdateAnalyzeQuery('created', { enabled, projectIds, mode });
    const deleted = useDailyUpdateAnalyzeQuery('deleted', { enabled, projectIds, mode });

    const cloudServiceTypeReferenceStore = useCloudServiceTypeReferenceStore();
    const cloudServiceTypeList = computed<CloudServiceTypeItem[]>(() => Object.values(cloudServiceTypeReferenceStore.getters.cloudServiceTypeItems));

    const dailyUpdates = computed<DailyUpdateItem[]>(() => {
        const merged = [...created.data.value ?? [], ...deleted.data.value ?? []];
        const grouped = groupBy(merged, (item) => `${item.cloudServiceGroup}-${item.cloudServiceType}-${item.provider}`);

        return map(grouped, (group) => {
            const cloudServiceType = cloudServiceTypeList.value.find((i) => i.data.cloud_service_type_key === `${group[0].provider}.${group[0].cloudServiceGroup}.${group[0].cloudServiceType}`);
            return {
                cloudServiceGroup: cloudServiceType?.data.group ?? '',
                cloudServiceType: cloudServiceType?.name ?? '',
                totalCount: sumBy(group, 'totalCount') || 0,
                provider: cloudServiceType?.data.provider ?? '',
                icon: cloudServiceType?.icon ?? '',
                createdCount: sumBy(group, 'createdCount') || 0,
                deletedCount: sumBy(group, 'deletedCount') || 0,
            };
        });
    });

    const isLoading = computed(() => created.isLoading.value || deleted.isLoading.value);

    return {
        dailyUpdates,
        isLoadingDailyUpdates: isLoading,
    };
};
