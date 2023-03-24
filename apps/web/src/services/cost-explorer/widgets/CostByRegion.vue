<template>
    <cost-dashboard-card-widget-layout
        :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.COST_BY_REGION')"
        :data-range="15"
        :widget-link="widgetLink"
        :print-mode="printMode"
    >
        <template #default>
            <div class="widget-wrapper"
                 :class="{responsive: !printMode}"
            >
                <p-data-loader :loading="loading"
                               loader-type="skeleton"
                               disable-empty-case
                               :disable-transition="printMode"
                               class="chart-wrapper"
                >
                    <div ref="chartRef"
                         class="chart"
                    />
                    <div class="legend-wrapper">
                        <span v-for="(item) in chartLegends"
                              :key="item"
                              class="circle-wrapper"
                        >
                            <span v-if="providers"
                                  class="circle"
                                  :style="{background: providers[item].color}"
                            /><span class="label">{{ providers[item].label || '' }}</span>
                        </span>
                    </div>
                </p-data-loader>
                <cost-dashboard-data-table
                    :fields="tableState.fields"
                    :items="tableState.items"
                    :loading="tableState.loading"
                    :this-page.sync="tableState.thisPage"
                    :page-size="8"
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
    computed, defineComponent, onUnmounted, reactive, toRefs, watch,
} from 'vue';

import am4geodataContinentsLow from '@amcharts/amcharts4-geodata/continentsLow';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import type { MapChart } from '@amcharts/amcharts4/maps';
import * as am4maps from '@amcharts/amcharts4/maps';
import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';
import {
    groupBy, sum,
} from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import { CURRENCY } from '@/store/modules/display/config';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';
import type { RegionReferenceMap } from '@/store/modules/reference/region/type';

import config from '@/lib/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import { GRANULARITY, GROUP_BY } from '@/services/cost-explorer/lib/config';
import { getConvertedFilter } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { RegionMap } from '@/services/cost-explorer/widgets/lib/config';
import { getTooltipText } from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import CostDashboardCardWidgetLayout
    from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardDataTable from '@/services/cost-explorer/widgets/modules/CostDashboardDataTable.vue';
import type { WidgetProps } from '@/services/cost-explorer/widgets/type';

const CATEGORY_KEY = 'category';
const VALUE_KEY = 'value';

interface PieChartData {
    category?: string;
    color?: string;
    provider?: string;
    value?: number;
}

interface ChartData {
    continent_code: string;
    height: number;
    width: number;
    latitude: number;
    longitude: number;
    pieData?: PieChartData[];
    title: string;
}

interface OriginData {
    usd_cost: number;
    provider: string;
    region_code: string;
}

interface TableData extends Omit<OriginData, 'region_code'> {
    region: string;
}

