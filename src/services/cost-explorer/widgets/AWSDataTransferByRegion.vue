<template>
    <cost-dashboard-card-widget-layout :title="name ? name : 'AWS Data-Transfer by Region'"
                                       class="cost-trend-line"
                                       :data-range="15"
                                       :widget-link="widgetLink"
                                       :print-mode="printMode"
    >
        <template #default>
            <div class="widget-wrapper">
                <p-data-loader :loading="loading" loader-type="skeleton"
                               disable-empty-case
                               :disable-transition="printMode"
                               class="chart-wrapper"
                >
                    <div ref="chartRef" class="chart" />
                </p-data-loader>
                <cost-dashboard-data-table
                    :fields="tableState.fields"
                    :items="tableState.items"
                    :loading="loading"
                    :this-page.sync="tableState.thisPage"
                    :page-size="5"
                    :show-legend="false"
                    :currency-rates="currencyRates"
                    :currency="currency"
                    :pagination-visible="!printMode"
                    :print-mode="printMode"
                    class="table"
                >
                    <template #provider-format="item">
                        <span v-if="item.value && providers"
                              :style="{color: providers[item.value].color}"
                        >{{ providers[item.value].label || '' }}
                        </span>
                    </template>
                </cost-dashboard-data-table>
            </div>
        </template>
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed,
    getCurrentInstance,
    onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { MapChart } from '@amcharts/amcharts4/maps';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import { DataTableFieldType } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import config from '@/lib/config';
import { gray } from '@/styles/colors';
import CostDashboardCardWidgetLayout from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import { PDataLoader } from '@spaceone/design-system';
import { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { CURRENCY } from '@/store/modules/display/config';
import { store } from '@/store';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { getConvertedFilter } from '@/services/cost-explorer/cost-analysis/lib/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import dayjs from 'dayjs';
import ErrorHandler from '@/common/composables/error/errorHandler';
import am4geodataContinentsLow from '@amcharts/amcharts4-geodata/continentsLow';
import CostDashboardDataTable from '@/services/cost-explorer/widgets/modules/CostDashboardDataTable.vue';
import { TrafficWidgetTableData } from '@/services/cost-explorer/widgets/type';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';
import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/lib/config';

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
    'data-transfer.out': ['trafficOutCost', 'trafficOutSize'],
    'data-transfer.in': ['trafficInCost', 'trafficInSize'],
    'data-transfer.etc': ['trafficEtcCost', 'trafficEtcSize'],
};

export default {
    name: 'AWSDataTransferByRegion',
    components: {
        CostDashboardCardWidgetLayout,
        CostDashboardDataTable,
        PDataLoader,
    },
    props: {
        name: {
            type: String,
            default: undefined,
        },
        options: {
            type: Object as () => WidgetOptions,
            default: () => ({}),
        },
        period: {
            type: Object,
            default: () => ({}),
        },
        filters: {
            type: Object,
            default: () => ({}),
        },
        currency: {
            type: String,
            default: CURRENCY.USD,
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as MapChart | null,
            chartRegistry: {},
            regions: computed(() => store.state.reference.region.items),
            providers: computed(() => store.state.reference.provider.items),
            data: [] as Data[],
            chartData: computed<BubbleChartData[]>(() => state.data.map(d => ({
                value: d.usd_cost,
                latitude: state.regions[d.region_code]?.continent?.latitude ?? 0,
                longitude: state.regions[d.region_code]?.continent?.longitude ?? 0,
                color: state.providers.aws?.color,
            }))),
            loading: false,
            widgetLink: computed(() => {
                if (props.printMode) return undefined;
                return {
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    params: {},
                    query: {
                        groupBy: arrayToQueryString([GROUP_BY.REGION]),
                        granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                        period: objectToQueryString(props.period),
                        filters: objectToQueryString(props.filters),
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
            return tableDataByRegion;
        };

        const tableState = reactive({
            items: computed<TableData[]>(() => Object.values(getTableDataMapByRegion(state.data))),
            fields: computed<DataTableFieldType[]>(() => [
                { name: 'provider', label: 'Region' },
                { name: 'region', label: ' ' },
                { name: 'trafficOutCost', label: 'Traffic Out', textAlign: 'right' },
                { name: 'trafficOutSize', label: ' ', type: 'size' },
                { name: 'trafficInCost', label: 'Traffic In', textAlign: 'right' },
                { name: 'trafficInSize', label: ' ', type: 'size' },
                { name: 'trafficEtcCost', label: 'etc.', textAlign: 'right' },
                { name: 'trafficEtcSize', label: ' ', type: 'size' },
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

            vm.$nextTick(() => {
                chart.events.on('ready', () => {
                    // wait for animation. amcharts animation is global settings.
                    setTimeout(() => {
                        emit('rendered');
                    }, 1000);
                });
            });

            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.events.on('ready', () => {
                emit('rendered');
            });

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
            polygonSeries.events.on('validated', () => {
                imageSeries.invalidate();
            });

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
                min: 24,
                max: 60,
                dataField: valueName,
            });
        };


        const costQueryHelper = new QueryHelper();
        const fetchData = async () => {
            costQueryHelper
                .setFilters(getConvertedFilter(props.filters))
                .addFilter(
                    { k: 'provider', v: 'aws', o: '=' }, { k: 'product', v: 'AWSDataTransfer', o: '=' },
                );
            try {
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    include_usage_quantity: true,
                    granularity: 'ACCUMULATED',
                    group_by: ['usage_type', 'region_code'],
                    start: dayjs.utc(props.period?.start).format('YYYY-MM'),
                    end: dayjs.utc(props.period?.end).format('YYYY-MM'),
                    page: {
                        limit: 15,
                    },
                    ...costQueryHelper.apiQuery,
                });
                return results;
            } catch (e) {
                throw e;
            }
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


        watch([() => state.loading, () => state.chartRef], ([loading, chartContext]) => {
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

        return {
            ...toRefs(state),
            tableState,
        };
    },
};
</script>

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
