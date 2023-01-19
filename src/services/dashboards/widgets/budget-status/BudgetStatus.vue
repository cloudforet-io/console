<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="budget-status-widget"
                  @refresh="handleRefresh"
    >
        <p-data-loader :loading="state.loading"
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
                        <div v-if="!!state.data?.[colIdx * 10 + rowIdx]"
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

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, toRefs,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import { PDataLoader, PSkeleton } from '@spaceone/design-system';
import { range } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { indigo, red, yellow } from '@/styles/colors';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { DateRange } from '@/services/dashboards/config';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { Legend, BudgetDataModel } from '@/services/dashboards/widgets/type';


type Data = BudgetDataModel['results'];

const budgetQueryHelper = new QueryHelper();
const props = defineProps<WidgetProps>();
const state = reactive({
    ...toRefs(useWidgetState<Data>(props)),
    legends: computed<Omit<Legend, 'name'>[]>(() => ([
        { label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.OVERSPENT'), color: red[400] },
        { label: '90-100%', color: yellow[500] },
        { label: '70-90%', color: indigo[500] },
        { label: '< 70%', color: indigo[100] },
    ])),
    dateRange: computed<DateRange>(() => ({
        start: state.settings?.date_range?.start,
        end: state.settings?.date_range?.end,
    })),
    widgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.BUDGET._NAME,
        params: {},
        query: {
            filters: budgetQueryHelper.setFilters(state.budgetConsoleFilters).rawQueryStrings,
        },
    })),
});

const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Util */
const getTooltipText = (rowIdx: number, colIdx: number): string => {
    const _target = state.data?.[colIdx * 10 + rowIdx];
    const budgetUsage = _target?.budget_usage ?? 0;
    return `${_target?.name} (${budgetUsage.toFixed(2)}%)`;
};
const getColor = (rowIdx: number, colIdx: number): string => {
    const _target = state.data?.[colIdx * 10 + rowIdx];
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
const fetchData = async (): Promise<Data> => {
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters(state.budgetConsoleFilters);
        const { results } = await SpaceConnector.clientV2.costAnalysis.budgetUsage.analyze({
            query: {
                granularity: state.granularity,
                group_by: [state.groupBy, 'name'],
                start: state.dateRange.start,
                end: state.dateRange.end,
                fields: {
                    total_spent: {
                        key: 'usd_cost',
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
        return results;
    } catch (e) {
        ErrorHandler.handleError(e);
        return [];
    }
};

const initWidget = async (data?: Data): Promise<Data> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.loading = false;
    return state.data;
};
const refreshWidget = async (): Promise<Data> => {
    await nextTick();
    state.loading = true;
    state.data = await fetchData();
    state.loading = false;
    return state.data;
};

const handleRefresh = () => {
    refreshWidget();
};

useWidgetLifecycle({
    disposeWidget: undefined,
    refreshWidget,
    props,
});

defineExpose<WidgetExpose<Data>>({
    initWidget,
    refreshWidget,
});
</script>
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