export default defineComponent<WidgetProps>({
    name: 'CostByRegion',
    components: {
        CostDashboardDataTable,
        CostDashboardCardWidgetLayout,
        PDataLoader,
    },
    props: {
        name: {
            type: String,
            default: undefined,
        },
        options: {
            type: Object,
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
    setup(props: WidgetProps, { emit }) {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as MapChart | null,
            chartRegistry: {},
            regions: computed<RegionReferenceMap>(() => store.getters['reference/regionItems']),
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
            loading: true,
            chartData: [] as ChartData[],
            widgetLink: computed(() => {
                if (props.printMode) return undefined;
                return {
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    params: {},
                    query: {
                        granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                        group_by: arrayToQueryString([GROUP_BY.REGION]),
                        period: objectToQueryString(props.period),
                        filters: objectToQueryString(props.filters),
                    },
                };
            }),
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
            items: [] as TableData[],
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

            chart.events.on('ready', () => {
                emit('rendered');
            });

            chart.geodata = am4geodataContinentsLow;
            chart.projection = new am4maps.projections.Miller();
            chart.minWidth = 300;
            chart.minHeight = 300;
            chart.responsive.enabled = true;
            chart.chartContainer.wheelable = false;

            const polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
            if (props.printMode) polygonSeries.showOnInit = false;
            polygonSeries.useGeodata = true;
            polygonSeries.exclude = ['antarctica'];
            polygonSeries.mapPolygons.template.fill = am4core.color(gray[200]);
            polygonSeries.calculateVisualCenter = true;

            const pieSeries = chart.series.push(new am4maps.MapImageSeries());
            if (props.printMode) pieSeries.showOnInit = false;
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
            pieChartTemplate.horizontalCenter = 'middle';
            pieChartTemplate.verticalCenter = 'middle';

            const pieSeriesTemplate = pieChartTemplate.series.push(new am4charts.PieSeries());
            pieSeriesTemplate.tooltip.fontSize = 14;
            pieSeriesTemplate.dataFields.category = CATEGORY_KEY;
            pieSeriesTemplate.dataFields.value = VALUE_KEY;
            pieSeriesTemplate.labels.template.disabled = true;
            pieSeriesTemplate.ticks.template.disabled = true;
            pieSeriesTemplate.slices.template.propertyFields.fill = 'color';
            pieSeriesTemplate.slices.template.adapter.add('tooltipText', (tooltipText, target) => {
                if (target.tooltipDataItem && target.tooltipDataItem.dataContext) {
                    const currencyMoney = currencyMoneyFormatter(target.dataItem.value, props.currency, props.currencyRates, true);
                    return getTooltipText(CATEGORY_KEY, VALUE_KEY, currencyMoney, false);
                }
                return tooltipText;
            });

            pieSeries.data = state.chartData;
        };

        // return value: {asia_pacific: { aws: 3304.85581588513 }}
        const getCostByProviderData = (originData: OriginData[]): Record<string, Record<string, number>> => {
            const data = originData.map((d) => ({
                ...d,
                continent_code: state.regions[d.region_code]?.continent?.continent_code,
            }));
            const continentGroupBy = groupBy(data, 'continent_code');
            const result = {};
            Object.entries(continentGroupBy).forEach(([continent, cItem]) => {
                const providerGroupBy = groupBy(cItem, 'provider');
                Object.entries(providerGroupBy).forEach(([provider, pItem]) => {
                    const providerCost = sum(pItem.map((d) => d.usd_cost));
                    if (continent && continent !== 'undefined') {
                        if (result[continent]) result[continent][provider] = providerCost;
                        else result[continent] = { [provider]: providerCost };
                    }
                });
            });
            return result;
        };

        const setPieChartData = (originData: OriginData[]): ChartData[] => {
            const costByProviderData = getCostByProviderData(originData);
            return Object.keys(costByProviderData).map((continent) => ({
                continent_code: RegionMap[continent]?.continent_code,
                longitude: RegionMap[continent]?.longitude,
                latitude: RegionMap[continent]?.latitude,
                width: 48,
                height: 48,
                title: RegionMap[continent]?.continent_label,
                pieData: Object.entries(costByProviderData[continent]).map(([provider, cost]) => ({
                    category: state.providers[provider]?.label || provider,
                    provider,
                    value: cost as number,
                    color: state.providers[provider]?.color || '',
                })),
            }));
        };

        const costQueryHelper = new QueryHelper();
        const fetchData = async (): Promise<OriginData[]> => {
            costQueryHelper.setFilters(getConvertedFilter(props.filters));
            const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                include_usage_quantity: false,
                granularity: 'ACCUMULATED',
                group_by: ['provider', 'region_code'],
                start: dayjs.utc(props.period?.start).format('YYYY-MM'),
                end: dayjs.utc(props.period?.end).format('YYYY-MM'),
                page: {
                    limit: 15,
                },
                ...costQueryHelper.apiQuery,
            });
            return results;
        };
        const getChartData = async () => {
            try {
                state.loading = true;
                tableState.loading = true;
                const results: OriginData[] = await fetchData();
                state.chartData = setPieChartData(results); // pie chart data (continent, latitude, etc.)
                tableState.items = results.map((d) => ({ // table data (usd_cost, region, provider)
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
                requestIdleCallback(() => drawChart(chartContext));
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
        .label {
            @apply mr-4 text-gray-500;
            font-size: 0.75rem;
            line-height: 1.5;
            white-space: nowrap;
        }
    }

    @screen tablet {
        &.responsive {
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
}

</style>
