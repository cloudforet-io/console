<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="aws-data-transfer-by-region"
                  @refresh="refreshWidget"
    >
        <template #header-right>
            <widget-frame-header-dropdown :items="state.selectorItems"
                                          :selected="state.selectedSelectorType"
                                          @select="handleSelectSelectorType"
            />
        </template>

        <div class="chart-wrapper">
            <p-data-loader class="chart-loader"
                           :loading="state.loading"
                           :data="state.data"
                           loader-type="skeleton"
                           disable-empty-case
                           :loader-backdrop-opacity="1"
                           show-data-from-scratch
            >
                <div ref="chartContext"
                     class="chart"
                />
            </p-data-loader>
        </div>
        <widget-data-table :loading="state.loading"
                           :fields="state.tableFields"
                           :items="state.data?.results"
                           :currency="state.currency"
                           :currency-rates="props.currencyRates"
                           :all-reference-type-info="props.allReferenceTypeInfo"
                           :this-page="state.thisPage"
                           :show-next-page="state.data?.more"
                           :legends="state.legends"
                           :color-set="colorSet"
                           show-legend
                           disable-toggle
                           @update:thisPage="handleUpdateThisPage"
        />
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef, toRefs,
} from 'vue';
import type { Location } from 'vue-router/types/router';

import type { Circle } from '@amcharts/amcharts5';
import { Template } from '@amcharts/amcharts5';
import { PDataLoader } from '@spaceone/design-system';

import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import type { RegionReferenceMap } from '@/store/modules/reference/region/type';

import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import type { WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { GROUP_BY } from '@/services/dashboards/widgets/_configs/config';
import { getPieChartLegends } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
// eslint-disable-next-line import/no-cycle
import { getWidgetLocationFilters } from '@/services/dashboards/widgets/_helpers/widget-helper';
import { sortTableData } from '@/services/dashboards/widgets/_helpers/widget-table-helper';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { CostAnalyzeDataModel, Legend } from '@/services/dashboards/widgets/type';


type Data = CostAnalyzeDataModel['results'];
interface FullData {
    results: Data;
    more: boolean;
}

interface CircleData {
    region_code: string;
    latitude: number;
    longitude: number;
    _total_usd_cost_sum?: number;
    _total_usage_quantity?: number;
    circleSettings?: {
        fill: string;
    }
}

const USAGE_SOURCE_UNIT = 'GB';

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const props = defineProps<WidgetProps>();
const state = reactive({
    ...toRefs(useWidgetState<FullData>(props)),
    fieldsKey: computed<string>(() => (state.selectedSelectorType === 'cost' ? 'usd_cost' : 'usage_quantity')),
    legends: [] as Legend[],
    chartData: computed<CircleData[]>(() => getRefinedCircleData(state.data?.results)),
    tableFields: computed<Field[]>(() => {
        const textOptions: Field['textOptions'] = {
            type: state.fieldsKey === 'usd_cost' ? 'cost' : 'size',
            sourceUnit: USAGE_SOURCE_UNIT,
        };
        return [
            { label: 'Region', name: GROUP_BY.REGION, textOptions: { type: 'reference', referenceType: 'region' } },
            {
                name: `${state.fieldsKey}_sum.0.value`, label: 'Transfer-out', textOptions, textAlign: 'right',
            },
            {
                name: `${state.fieldsKey}_sum.1.value`, label: 'Transfer-in', textOptions, textAlign: 'right',
            },
            {
                name: `${state.fieldsKey}_sum.2.value`, label: 'etc.', textOptions, textAlign: 'right',
            },
        ];
    }),
    thisPage: 1,
    dateRange: computed<DateRange>(() => ({
        start: state.settings?.date_range?.start,
        end: state.settings?.date_range?.end,
    })),
    widgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
        params: {},
        query: {
            granularity: primitiveToQueryString(state.granularity),
            group_by: arrayToQueryString([state.groupBy]),
            period: objectToQueryString(state.dateRange),
            filters: objectToQueryString({
                ...getWidgetLocationFilters(state.options.filters),
                provider: ['aws'],
                product: ['AWSDataTransfer'],
            }),
        },
    })),
});
const storeState = reactive({
    regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Util */
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.data?.results?.length ?? 0),
});
const getRefinedCircleData = (results?: Data): CircleData[] => {
    if (!results?.length) return [];
    return results.map((d, idx) => ({
        ...d,
        region_code: d.region_code,
        longitude: parseFloat(storeState.regions[d.region_code]?.longitude ?? 0),
        latitude: parseFloat(storeState.regions[d.region_code]?.latitude ?? 0),
        circleSettings: {
            fill: colorSet.value[idx],
        },
    }));
};

