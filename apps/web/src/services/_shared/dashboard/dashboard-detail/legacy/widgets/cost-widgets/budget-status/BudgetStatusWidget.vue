<script setup lang="ts">
import {
    computed, defineProps, reactive,
} from 'vue';

import { range } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PDataLoader, PSkeleton } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { indigo, red, yellow } from '@/styles/colors';

import WidgetFrame from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_components/WidgetFrame.vue';
import { useWidgetLifecycle } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget-lifecycle';
import { useWidget } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_composables/use-widget/use-widget';
import type {
    WidgetEmit, WidgetExpose, WidgetProps, Legend, BudgetUsageAnalyzeResponse,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';


interface Data {
    budget_id: string,
    name?: string;
    total_spent?: number;
    total_budget?: number;
    budget_usage?: number;
}
type Response = BudgetUsageAnalyzeResponse<Data>;

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const { widgetState, widgetFrameProps, widgetFrameEventHandlers } = useWidget(props, emit);

const state = reactive({
    loading: true,
    data: undefined as Response | undefined,
    legends: computed<Omit<Legend, 'name'>[]>(() => ([
        { label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.OVERSPENT'), color: red[400] },
        { label: '90-100%', color: yellow[500] },
        { label: '70-90%', color: indigo[500] },
        { label: '< 70%', color: indigo[100] },
    ])),
});

/* Util */
const getTooltipText = (rowIdx: number, colIdx: number): string => {
    const _target = state.data?.results?.[colIdx * 10 + rowIdx];
    const budgetUsage = _target?.budget_usage ?? 0;
    return `${_target?.name} (${budgetUsage.toFixed(2)}%)`;
};
const getColor = (rowIdx: number, colIdx: number): string => {
    const _target = state.data?.results?.[colIdx * 10 + rowIdx];
    const totalBudget = _target?.total_budget ?? 0;
    const totalSpent = _target?.total_spent ?? 0;

    let color;
    if (totalBudget !== 0) {
        const usage = totalSpent / totalBudget * 100;
        if (usage < 70) color = indigo[100];
        else if (usage < 90) color = indigo[500];
        else if (usage < 100) color = yellow[500];
        else color = red[400];
    } else if (totalSpent > 0) color = red[400];
    else color = indigo[100];
    return color;
};

/* Api */
const apiQueryHelper = new ApiQueryHelper();
const fetchBudgetUsageAnalyze = getCancellableFetcher<object, Response>(SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze);
const fetchData = async (): Promise<Response|undefined> => {
    try {
        apiQueryHelper.setFilters(widgetState.consoleFilters);
        const { status, response } = await fetchBudgetUsageAnalyze({
            data_source_id: widgetState.options.cost_data_source,
            query: {
                granularity: widgetState.granularity,
                group_by: ['budget_id', 'name'],
                start: widgetState.dateRange.start,
                end: widgetState.dateRange.end,
                fields: {
                    total_spent: {
                        key: 'cost',
                        operator: 'sum',
                    },
                    total_budget: {
                        key: 'limit',
                        operator: 'sum',
                    },
                },
                select: {
                    budget_id: 'budget_id',
                    name: 'name',
                    total_spent: 'total_spent',
                    total_budget: 'total_budget',
                    budget_usage: {
                        operator: 'multiply',
                        fields: [
                            {
                                operator: 'divide',
                                fields: ['total_spent', 'total_budget'],
                            },
                            100,
                        ],
                    },
                },
                sort: [{ key: 'budget_usage', desc: true }],
                page: { limit: 200 },
                ...apiQueryHelper.data,
            },
        });
        if (status === 'succeed') return response;
        return state.data;
    } catch (e) {
        ErrorHandler.handleError(e);
        return { more: false, results: [] };
    }
};

const initWidget = async (data?: Response): Promise<Response|undefined> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.loading = false;
    return state.data;
};
const refreshWidget = async (): Promise<Response|undefined> => {
    state.loading = true;
    state.data = await fetchData();
    state.loading = false;
    return state.data;
};

useWidgetLifecycle<Response|undefined>({
    disposeWidget: undefined,
    initWidget,
    refreshWidget,
    props,
    emit,
    widgetState,
});

defineExpose<WidgetExpose<Response|undefined>>({
    initWidget,
    refreshWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="budget-status-widget"
                  v-on="widgetFrameEventHandlers"
    >
        <p-data-loader :loading="props.loading || state.loading"
                       class="chart-wrapper"
                       :loader-backdrop-opacity="1"
        >
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div class="waffle-chart">
                <div v-for="colIdx in range(0, 20)"
                     :key="`status-col-${colIdx}`"
                     class="status-col-wrapper"
                >
                    <template v-for="rowIdx in range(0, 10)">
                        <div v-if="!!state.data?.results?.[colIdx * 10 + rowIdx]"
                             :key="`status-box-${colIdx}-${rowIdx}`"
                             v-tooltip.bottom="getTooltipText(rowIdx, colIdx)"
                             class="box status-box"
                             :style="{ 'background-color': getColor(rowIdx, colIdx) }"
                        />
                        <div v-else
                             :key="`status-box-${colIdx}-${rowIdx}`"
                             class="box"
                        />
                    </template>
                </div>
            </div>
            <div class="legend-wrapper">
                <div v-for="legend in state.legends"
                     :key="`legend-${legend.label}`"
                     class="legend"
                >
                    <span class="legend-icon"
                          :style="{ 'background-color': legend.color }"
                    />
                    {{ legend.label }}
                </div>
            </div>
        </p-data-loader>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.budget-status-widget {
    .chart-wrapper {
        width: 100%;
        height: 100%;
        position: relative;
        padding-bottom: 1rem;
        .waffle-chart {
            display: flex;
            height: 87%;
            gap: 0.25rem;
            .status-col-wrapper {
                display: grid;
                width: 5%;
                height: 100%;
                gap: 0.25rem;
                .box {
                    @apply bg-gray-100;
                    width: 100%;
                    &.status-box {
                        cursor: pointer;
                    }
                }
            }
        }
        .legend-wrapper {
            @apply text-gray-600;
            position: absolute;
            bottom: 0;
            width: 100%;
            font-size: 0.75rem;
            padding-top: 1rem;
            .legend {
                display: inline-block;
                padding-right: 0.75rem;
                .legend-icon {
                    display: inline-block;
                    width: 0.625rem;
                    height: 0.625rem;
                    border-radius: 100%;
                }
            }
        }
    }
}
</style>
