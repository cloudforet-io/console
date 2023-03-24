<template>
    <cost-dashboard-card-widget-layout :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.AWS_CLOUD_FRONT_COST')"
                                       class="aws-cloud-front-cost"
                                       :widget-link="widgetLink"
                                       :data-range="DATA_LIMIT"
                                       :print-mode="printMode"
    >
        <p-data-loader :loading="loading"
                       class="chart-wrapper"
        >
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef"
                 class="chart"
            />
        </p-data-loader>
        <div class="table-wrapper">
            <cost-dashboard-data-table :fields="tableState.fields"
                                       :items="items"
                                       :loading="loading"
                                       :this-page.sync="tableState.thisPage"
                                       :page-size="5"
                                       :currency-rates="currencyRates"
                                       :currency="currency"
                                       :show-index="false"
                                       :pagination-visible="!printMode"
                                       :print-mode="printMode"
            />
        </div>
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">

import {
    computed, onUnmounted, reactive, toRefs, watch,
} from 'vue';

import * as am4charts from '@amcharts/amcharts4/charts';
import type { XYChart } from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import { PDataLoader, PSkeleton } from '@spaceone/design-system';
import type { DataTableFieldType } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import bytes from 'bytes';
import dayjs from 'dayjs';
import { sortBy } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { i18n } from '@/translations';

import { CURRENCY } from '@/store/modules/display/config';

import config from '@/lib/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import type { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { GRANULARITY, GROUP_BY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { getConvertedFilter } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import {
    getCurrencyAppliedChartData,
    getReferenceLabel,
    getTooltipText,
} from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import CostDashboardCardWidgetLayout from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import CostDashboardDataTable from '@/services/cost-explorer/widgets/modules/CostDashboardDataTable.vue';
import type {
    CostAnalyzeModel, Legend, WidgetProps,
} from '@/services/cost-explorer/widgets/type';

interface TableData {
    trafficOut?: TableItem;
    httpRequest?: TableItem;
    httpsRequest?: TableItem;
}
interface ChartData {
    'data-transfer.out'?: number;
    'requests.http'?: number;
    'requests.https'?: number;
}
interface Item extends TableData, ChartData {
    resourceId: string;
    groupBy: string;
    totalCost: number;
}
interface TableItem {
    usd_cost: number;
    usage_quantity: number;
}

const CATEGORY_KEY = 'groupBy';
const DATA_LIMIT = 10;

