<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="budget-status-widget"
                  @refresh="handleRefresh"
    >
        <p-data-loader :loading="state.loading"
                       class="chart-wrapper"
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
                             :style="{ 'background-color': state.data?.[colIdx * 10 + rowIdx]?.color }"
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
    computed,
    defineExpose,
    defineProps, nextTick, reactive, toRefs,
} from 'vue';

import { PDataLoader, PSkeleton } from '@spaceone/design-system';
import { range } from 'lodash';

import { i18n } from '@/translations';

import { indigo, red, yellow } from '@/styles/colors';

import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/config';
import type { Legend } from '@/services/dashboards/widgets/type';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/use-widget-frame-props';
import type { WidgetState } from '@/services/dashboards/widgets/use-widget-state';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';

const props = defineProps<WidgetProps>();

interface BudgetStatusWidgetState extends WidgetState {
    data: Data[]|undefined;
    legends: ComputedRef<Omit<Legend, 'name'>[]>;
}
const state = reactive({
    ...toRefs(useWidgetState<Data[]>(props)),
    legends: computed<Omit<Legend, 'name'>[]>(() => ([
        { label: i18n.t('BILLING.COST_MANAGEMENT.MAIN.OVERSPENT'), color: red[400] },
        { label: '90-100%', color: yellow[500] },
        { label: '70-90%', color: indigo[500] },
        { label: '< 70%', color: indigo[100] },
    ])),
} as BudgetStatusWidgetState);

const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

interface Data {
    budgetId: string;
    budgetName: string;
    color: string;
    usage: number;
    limit: number;
    usdCost: number;
}
/* Api */
const SAMPLE_DATA = [
    ...range(0, 5).map((d) => ({
        budgetId: `budget${d}`,
        budgetName: `budget ${d}`,
        color: red[400],
        usage: 39,
        limit: 155,
        usdCost: 4124,
    })),
    ...range(5, 7).map((d) => ({
        budgetId: `budget${d}`,
        budgetName: `budget ${d}`,
        color: yellow[500],
        usage: 39,
        limit: 155,
        usdCost: 4124,
    })),
    ...range(7, 15).map((d) => ({
        budgetId: `budget${d}`,
        budgetName: `budget ${d}`,
        color: indigo[500],
        usage: 39,
        limit: 155,
        usdCost: 4124,
    })),
];
const fetchData = async (): Promise<Data[]> => new Promise((resolve) => {
    setTimeout(() => {
        resolve(SAMPLE_DATA);
    }, 1000);
});

const initWidget = async (data?: Data[]): Promise<Data[]> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    state.loading = false;
    return state.data;
};

const refreshWidget = async (): Promise<Data[]> => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    state.loading = false;
    return state.data;
};

/* Util */
const getTooltipText = (rowIdx, colIdx): string => {
    if (!state.data) return '';
    const index = colIdx * 10 + rowIdx;
    const limit = state.data[index].limit;
    const usdCost = state.data[index].usdCost;
    const usage = state.data[index].usage;

    let percentage;
    if (usdCost === 0) percentage = '0%';
    else if (limit === 0) percentage = '-';
    else percentage = `${usage.toFixed(2)}%`;
    return `${state.data[index].budgetName} (${percentage})`;
};

const handleRefresh = () => {
    refreshWidget();
};

defineExpose<WidgetExpose<Data[]>>({
    initWidget,
    refreshWidget,
});
</script>
<style lang="postcss" scoped>
.budget-status-widget {
    .chart-wrapper {
        width: 100%;
        height: 100%;
        padding: 0 1.5rem 1.5rem 1.5rem;
        .waffle-chart {
            display: flex;
            height: 85%;
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
            display: flex;
            gap: 0.75rem;
            font-size: 0.75rem;
            padding-top: 1rem;
            .legend {
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
