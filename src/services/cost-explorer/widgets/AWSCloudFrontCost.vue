<template>
    <cost-dashboard-card-widget-layout :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.AWS_CLOUD_FRONT_COST')"
                                       class="aws-cloud-front-cost"
                                       :widget-link="widgetLink"
                                       :data-range="15"
                                       :print-mode="printMode"
    >
        <p-data-loader :loading="loading" class="chart-wrapper">
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef" class="chart" />
        </p-data-loader>
        <div class="table-wrapper">
            <cost-dashboard-data-table :fields="tableState.fields"
                                       :items="tableState.items"
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
import bytes from 'bytes';
import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { XYChart } from '@amcharts/amcharts4/charts';

import {
    computed, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PDataLoader, PSkeleton } from '@spaceone/design-system';
import CostDashboardCardWidgetLayout from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { CURRENCY } from '@/store/modules/display/config';

import {
    ChartData, CostAnalyzeModel, Legend, WidgetProps,
} from '@/services/cost-explorer/widgets/type';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { getConvertedFilter } from '@/services/cost-explorer/cost-analysis/lib/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { GRANULARITY, GROUP_BY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import ErrorHandler from '@/common/composables/error/errorHandler';
import config from '@/lib/config';
import { gray } from '@/styles/colors';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import {
    getCurrencyAppliedChartData,
    getReferenceLabel, getTooltipText,
} from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import CostDashboardDataTable from '@/services/cost-explorer/widgets/modules/CostDashboardDataTable.vue';
import { DataTableFieldType } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';
import { i18n } from '@/translations';

interface Data {
    project_id: string;
    usage_quantity: number;
    usage_type: 'data-transfer.out'|'requests.http'|'requests.https';
    usd_cost: number;
}

interface TableItem {
    usd_cost: number;
    usage_quantity: number;
}

interface ConvertedTableData {
    [key: string]: {
        trafficOut: TableItem;
        httpRequest: TableItem;
        httpsRequest: TableItem;
    };
}

interface TableData {
    groupBy: string;
    trafficOutCost?: number;
    trafficOutSize?: number;
    httpReqCost?: number;
    httpReq?: number;
    httpsReqCost?: number;
    httpsReq?: number;
}
interface CloudFrontChartData {
    category: string;
    'data-transfer.out'?: number;
    'requests.http'?: number;
    'requests.https'?: number;
}

const CATEGORY_KEY = 'category';

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
                        groupBy: arrayToQueryString([state.groupBy]),
                        period: objectToQueryString(props.period),
                        filters: objectToQueryString(props.filters),
                    },
                };
            }),
            //
            items: [] as CostAnalyzeModel[],
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
        const getConvertedTableData = (): ConvertedTableData => {
            const temp = {};
            state.items.forEach((item: CostAnalyzeModel) => {
                if (temp[item[state.groupBy]]) {
                    temp[item[state.groupBy]][usageType[item.usage_type]] = {
                        usd_cost: item.usd_cost,
                        usage_quantity: item.usage_quantity,
                    };
                } else {
                    temp[item[state.groupBy]] = {
                        [usageType[item.usage_type]]: {
                            usd_cost: item.usd_cost,
                            usage_quantity: item.usage_quantity,
                        },
                    };
                }
            });
            return temp;
        };

        const tableState = reactive({
            fields: computed<DataTableFieldType[]>(() => [
                { name: 'groupBy', label: GROUP_BY_ITEM_MAP[state.groupBy].label },
                {
                    name: 'trafficOutSize', label: 'Transfer-Out', type: 'size', textAlign: 'right', tooltipText: i18n.t('BILLING.COST_MANAGEMENT.DASHBOARD.TOOLTIP_AWS_DATA_COST_2'),
                },
                { name: 'trafficOutCost', label: ' ' },
                {
                    name: 'httpReq', label: 'Requests (HTTP)', type: 'number', textAlign: 'right',
                },
                { name: 'httpReqCost', label: ' ' },
                {
                    name: 'httpsReq', label: 'Requests (HTTPS)', type: 'number', textAlign: 'right',
                },
                { name: 'httpsReqCost', label: ' ' },
            ]),
            items: computed<TableData[]>(() => {
                const convertedTableData = getConvertedTableData();
                const tableItems = Object.keys(convertedTableData).map((item) => {
                    const groupLabel = getReferenceLabel(item, state.groupBy);
                    return ({
                        groupBy: groupLabel,
                        trafficOutCost: convertedTableData[item]?.trafficOut?.usd_cost,
                        trafficOutSize: convertedTableData[item]?.trafficOut?.usage_quantity,
                        httpReqCost: convertedTableData[item]?.httpRequest?.usd_cost,
                        httpReq: convertedTableData[item]?.httpRequest?.usage_quantity,
                        httpsReqCost: convertedTableData[item]?.httpsRequest?.usd_cost,
                        httpsReq: convertedTableData[item]?.httpsRequest?.usage_quantity,
                    });
                });
                return tableItems;
            }),
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
                    let currencyMoney: string|number = cost;
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
            if (state.items.every(d => d.usd_cost === 0)) valueAxis.min = 0;
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
                chart.data = [{ category: '' }];
                valueAxis.min = 0;
            }

            return chart;
        };
        const getConvertedChartData = (rawData: CostAnalyzeModel[]): CloudFrontChartData[] => {
            const results: CloudFrontChartData[] = [];
            rawData.forEach((data) => {
                const existData = results.find(d => d.category === data[state.groupBy]);
                if (existData) {
                    existData[data.usage_type] = data.usd_cost;
                } else {
                    results.push({
                        category: data[state.groupBy],
                        [data.usage_type]: data.usd_cost,
                    });
                }
            });
            return results;
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
                const convertedResults = results.map((d) => {
                    let usageQuantity = d.usage_quantity;
                    if (d.usage_type === 'data-transfer.out') {
                        usageQuantity = bytes.parse(`${d.usage_quantity}GB`);
                    }
                    return {
                        ...d,
                        usage_quantity: usageQuantity,
                    };
                });
                return convertedResults;
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
                state.items = await listData(period, filters);
                if (state.items.length === 0) emit('rendered');

                state.chartData = getConvertedChartData(state.items);
                state.chart = drawChart(state.chartRef, state.chartData, state.legends);
            }
        }, { immediate: true });

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
.aws-cloud-front-cost {
    .chart-wrapper {
        height: 17rem;
        .chart {
            height: 100%;
        }
    }
}
</style>