export default {
    name: 'AWSCloudFrontCost',
    components: {
        CostDashboardCardWidgetLayout,
        CostDashboardDataTable,
        PDataLoader,
        PSkeleton,
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
        currency: {
            type: String,
            default: CURRENCY.USD,
        },
        currencyRates: {
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
        printMode: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: WidgetProps, { emit }) {
        const state = reactive({
            loading: false,
            groupBy: computed(() => props.options?.group_by ?? GROUP_BY.PROJECT), // todo: temporary
            widgetLink: computed(() => {
                if (props.printMode) return undefined;
                return {
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    params: {},
                    query: {
                        granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                        group_by: arrayToQueryString([state.groupBy]),
                        period: objectToQueryString(props.period),
                        filters: objectToQueryString({ ...props.filters, provider: ['aws'], product: ['AmazonCloudFront'] }),
                    },
                };
            }),
            //
            items: [] as Item[],
            chart: null as XYChart | null,
            chartRef: null as HTMLElement | null,
            chartData: [] as ChartData[],
            legends: [
                {
                    name: 'data-transfer.out',
                    label: 'Transfer-Out',
                },
                {
                    name: 'requests.http',
                    label: 'Requests (HTTP)',
                },
                {
                    name: 'requests.https',
                    label: 'Requests (HTTPS)',
                },
            ] as Legend[],
        });

        const usageType = {
            'data-transfer.out': 'trafficOut',
            'requests.http': 'httpRequest',
            'requests.https': 'httpsRequest',
        };

        const tableState = reactive({
            fields: computed<DataTableFieldType[]>(() => [
                { name: 'groupBy', label: GROUP_BY_ITEM_MAP[state.groupBy].label },
                {
                    name: 'trafficOut',
                    label: 'Transfer-Out',
                    tooltipText: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.TOOLTIP_AWS_DATA_COST_2'),
                    children: [
                        { name: 'trafficOut.usage_quantity', type: 'size', invisible: true },
                        { name: 'trafficOut.usd_cost', invisible: true },
                    ],
                },
                {
                    name: 'httpRequest',
                    label: 'Requests (HTTP)',
                    children: [
                        { name: 'httpRequest.usage_quantity', type: 'number', invisible: true },
                        { name: 'httpRequest.usd_cost', invisible: true },
                    ],
                },
                {
                    name: 'httpsRequest',
                    label: 'Requests (HTTPS)',
                    children: [
                        { name: 'httpsRequest.usage_quantity', type: 'number', invisible: true },
                        { name: 'httpsRequest.usd_cost', invisible: true },
                    ],
                },

            ]),
            thisPage: 1,
        });

        /* Util */
        const createChartSeries = (chart, legend) => {
            const series = chart.series.push(new am4charts.ColumnSeries());
            series.name = legend.label;
            series.dataFields.categoryY = CATEGORY_KEY;
            series.dataFields.valueX = legend.name;
            series.stacked = true;
            series.tooltip.label.fontSize = 14;
            series.adapter.add('tooltipText', (tooltipText, target) => {
                if (target.tooltipDataItem && target.tooltipDataItem.dataContext) {
                    const cost = Number(target.tooltipDataItem.dataContext[legend.name] ?? 0);
                    let currencyMoney: string | number = cost;
                    if (cost !== 0) {
                        currencyMoney = currencyMoneyFormatter(cost, props.currency, undefined, true);
                    }
                    return getTooltipText('name', undefined, currencyMoney);
                }
                return tooltipText;
            });
        };
        const createChartLegend = (chart) => {
            chart.legend = new am4charts.Legend();
            chart.legend.position = 'bottom';
            chart.legend.contentAlign = 'left';
            chart.legend.fontSize = 12;
            chart.legend.labels.template.fill = am4core.color(gray[600]);
            chart.legend.itemContainers.template.clickable = false;
            chart.legend.itemContainers.template.focusable = false;
            chart.legend.itemContainers.template.hoverable = false;
            chart.legend.markers.template.width = 8;
            chart.legend.markers.template.height = 8;
            chart.legend.markers.template.children.getIndex(0).cornerRadius(12, 12, 12, 12);
        };
        const drawChart = (chartContext, chartData, legends) => {
            const chart: any = am4core.create(chartContext, am4charts.XYChart);
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.events.on('ready', () => {
                emit('rendered');
            });
            const categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
            categoryAxis.tooltip.disabled = true;
            categoryAxis.dataFields.category = CATEGORY_KEY;
            categoryAxis.renderer.minGridDistance = 0;
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.grid.template.strokeOpacity = 0;
            categoryAxis.renderer.labels.template.fill = am4core.color(gray[600]);
            categoryAxis.renderer.cellStartLocation = 0.3;
            categoryAxis.renderer.cellEndLocation = 0.7;
            categoryAxis.fontSize = 12;

            categoryAxis.renderer.labels.template.adapter.add('text', (label, target) => {
                if (target.dataItem && (target.dataItem.category)) {
                    return getReferenceLabel(target.dataItem.category, state.groupBy);
                }
                return label;
            });

            const valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
            if (state.items.every((d) => d.totalCost === 0)) valueAxis.min = 0;
            valueAxis.tooltip.disabled = true;
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.adapter.add('stroke', (stroke, target) => {
                if (target.dataItem && (target.dataItem.value === 0)) return am4core.color(gray[300]);
                return am4core.color(gray[200]);
            });
            valueAxis.renderer.labels.template.disabled = true;
            valueAxis.renderer.baseGrid.disabled = true;
            valueAxis.fontSize = 11;

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.lineX.disabled = true;
            chart.cursor.lineY.disabled = true;
            chart.cursor.behavior = 'none';

            legends.forEach((legend) => {
                createChartSeries(chart, legend);
            });
            if (state.items.length) createChartLegend(chart);

            if (chartData.length) {
                chart.data = getCurrencyAppliedChartData(chartData, props.currency, props.currencyRates);
            } else {
                chart.data = [{ [CATEGORY_KEY]: '' }];
                valueAxis.min = 0;
            }

            return chart;
        };
        const getConvertedData = (rawData: CostAnalyzeModel[]): Item[] => {
            const results: Item[] = [];
            rawData.forEach((item) => {
                let usageQuantity = item.usage_quantity;
                if (item.usage_type === 'data-transfer.out') {
                    usageQuantity = bytes.parse(`${item.usage_quantity}GB`);
                }
                const resourceId = item[state.groupBy];
                const existData = results.find((d) => d.resourceId === resourceId);
                if (existData) {
                    existData[item.usage_type] = item.usd_cost;
                    existData[usageType[item.usage_type]] = {
                        usd_cost: item.usd_cost,
                        usage_quantity: usageQuantity,
                    };
                    existData.totalCost += Number(item.usd_cost);
                } else {
                    results.push({
                        resourceId,
                        groupBy: getReferenceLabel(resourceId, state.groupBy),
                        [item.usage_type]: item.usd_cost,
                        [usageType[item.usage_type]]: {
                            usd_cost: item.usd_cost,
                            usage_quantity: usageQuantity,
                        },
                        totalCost: Number(item.usd_cost),
                    });
                }
            });
            return sortBy(results, 'totalCost').reverse().slice(0, DATA_LIMIT);
        };

        /* Api */
        const queryHelper = new QueryHelper();
        const listData = async (period, filters): Promise<CostAnalyzeModel[]> => {
            state.loading = true;

            queryHelper.setFilters([
                ...getConvertedFilter(filters),
                { k: 'provider', v: 'aws', o: '=' },
                { k: 'product', v: 'AmazonCloudFront', o: '=' },
            ]);
            try {
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    include_usage_quantity: true,
                    include_others: false,
                    granularity: GRANULARITY.ACCUMULATED,
                    group_by: ['usage_type', state.groupBy],
                    start: dayjs.utc(period.start).format('YYYY-MM'),
                    end: dayjs.utc(period.end).format('YYYY-MM'),
                    ...queryHelper.apiQuery,
                });
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            } finally {
                state.loading = false;
            }
        };

        /* Watcher */
        watch(() => props.currency, (currency) => {
            if (state.chart) {
                state.chart.data = getCurrencyAppliedChartData(state.chartData, currency, props.currencyRates);
            }
        });
        watch([() => props.period, () => props.filters, () => state.chartRef], async ([period, filters, chartContext]) => {
            if (chartContext) {
                const rawData = await listData(period, filters);
                if (state.items.length === 0) emit('rendered');

                const convertedItems = getConvertedData(rawData);
                state.items = [...convertedItems];
                state.chartData = [...convertedItems].reverse();
                state.chart = drawChart(state.chartRef, state.chartData, state.legends);
            }
        }, { immediate: true });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            tableState,
            DATA_LIMIT,
        };
    },
};
</script>
<style lang="postcss" scoped>
.aws-cloud-front-cost {
    .chart-wrapper {
        height: 17rem;
        .chart {
            height: 100%;
        }
    }
}
</style>
