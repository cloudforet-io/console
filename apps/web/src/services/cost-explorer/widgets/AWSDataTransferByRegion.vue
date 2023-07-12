<script lang="ts" setup>

import am4geodataContinentsLow from '@amcharts/amcharts4-geodata/continentsLow';
import * as am4core from '@amcharts/amcharts4/core';
import type { MapChart } from '@amcharts/amcharts4/maps';
import * as am4maps from '@amcharts/amcharts4/maps';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PDataLoader } from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import bytes from 'bytes';
import dayjs from 'dayjs';
import {
    computed, onUnmounted, reactive, ref, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';
import { CURRENCY } from '@/store/modules/settings/config';
import type { CurrencyRates } from '@/store/modules/settings/type';

import config from '@/lib/config';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import type { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/lib/config';
import { getConvertedFilter } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import CostDashboardCardWidgetLayout from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardDataTable from '@/services/cost-explorer/widgets/modules/CostDashboardDataTable.vue';
import type { TrafficWidgetTableData, WidgetProps } from '@/services/cost-explorer/widgets/type';



const valueName = 'value';

interface Data {
  region_code: string;
  usage_quantity: number;
  usage_type: 'data-transfer.out'|'data-transfer.in'|'data-transfer.etc';
  usd_cost: number;
}

interface BubbleChartData {
    value: number;
    latitude: number;
    longitude: number;
    color: string;
}

interface TableData extends TrafficWidgetTableData {
    provider?: string;
    region?: string;
}

const dataToTableFieldMap = {
    'data-transfer.out': ['transferOutCost', 'transferOutSize'],
    'data-transfer.in': ['transferInCost', 'transferInSize'],
    'data-transfer.etc': ['transferEtcCost', 'transferEtcSize'],
};

const props = withDefaults(defineProps<WidgetProps<WidgetOptions>>(), {
    name: undefined,
    options: () => ({}) as WidgetOptions,
    period: () => ({}),
    filters: () => ({}),
    currency: CURRENCY.USD,
    currencyRates: () => ({}) as CurrencyRates,
    printMode: false,
});
const emit = defineEmits<{(e: 'rendered'): void}>();
const store = useStore();
const { t } = useI18n();

const chartRef = ref<HTMLElement|null>(null);
const state = reactive({
    chart: null as MapChart | null,
    chartRegistry: {},
    regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
    data: [] as Data[],
    chartData: computed<BubbleChartData[]>(() => state.data.map((d) => ({
        value: d.usd_cost > 1 ? d.usd_cost : undefined,
        longitude: parseFloat(state.regions[d.region_code]?.longitude ?? 0),
        latitude: parseFloat(state.regions[d.region_code]?.latitude ?? 0),
        color: state.providers.aws?.color,
    }))),
    loading: false,
    widgetLink: computed(() => {
        if (props.printMode) return undefined;
        return {
            name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
            params: {},
            query: {
                group_by: arrayToQueryString([GROUP_BY.REGION]),
                granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                period: objectToQueryString(props.period),
                filters: objectToQueryString({ ...props.filters, provider: ['aws'], product: ['AWSDataTransfer'] }),
            },
        };
    }),
});

const convertOrMergeToTableData = (data: Data, _tableData?: TableData): TableData => {
    const tableData: TableData = _tableData ?? {
        provider: 'aws',
        region: state.regions[data.region_code]?.name ?? data.region_code,
    };
    const [costField, sizeField] = dataToTableFieldMap[data.usage_type] ?? [];
    if (costField) tableData[costField] = data.usd_cost;
    if (sizeField) tableData[sizeField] = data.usage_quantity;
    return tableData;
};
const getTableDataMapByRegion = (data: Data[]): Record<string, TableData> => {
    const tableDataByRegion: Record<string, TableData> = {};
    data.forEach((d) => {
        const tableData: TableData = tableDataByRegion[d.region_code];
        tableDataByRegion[d.region_code] = convertOrMergeToTableData(d, tableData);
    });
    if (Object.keys(tableDataByRegion).length > 15) return Object.fromEntries(Object.entries(tableDataByRegion).slice(0, 15));
    return tableDataByRegion;
};

const tableState = reactive({
    items: computed<TableData[]>(() => Object.values(getTableDataMapByRegion(state.data))),
    fields: computed<DataTableFieldType[]>(() => [
        { name: 'provider', label: 'Region' },
        { name: 'region', label: ' ' },
        {
            name: 'transferOut',
            label: 'Transfer-Out',
            tooltipText: t('BILLING.COST_MANAGEMENT.DASHBOARD.TOOLTIP_AWS_DATA_COST_2'),
            children: [
                { name: 'transferOutSize', type: 'size', invisible: true },
                { name: 'transferOutCost', invisible: true },
            ],
        },
        {
            name: 'transferIn',
            label: 'Transfer-In',
            tooltipText: t('BILLING.COST_MANAGEMENT.DASHBOARD.TOOLTIP_AWS_DATA_COST_3'),
            children: [
                { name: 'transferInSize', type: 'size', invisible: true },
                { name: 'transferInCost', invisible: true },
            ],
        },
        {
            name: 'transferEtc',
            label: 'Etc.',
            tooltipText: t('BILLING.COST_MANAGEMENT.DASHBOARD.TOOLTIP_AWS_DATA_COST_4'),
            invisibleChildren: true,
            children: [
                { name: 'transferEtcSize', type: 'size', invisible: true },
                { name: 'transferEtcCost', invisible: true },
            ],
        },
    ]),
    thisPage: 1,
});

const disposeChart = (chartContext) => {
    if (state.chartRegistry[chartContext]) {
        state.chartRegistry[chartContext].dispose();
        delete state.chartRegistry[chartContext];
    }
};

const drawChart = (chartContext) => {
    const createChart = () => {
        disposeChart(chartContext);
        state.chartRegistry[chartContext] = am4core.create(chartContext, am4maps.MapChart);
        return state.chartRegistry[chartContext];
    };
    const chart = createChart();

    chart.events.on('ready', () => {
        emit('rendered');
    });

    if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
    chart.chartContainer.wheelable = true;
    chart.zoomControl = new am4maps.ZoomControl();

    chart.geodata = am4geodataContinentsLow;
    chart.minWidth = 300;
    chart.minHeight = 300;
    chart.projection = new am4maps.projections.Miller();
    chart.responsive.enabled = true;
    chart.chartContainer.wheelable = false;

    const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
    if (props.printMode) polygonSeries.showOnInit = false;
    polygonSeries.useGeodata = true;
    polygonSeries.exclude = ['antarctica'];
    polygonSeries.nonScalingStroke = true;
    polygonSeries.strokeWidth = 0.5;
    polygonSeries.mapPolygons.template.fill = am4core.color(gray[200]);
    polygonSeries.calculateVisualCenter = true;

    const imageSeries = chart.series.push(new am4maps.MapImageSeries());
    if (props.printMode) imageSeries.showOnInit = false;
    // polygonSeries.events.on('validated', () => {
    //     imageSeries.invalidate();
    // });

    const imageTemplate = imageSeries.mapImages.template;
    imageTemplate.nonScaling = true;
    imageTemplate.propertyFields.longitude = 'longitude';
    imageTemplate.propertyFields.latitude = 'latitude';

    const circle = imageTemplate.createChild(am4core.Circle);
    circle.fillOpacity = 0.8;
    circle.propertyFields.fill = 'color';

    imageSeries.data = state.chartData;
    imageSeries.dataFields.value = valueName;

    imageSeries.heatRules.push({
        target: circle,
        property: 'radius',
        min: 10,
        max: 60,
        dataField: 'value',
    });
};

const costQueryHelper = new QueryHelper();
const fetchData = async () => {
    costQueryHelper
        .setFilters(getConvertedFilter(props.filters))
        .addFilter({ k: 'provider', v: 'aws', o: '=' }, { k: 'product', v: 'AWSDataTransfer', o: '=' });
    const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
        include_usage_quantity: true,
        granularity: 'ACCUMULATED',
        group_by: ['usage_type', 'region_code'],
        start: dayjs.utc(props.period?.start).format('YYYY-MM'),
        end: dayjs.utc(props.period?.end).format('YYYY-MM'),
        ...costQueryHelper.apiQuery,
    });
    const convertedResults = results.map((d) => {
        let usageQuantity = d.usage_quantity;
        usageQuantity = bytes.parse(`${d.usage_quantity}GB`);
        return {
            ...d,
            usage_quantity: usageQuantity,
        };
    });
    return convertedResults;
};
const getChartData = async () => {
    try {
        state.loading = true;
        state.data = await fetchData();
    } catch (e) {
        ErrorHandler.handleError(e);
        state.data = [];
    } finally {
        state.loading = false;
    }
};