/* Api */
const fetchData = async (): Promise<FullData> => {
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters([
            { k: 'usage_type', v: ['data-transfer.out', 'data-transfer.in', 'data-transfer.etc'], o: '' },
            { k: 'product', v: 'AWSDataTransfer', o: '=' },
            { k: 'usage_type', v: null, o: '!=' },
        ]);
        apiQueryHelper.addFilter(...state.consoleFilters);
        if (state.pageSize) apiQueryHelper.setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);
        const { results, more } = await SpaceConnector.clientV2.costAnalysis.cost.analyze({
            query: {
                granularity: state.granularity,
                group_by: [state.groupBy, 'usage_type'],
                start: state.dateRange.start,
                end: state.dateRange.end,
                fields: {
                    usd_cost_sum: {
                        key: 'usd_cost',
                        operator: 'sum',
                    },
                    usage_quantity_sum: {
                        key: 'usage_quantity',
                        operator: 'sum',
                    },
                },
                field_group: ['usage_type'],
                sort: [{ key: '_total_usd_cost_sum', desc: true }],
                ...apiQueryHelper.data,
            },
        });
        return { results: sortTableData(results, 'usage_type'), more };
    } catch (e) {
        ErrorHandler.handleError(e);
        return { results: [], more: false };
    }
};

const drawChart = (chartData: CircleData[]) => {
    const chart = chartHelper.createMapChart();
    const polygonSeries = chartHelper.createMapPolygonSeries();
    chart.series.push(polygonSeries);
    const pointSeries = chartHelper.createMapPointSeries({
        calculateAggregates: true,
        valueField: `_total_${state.fieldsKey}_sum`,
    });
    chart.series.push(pointSeries);

    const circleTemplate = Template.new({}) as Template<Circle>;
    pointSeries.bullets.push(() => {
        const circle = chartHelper.createCircle({
            radius: 5,
            fillOpacity: 0.6,
            templateField: 'circleSettings',
        }, circleTemplate);
        return chartHelper.createBullet({
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

    pointSeries.data.setAll(chartData);
};

const initWidget = async (data?: FullData): Promise<FullData> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.legends = getPieChartLegends(state.data.results, state.groupBy);
    chartHelper.clearChildrenOfRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};
const refreshWidget = async (thisPage = 1): Promise<FullData> => {
    await nextTick();
    state.loading = true;
    state.thisPage = thisPage;
    state.data = await fetchData();
    state.legends = getPieChartLegends(state.data.results, state.groupBy);
    chartHelper.clearChildrenOfRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

/* Event */
const handleSelectSelectorType = async (selected: string) => {
    state.selectedSelectorType = selected;
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
};
const handleUpdateThisPage = (thisPage: number) => {
    state.thisPage = thisPage;
    refreshWidget(thisPage);
};

/* Init */
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/region/load'),
    ]);
})();

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    refreshWidget,
    props,
});

defineExpose<WidgetExpose<FullData>>({
    initWidget,
    refreshWidget,
});
</script>
<style lang="postcss" scoped>
.aws-data-transfer-by-region {
    .chart-wrapper {
        height: 10.125rem;
        margin-bottom: 1rem;
        .chart-loader {
            height: 100%;
            .chart {
                @apply border border-gray-200;
                height: calc(100% - 2px);
                width: calc(100% - 2px);
            }
        }
    }
    .widget-data-table {
        height: 50%;
    }
    &.full {
        .widget-data-table {
            height: auto;
        }
    }
}
</style>
