<template>
    <cost-dashboard-card-widget-layout
        :title="$t('BILLING.COST_MANAGEMENT.DASHBOARD.COST_BY_REGION')"
        :data-range="15"
        :widget-link="widgetLink"
    >
        <template #default>
            <div class="widget-wrapper">
                <p-data-loader :loading="loading"
                               loader-type="skeleton"
                               disable-empty-case
                               class="chart-wrapper"
                >
                    <div ref="chartRef" class="chart" />
                    <div v-for="(item) in chartLegends" :key="item" class="circle-wrapper">
                        <p v-if="providers" class="circle" :style="{background: providers[item].color}" /><span>{{ providers[item].label || '' }}</span>
                    </div>
                </p-data-loader>
                <cost-dashboard-data-table
                    :fields="tableState.fields"
                    :items="tableState.items"
                    :loading="tableState.loading"
                    :this-page.sync="tableState.thisPage"
                    :page-size="8"
                    :chart="chart"
                    :show-legend="false"
                    :currency-rates="currencyRates"
                    :currency="currency"
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
    computed, defineComponent,
    onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import { cloneDeep } from 'lodash';
import { MapChart } from '@amcharts/amcharts4/maps';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodataContinentsLow from '@amcharts/amcharts4-geodata/continentsLow';
import config from '@/lib/config';
import { gray } from '@/styles/colors';
import { store } from '@/store';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { continentData } from '@/services/billing/cost-management/cost-dashboard/lib/config';
import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardDataTable from '@/services/billing/cost-management/widgets/modules/CostDashboardDataTable.vue';
import { WidgetProps } from '@/services/billing/cost-management/widgets/type';
import { CURRENCY } from '@/store/modules/display/config';
import dayjs from 'dayjs';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { getConvertedFilter } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';
import { GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
import { PDataLoader, PSkeleton } from '@spaceone/design-system';


const categoryKey = 'title';
const valueName = 'value';

interface PieChartData {
    category?: string;
    color?: string;
    provider?: string;
    value?: number;
}

interface DefaultContinentData {
    continent_code: string;
    height: number;
    width: number;
    latitude: number;
    longitude: number;
    pieData: PieChartData[];
    title: string;
}

export default defineComponent<WidgetProps>({
    name: 'CostByRegion',
    components: {
        CostDashboardDataTable,
        CostDashboardCardWidgetLayout,
        PDataLoader,
        PSkeleton,
    },
    props: {
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
    },
    setup(props: WidgetProps) {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as MapChart | null,
            chartRegistry: {},
            regions: computed(() => store.state.resource.region.items),
            providers: computed(() => store.state.resource.provider.items),
            loading: true,
            chartData: [] as DefaultContinentData[],
            widgetLink: computed(() => ({
                name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                params: {},
                query: {
                    granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                    groupBy: arrayToQueryString([GROUP_BY.REGION]),
                    period: objectToQueryString(props.period),
                    filters: objectToQueryString(props.filters),
                },
            })),
            chartLegends: computed(() => {
                const legends = new Set();
                state.chartData.forEach((item) => {
                    if (item.pieData) {
                        item.pieData.forEach((pieItem) => {
                            legends.add(pieItem.provider);
                        });
                    }
                });
                return legends;
            }),
        });

        const tableState = reactive({
            loading: false,
            items: [],
            fields: computed(() => [
                { name: 'provider', label: 'Provider' },
                { name: 'region', label: ' ' },
                { name: 'usd_cost', label: 'Cost', textAlign: 'right' },
            ]),
            totalCount: 15,
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
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;

            chart.geodata = am4geodataContinentsLow;
            chart.projection = new am4maps.projections.Miller();
            chart.responsive.enabled = true;
            chart.chartContainer.wheelable = false;

            const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
            polygonSeries.useGeodata = true;
            polygonSeries.exclude = ['antarctica'];
            polygonSeries.mapPolygons.template.fill = am4core.color(gray[200]);
            // polygonSeries.calculateVisualCenter = true;

            const pieSeries = chart.series.push(new am4maps.MapImageSeries());
            const pieTemplate = pieSeries.mapImages.template;
            pieTemplate.propertyFields.latitude = 'latitude';
            pieTemplate.propertyFields.longitude = 'longitude';

            const pieChartTemplate = pieTemplate.createChild(am4charts.PieChart);
            pieChartTemplate.adapter.add('data', (data, target) => {
                if (target.dataItem) return target.dataItem.dataContext.pieData;
                return [];
            });
            pieChartTemplate.propertyFields.width = 'width';
            pieChartTemplate.propertyFields.height = 'height';
            // pieChartTemplate.horizontalCenter = 'middle';
            // pieChartTemplate.verticalCenter = 'middle';

            const pieSeriesTemplate = pieChartTemplate.series.push(new am4charts.PieSeries());
            pieSeriesTemplate.dataFields.category = categoryKey;
            pieSeriesTemplate.dataFields.value = valueName;
            pieSeriesTemplate.labels.template.disabled = true;
            pieSeriesTemplate.ticks.template.disabled = true;
            pieSeriesTemplate.slices.template.propertyFields.fill = 'color';

            pieSeries.data = state.chartData;
        };


        const setPieChartData = (chartData) => {
            const _continentData = cloneDeep(continentData);
            chartData.forEach((d) => {
                const target = _continentData.find(continent => continent.continent_code === (state.regions[d.region_code]?.continent?.continent_code));
                if (target) {
                    target.pieData.push({
                        category: `${d.provider}:${state.regions[d.region_code]?.name}`,
                        color: state.providers[d.provider]?.color || '',
                        value: d.usd_cost,
                        provider: d.provider,
                    });
                }
            });
            return _continentData;
        };

        const costQueryHelper = new QueryHelper();
        const fetchData = async () => {
            costQueryHelper.setFilters(getConvertedFilter(props.filters));
            try {
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    include_usage_quantity: false,
                    granularity: 'ACCUMULATED',
                    group_by: ['provider', 'region_code'],
                    start: dayjs.utc(props.period?.start).format('YYYY-MM-DD'),
                    end: dayjs.utc(props.period?.end).endOf('month').format('YYYY-MM-DD'),
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
                tableState.loading = true;
                const results = await fetchData();
                state.chartData = setPieChartData(results); // pie chart data (continent, latitude, etc.)
                tableState.items = results.map(d => ({ // table data (usd_cost, region, provider)
                    usd_cost: d.usd_cost,
                    provider: d.provider || '',
                    region: state.regions[d.region_code]?.name || d.region_code,
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
                state.chartData = [];
                tableState.items = [];
            } finally {
                state.loading = false;
                tableState.loading = false;
            }
        };

        watch([() => state.loading, () => state.chartRef], ([loading, chartContext]) => {
            if (!loading && chartContext) {
                drawChart(chartContext);
            }
        }, { immediate: false });

        watch([() => props.period, () => props.filters], () => {
            getChartData();
        });

        (async () => {
            await store.dispatch('resource/region/load');
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
});
</script>

<style lang="postcss" scoped>
.widget-wrapper {
    @apply flex w-full h-full flex-wrap;
    .chart-wrapper {
        @apply border border-gray-200;
        flex-basis: calc(50% - 1.875rem);
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
        flex-basis: 50%;
        margin-left: 1.875rem;
    }
    .circle-wrapper {
        display: inline-flex;
        align-items: center;
        .circle {
            @apply inline-block rounded-full;
            margin-right: 0.25rem;
            width: 0.5rem;
            height: 0.5rem;
        }
        span {
            @apply mr-4 text-gray-500;
            font-size: 0.75rem;
            line-height: 1.5;
        }
    }
}

@screen tablet {
    .widget-wrapper {
        .chart-wrapper {
            flex-basis: 100%;
        }
        .table {
            flex-basis: 100%;
            margin-top: 1rem;
            margin-left: 0;
        }
    }
}
</style>