watch([() => state.loading, () => chartRef.value], ([loading, chartContext]) => {
    if (!loading && chartContext) {
        drawChart(chartContext);
    }
}, { immediate: false });

watch([() => props.period, () => props.filters], async () => {
    await getChartData();
});

(async () => {
    // LOAD REFERENCE STORE
    await Promise.allSettled([
        store.dispatch('reference/region/load'),
        store.dispatch('reference/provider/load'),
    ]);
    await getChartData();
})();

onUnmounted(() => {
    if (state.chart) state.chart.dispose();
});

</script>

<template>
    <cost-dashboard-card-widget-layout :title="name ? name : t('BILLING.COST_MANAGEMENT.DASHBOARD.AWS_DATA_TRANSFER_REGION')"
                                       class="cost-trend-line"
                                       :data-range="15"
                                       :widget-link="state.widgetLink"
                                       :print-mode="printMode"
    >
        <template #default>
            <div class="widget-wrapper">
                <p-data-loader :loading="state.loading"
                               loader-type="skeleton"
                               disable-empty-case
                               :disable-transition="printMode"
                               class="chart-wrapper"
                >
                    <div ref="chartRef"
                         class="chart"
                    />
                </p-data-loader>
                <cost-dashboard-data-table
                    v-model:this-page="tableState.thisPage"
                    :fields="tableState.fields"
                    :items="tableState.items"
                    :loading="state.loading"
                    :page-size="5"
                    :show-legend="false"
                    :currency-rates="currencyRates"
                    :currency="currency"
                    :pagination-visible="!printMode"
                    :print-mode="printMode"
                    class="table"
                >
                    <template #provider-format="item">
                        <span v-if="item.value && state.providers"
                              :style="{color: state.providers[item.value].color}"
                        >{{ state.providers[item.value].label || '' }}
                        </span>
                    </template>
                </cost-dashboard-data-table>
            </div>
        </template>
    </cost-dashboard-card-widget-layout>
</template>

<style lang="postcss" scoped>
.widget-wrapper {
    @apply flex w-full h-full flex-wrap;
    .chart-wrapper {
        @apply border border-gray-200;
        flex-basis: 100%;
        padding: 1rem;
    }
    .chart {
        @apply w-full h-full;
        height: 19rem;
        flex-shrink: 0;
        flex-grow: 1;
    }
    .table {
        @apply flex flex-col;
        flex-basis: 100%;
        margin-top: 1rem;
        margin-left: 0;
    }
}

</style>
