<template>
    <widget-frame :title="state.title"
                  :size="state.size"
                  :width="704"
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
                               :items="state.tableItems"
                               :currency="state.options.currency"
                               :currency-rates="props.currencyRates"
            />
        </div>
    </widget-frame>
</template>

<script setup lang="ts">
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRefs,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import type { WidgetProps } from '@/services/dashboards/widgets/config';
import { GROUP_BY } from '@/services/dashboards/widgets/config';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/use-widget-state';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/view-config';

const SAMPLE_RAW_DATA = {
    more: true,
    results: [
        {
            title: 'Asia Pacific',
            region_code: 'ap-northeast-2',
            latitude: 47.212106,
            longitude: 103.183594,
            color: '#FF9900',
            pieData: [
                {
                    category: 'AWS',
                    color: '#FF9900',
                    provider: 'aws',
                    value: 11496.92345235,
                },
            ],
        },
        {
            title: 'North America',
            continent_code: 'north_america',
            latitude: 39.563353,
            longitude: -99.316406,
            color: '#4285F4',
            pieData: [
                {
                    category: 'AWS',
                    color: '#FF9900',
                    provider: 'aws',
                    value: 321,
                },
                {
                    category: 'Google',
                    color: '#4285F4',
                    provider: 'google_cloud',
                    value: 11.31,
                },
            ],
        },
    ],
};
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
    ...toRefs(useWidgetState(props)),
    groupBy: GROUP_BY.REGION,
    groupByLabel: computed<string>(() => {
        const groupBy = state.groupBy;
        return GROUP_BY_ITEM_MAP[groupBy]?.label ?? groupBy;
    }),
    tableFields: computed(() => [
        { label: 'Provider', name: GROUP_BY.PROVIDER },
        { label: 'Region', name: GROUP_BY.REGION },
        { label: 'Cost', name: 'cost' },
    ]),
    tableItems: [],
});

const chartContext = ref<HTMLElement|null>(null);
const {
    createMapChart, createMapPolygonSeries, createMapPointSeries, createPieChart, createPieSeries,
    createBullet, createTooltip, setPieTooltipText,
    disposeRoot, clearChildrenOfRoot,
} = useAmcharts5(chartContext);

const fetchData = async () => new Promise((resolve) => {
    setTimeout(() => {
        resolve(SAMPLE_RAW_DATA.results);
    }, 1000);
});

const drawChart = () => {
    const chart = createMapChart();
    const polygonSeries = createMapPolygonSeries();
    chart.series.push(polygonSeries);
    const pointSeries = createMapPointSeries();
    chart.series.push(pointSeries);
    pointSeries.bullets.push(() => {
        const pieChart = createPieChart({
            width: 32,
            height: 32,
        });
        const pieSeries = createPieSeries({
            categoryField: 'country',
            valueField: 'sales',
        });
        pieSeries.labels.template.set('forceHidden', true);
        pieSeries.ticks.template.set('forceHidden', true);
        pieChart.series.push(pieSeries);

        const tooltip = createTooltip();
        setPieTooltipText(pieSeries, tooltip, state.options.currency, props.currencyRates);
        pieSeries.slices.template.set('tooltip', tooltip);

        pieSeries.data.setAll(SAMPLE_PIE_DATA);
        return createBullet({
            sprite: pieChart,
        });
    });
    pointSeries.data.setAll(state.data);
};

const initWidget = async () => {
    state.loading = true;
    state.data = await fetchData();
    await nextTick();
    clearChildrenOfRoot();
    drawChart();
    state.loading = false;
};

useWidgetLifecycle({
    initWidget, disposeWidget: disposeRoot,
});

defineExpose({
    refreshWidget: initWidget,
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
