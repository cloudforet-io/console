<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="cost-by-region"
    >
        <div class="content-wrapper">
            <p-data-loader class="chart-loader"
                           :loading="state.loading"
                           :data="state.data"
                           loader-type="skeleton"
                           show-data-from-scratch
            >
                <div ref="chartContext"
                     class="chart"
                />
            </p-data-loader>
            <widget-data-table :loading="state.loading"
                               :fields="state.tableFields"
                               :items="state.data?.results"
                               :currency="state.currency"
                               :currency-rates="props.currencyRates"
                               :all-reference-type-info="props.allReferenceTypeInfo"
                               :legends.sync="state.legends"
                               :this-page="state.thisPage"
                               :show-next-page="state.data?.more"
                               show-legend
                               @update:thisPage="handleUpdateThisPage"
            />
        </div>
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/config';
import { GROUP_BY } from '@/services/dashboards/widgets/config';
import type { AccumulatedDataModel } from '@/services/dashboards/widgets/type';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/use-widget-frame-props';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';


type Data = AccumulatedDataModel['results'];
interface FullData {
    results: Data;
    more: boolean;
}

const SAMPLE_PIE_DATA = [{
    country: 'France',
    sales: 100000,
}, {
    country: 'Spain',
    sales: 160000,
}, {
    country: 'United Kingdom',
    sales: 80000,
}];

const props = defineProps<WidgetProps>();
const state = reactive({
    ...toRefs(useWidgetState<FullData>(props)),
    tableFields: computed<Field[]>(() => [
        { label: 'Provider', name: GROUP_BY.PROVIDER, textOptions: { type: 'reference', referenceType: 'provider' } },
        { label: 'Region', name: GROUP_BY.REGION, textOptions: { type: 'reference', referenceType: 'region' } },
        { label: 'Cost', name: 'usd_cost_sum', textOptions: { type: 'cost' } },
    ]),
    tableItems: [],
    thisPage: 1,
    dateRange: computed<DateRange>(() => ({
        start: dayjs.utc(state.settings?.date_range?.start).format('YYYY-MM'),
        end: dayjs.utc(state.settings?.date_range?.end).format('YYYY-MM'),
    })),
});

const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);

const fetchData = async (): Promise<FullData> => {
    try {
        const query: any = {
            granularity: state.granularity,
            group_by: [GROUP_BY.REGION, GROUP_BY.PROVIDER],
            start: state.dateRange.start,
            end: state.dateRange.end,
            fields: {
                usd_cost_sum: {
                    key: 'usd_cost',
                    operator: 'sum',
                },
            },
            sort: [{ key: 'usd_cost_sum', desc: true }],
        };
        if (state.pageSize) query.page = { start: state.thisPage, limit: state.pageSize };
        const { results, more } = await SpaceConnector.clientV2.costAnalysis.cost.analyze({ query });
        return { results, more };
    } catch (e) {
        ErrorHandler.handleError(e);
        return { results: [], more: false };
    }
};

const drawChart = () => {
    const chart = chartHelper.createMapChart();
    const polygonSeries = chartHelper.createMapPolygonSeries();
    chart.series.push(polygonSeries);
    const pointSeries = chartHelper.createMapPointSeries();
    chart.series.push(pointSeries);
    pointSeries.bullets.push(() => {
        const pieChart = chartHelper.createPieChart({
            width: 32,
            height: 32,
        });
        const pieSeries = chartHelper.createPieSeries({
            categoryField: 'country',
            valueField: 'sales',
        });
        pieSeries.labels.template.set('forceHidden', true);
        pieSeries.ticks.template.set('forceHidden', true);
        pieChart.series.push(pieSeries);

        const tooltip = chartHelper.createTooltip();
        chartHelper.setPieTooltipText(pieSeries, tooltip, state.options.currency, props.currencyRates);
        pieSeries.slices.template.set('tooltip', tooltip);

        pieSeries.data.setAll(SAMPLE_PIE_DATA);
        return chartHelper.createBullet({
            sprite: pieChart,
        });
    });
    pointSeries.data.setAll(state.data);
};

const initWidget = async (data?: FullData) => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    chartHelper.clearChildrenOfRoot();
    drawChart();
    state.loading = false;
    return state.data;
};
const refreshWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    chartHelper.clearChildrenOfRoot();
    drawChart();
    state.loading = false;
    return state.data;
};

/* Event */
const handleUpdateThisPage = (thisPage: number) => {
    state.thisPage = thisPage;
    refreshWidget();
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
});

defineExpose<WidgetExpose<FullData>>({
    initWidget,
    refreshWidget,
});
</script>
<style lang="postcss" scoped>
.cost-by-region {
    .content-wrapper {
        @apply grid grid-cols-12;
        height: 100%;
        padding-left: 1.5rem;
        padding-bottom: 2.625rem;
        .chart-loader {
            @apply col-span-5;
            height: 100%;
            .chart {
                height: 100%;
            }
        }
        .widget-data-table {
            @apply col-span-7;
        }
    }
}
</style>
