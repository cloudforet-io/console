<template>
    <widget-frame :title="state.title"
                  :size="state.size"
                  :width="704"
                  class="aws-data-transfer-by-region"
    >
        <template #header-right>
            <widget-frame-header-dropdown :items="state.selectorItems"
                                          :selected="state.selectedSelectorType"
                                          @select="handleSelectSelectorType"
            />
        </template>
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

import type { Circle } from '@amcharts/amcharts5';
import { color, Template } from '@amcharts/amcharts5';
import { PDataLoader } from '@spaceone/design-system';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import { blue, coral, red } from '@/styles/colors';

import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
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
            usage_quantity: 'data-transfer.etc',
            region_code: 'ap-northeast-2',
            latitude: 47.212106,
            longitude: 103.183594,
            value: 30,
            circleSettings: {
                fill: color(coral[400]),
            },
        },
        {
            usage_quantity: 'data-transfer.out',
            region_code: 'ap-northeast-2',
            latitude: 47.212106,
            longitude: 103.183594,
            value: 234,
            circleSettings: {
                fill: color(blue[400]),
            },
        },
        {
            usage_quantity: 'data-transfer.out',
            continent_code: 'north_america',
            latitude: 39.563353,
            longitude: -99.316406,
            value: 333,
            circleSettings: {
                fill: color(red[400]),
            },
        },
    ],
};

const props = defineProps<WidgetProps>();
const state = reactive({
    ...toRefs(useWidgetState(props)),
    groupBy: GROUP_BY.REGION,
    groupByLabel: computed<string>(() => {
        const groupBy = state.groupBy;
        return GROUP_BY_ITEM_MAP[groupBy]?.label ?? groupBy;
    }),
    tableFields: computed(() => [
        { label: 'Region', name: GROUP_BY.REGION },
        { label: 'Transfer-out', name: 'data-transfer.out' },
        { label: 'Transfer-in', name: 'data-transfer.in' },
        { label: 'etc.', name: 'data-transfer.etc' },
    ]),
    tableItems: [],
});

const chartContext = ref<HTMLElement|null>(null);
const {
    createMapChart, createMapPolygonSeries, createMapPointSeries, createBullet,
    disposeRoot, clearChildrenOfRoot, createCircle, setChartColors,
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
    const pointSeries = createMapPointSeries({
        calculateAggregates: true,
        valueField: 'value',
        // polygonIdField: 'usage_quantity',
    });
    chart.series.push(pointSeries);
    setChartColors(chart, state.colorSet); // TODO: not working...

    const circleTemplate = Template.new({}) as Template<Circle>;
    pointSeries.bullets.push(() => {
        const circle = createCircle({
            radius: 5,
            // fill: color(0xff621f), // TODO: must change dynamically
            fillOpacity: 0.6,
            templateField: 'circleSettings',
        }, circleTemplate);
        return createBullet({
            sprite: circle,
            dynamic: true,
        });
    });
    pointSeries.set('heatRules', [{
        target: circleTemplate,
        min: 5,
        max: 20,
        key: 'radius',
        dataField: 'value',
    }]);

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

/* Event */
const handleSelectSelectorType = (selected: string) => {
    state.selectedSelectorType = selected;
    initWidget();
};


useWidgetLifecycle({
    initWidget, disposeWidget: disposeRoot,
});

defineExpose({
    refreshWidget: initWidget,
});
</script>
<style lang="postcss" scoped>
.aws-data-transfer-by-region {
    .content-wrapper {
        height: 11.5rem;
        .chart-loader {
            height: 100%;
            .chart {
                height: 100%;
            }
        }
    }
}
</style>
