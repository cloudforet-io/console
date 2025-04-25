import type { Ref } from 'vue';
import { computed } from 'vue';

import dayjs from 'dayjs';
import { sortBy } from 'lodash';

import { useUnifiedCostApi } from '@/api-clients/cost-analysis/unified-cost/composables/use-unified-cost-api';
import type { UnifiedCostAnalyzeParameters } from '@/api-clients/cost-analysis/unified-cost/schema/api-verbs/analyze';
import { useScopedQuery } from '@/query/composables/use-scoped-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';

import type { Currency } from '@/store/display/type';

import { GRANULARITY } from '@/services/cost-explorer/constants/cost-explorer-constant';
import type { Period } from '@/services/cost-explorer/types/cost-explorer-query-type';
import type { WidgetMode } from '@/services/workspace-home/shared/types/widget-mode-type';

export interface CostChartData {
  is_confirmed: boolean;
  date?: string;
  value?: number;
  _total_value_sum?: number;
}

const fillMissingMonths = (dataList: CostChartData[]): CostChartData[] => {
    const result: CostChartData[] = [];
    const today = dayjs().utc();
    if (dataList.length === 0) return result;

    dataList.sort((a, b) => dayjs(a.date).utc().diff(dayjs(b.date).utc()));

    const startDate = dayjs(dataList[0]?.date).utc();
    let currentDate = startDate;

    while (currentDate.isBefore(today, 'month')) {
        const dateToCheck = currentDate.clone();
        const data = dataList.find((item) => dayjs(item.date).utc().isSame(dateToCheck, 'month'));
        result.push(
            data || { date: dateToCheck.add(1, 'month').format('YYYY-MM'), value: 0, is_confirmed: true },
        );
        currentDate = currentDate.add(1, 'month');
    }
    return result;
};

export const useCostChartData = ({
    enabled,
    currency,
    period,
    projectIds,
    mode,
}: {
    enabled: Ref<boolean>;
    currency: Ref<Currency>;
    period: Ref<Period>;
    projectIds: Ref<string[]|undefined>;
    mode: Ref<WidgetMode>;
}) => {
    // Use unified cost API and queryKey
    const { unifiedCostAPI } = useUnifiedCostApi();

    // Use service query key for analyze
    const { key, params } = useServiceQueryKey('cost-analysis', 'unified-cost', 'analyze', {
        contextKey: mode,
        params: computed<UnifiedCostAnalyzeParameters>(() => ({
            query: {
                start: period.value.start,
                end: period.value.end,
                group_by: projectIds.value ? ['project_id', 'is_confirmed'] : ['is_confirmed'],
                fields: {
                    value_sum: {
                        key: `cost.${currency.value}`,
                        operator: 'sum',
                    },
                },
                granularity: GRANULARITY.MONTHLY,
                field_group: ['date'],
                filter: (projectIds.value?.length) ? [
                    { k: 'project_id', v: projectIds.value, o: 'in' },
                ] : undefined,
            },
        })),
    });

    const {
        data, isLoading, isError, refetch,
    } = useScopedQuery({
        queryKey: key,
        queryFn: () => unifiedCostAPI.analyze(params.value),
        select: (response) => {
            if (!response.results) return [];

            const _chartData: CostChartData[] = (response.results || [])
                .flatMap((item) => ((item.value_sum ?? []))
                    .map((valueSum) => ({
                        ...valueSum,
                        is_confirmed: item.is_confirmed,
                    })));

            // Sort and fill missing months
            return sortBy(fillMissingMonths(_chartData), 'date');
        },
        enabled: computed(() => enabled.value && !!currency),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    }, ['WORKSPACE']);

    return {
        isLoading,
        isError,
        chartData: data,
        refetch,
    };
};
