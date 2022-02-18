<template>
    <div class="cost-dashboard-stacked-column-widget" :class="{responsive: !printMode}">
        <p-chart-loader :loading="loading" class="chart-wrapper" :class="widgetType">
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef" class="chart" />
        </p-chart-loader>
        <div class="table-wrapper" :class="widgetType">
            <cost-dashboard-data-table :fields="fields"
                                       :items="items"
                                       :loading="loading"
                                       :this-page.sync="thisPage"
                                       :page-size="PAGE_SIZE"
                                       :chart="chart"
                                       :legends="legends"
                                       :currency-rates="currencyRates"
                                       :currency="currency"
                                       :pagination-visible="!printMode"
                                       :print-mode="printMode"
                                       show-legend
                                       @toggle-legend="handleToggleLegend"
            />
        </div>
    </div>
</template>

<script lang="ts">
import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { PieChart, TreeMap, XYChart } from '@amcharts/amcharts4/charts';

import {
    computed, defineComponent, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PChartLoader, PSkeleton,
} from '@spaceone/design-system';

import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';

import CostDashboardDataTable
    from '@/services/billing/cost-management/widgets/modules/CostDashboardDataTable.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { commaFormatter, numberFormatter } from '@spaceone/console-core-lib';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { gray } from '@/styles/colors';
import config from '@/lib/config';

import {
    getCurrencyAppliedChartData, getLegends, getTooltipText, getXYChartData,
} from '@/services/billing/cost-management/widgets/lib/widget-data-helper';
import { getConvertedFilter } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { GRANULARITY, GROUP_BY, GROUP_BY_ITEM_MAP } from '@/services/billing/cost-management/lib/config';
import { CURRENCY } from '@/store/modules/display/config';
import {
    ChartData, CostAnalyzeModel, Legend, WidgetProps,
} from '@/services/billing/cost-management/widgets/type';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { toggleSeries } from '@/lib/amcharts/helper';
import { store } from '@/store';
import { Period } from '@/services/billing/cost-management/type';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';


const widgetTypes = ['SHORT', 'LONG'] as const;
type WidgetType = typeof widgetTypes[number];

const PAGE_SIZE = 9;
const SHORT_TYPE_RANGE = 4;

const CATEGORY_KEY = 'date';

interface Props extends WidgetProps {
    widgetType?: WidgetType;
    groupBy: string;
}

export default defineComponent<Props>({
    name: 'CostDashboardStackedColumnWidget',
    components: {
        CostDashboardDataTable,
        PChartLoader,
        PSkeleton,
    },
    props: {
        widgetType: {
            type: String,
            default: 'SHORT',
            validator(value: WidgetType) {
                return widgetTypes.includes(value);
            },
        },
        groupBy: {
            type: String,
            default: undefined,
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
    setup(props: Props, { emit }) {
        const state = reactive({
            providers: computed(() => store.state.resource.provider.items),
            //
            chartRegistry: {},
            chart: null as XYChart | null,
            chartRef: null as HTMLElement | null,
            chartData: [] as ChartData[],
            legends: [] as Legend[],
            //
            loading: true,
            items: [] as CostAnalyzeModel[],
            fields: computed<DataTableField[]>(() => {
                const fields: DataTableField[] = [{ name: props.groupBy, label: GROUP_BY_ITEM_MAP[props.groupBy].label }];
                let start = props.widgetType === 'SHORT' ? dayjs.utc(props.period.end).subtract(SHORT_TYPE_RANGE - 1, 'month') : dayjs.utc(props.period.start);
                const end = dayjs.utc(props.period.end);
                const thisMonth = dayjs.utc();
                while (start.isSameOrBefore(end, 'month')) {
                    fields.push({
                        name: `usd_cost.${start.format('YYYY-MM')}`,
                        label: thisMonth.isSame(start, 'month') ? `${start.format('MMM')} (MTD)` : start.format('MMM'),
                        textAlign: 'right',
                    });
                    start = start.add(1, 'month');
                }
                return fields;
            }),
            totalCount: 15,
            thisPage: 1,
        });

        /* util */
        const setChartDataAndLegends = () => {
            const start = props.widgetType === 'SHORT' ? dayjs.utc(props.period.end).subtract(SHORT_TYPE_RANGE - 1, 'month') : dayjs.utc(props.period.start);
            const _period = {
                start: start.format('YYYY-MM-01'),
                end: dayjs.utc(props.period.end).endOf('month').format('YYYY-MM-DD'),
            };
            state.chartData = getXYChartData(state.items, GRANULARITY.MONTHLY, _period, props.groupBy as GROUP_BY);
            state.legends = getLegends(state.items, props.groupBy as GROUP_BY);
        };
        const disposeChart = (chartContext) => {
            if (state.chartRegistry[chartContext]) {
                state.chartRegistry[chartContext].dispose();
                delete state.chartRegistry[chartContext];
            }
        };
        const drawChart = (chartContext, chartData, legends) => {
            const createChart = () => {
                disposeChart(chartContext);
                state.chartRegistry[chartContext] = am4core.create(chartContext, am4charts.XYChart);
                return state.chartRegistry[chartContext];
            };
            const chart = createChart();
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;

            chart.events.on('ready', () => {
                emit('rendered');
            });

            chart.paddingLeft = -5;
            chart.paddingBottom = -10;
            chart.data = getCurrencyAppliedChartData(chartData, props.currency, props.currencyRates);

            chart.dateFormatter.inputDateFormat = 'yyyy-MM';
            const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.baseInterval = {
                timeUnit: 'month',
                count: 1,
            };
            dateAxis.dateFormats.setKey('month', 'MMM');
            dateAxis.dataFields.category = CATEGORY_KEY;
            dateAxis.renderer.minGridDistance = 30;
            dateAxis.fontSize = 12;
            dateAxis.tooltip.disabled = true;
            dateAxis.renderer.grid.template.strokeOpacity = 1;
            dateAxis.renderer.grid.template.location = 0;
            dateAxis.renderer.labels.template.fill = am4core.color(gray[600]);
            dateAxis.renderer.grid.template.strokeOpacity = 0;

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;
            valueAxis.renderer.minWidth = 20;
            valueAxis.fontSize = 12;
            valueAxis.extraMax = 0.01;
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.labels.template.fill = am4core.color(gray[600]);
            valueAxis.renderer.labels.template.adapter.add('text', (text, target) => {
                if (target.dataItem) {
                    if (target.dataItem.value) return commaFormatter(numberFormatter(target.dataItem.value));
                }
                return text;
            });

            const createSeries = (legend) => {
                const series = chart.series.push(new am4charts.ColumnSeries());
                series.showOnInit = false;
                series.name = legend.label;
                series.dataFields.dateX = CATEGORY_KEY;
                series.dataFields.valueY = legend.name;
                series.strokeWidth = 0;
                series.columns.template.width = am4core.percent(60);
                series.columns.template.tooltipText = '{name}: [bold]{valueY}[/]';
                series.columns.template.propertyFields.fill = legend.color;
                series.tooltip.label.fontSize = 14;
                series.stacked = true;
                if (legend.color) series.fill = am4core.color(legend.color);

                series.columns.template.adapter.add('tooltipText', (tooltipText, target) => {
                    if (target.tooltipDataItem && target.tooltipDataItem.dataContext) {
                        const currencyMoney = currencyMoneyFormatter(target.dataItem.valueY, props.currency, undefined, true);
                        return getTooltipText('name', undefined, currencyMoney);
                    }
                    return tooltipText;
                });

                return series;
            };

            legends.forEach((legend) => {
                createSeries(legend);
            });

            return chart;
        };

        /* api */
        const costQueryHelper = new QueryHelper();
        const listCostAnalysisData = async (period: Period, filters): Promise<CostAnalyzeModel[]> => {
            costQueryHelper.setFilters(getConvertedFilter(filters));
            try {
                const start = props.widgetType === 'SHORT' ? dayjs.utc(props.period.end).subtract(SHORT_TYPE_RANGE - 1, 'month') : dayjs.utc(props.period.start);
                const { results, total_count } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: GRANULARITY.MONTHLY,
                    group_by: [props.groupBy],
                    start: start.format('YYYY-MM-01'),
                    end: dayjs.utc(period.end).add(1, 'month').format('YYYY-MM-01'),
                    pivot_type: 'TABLE',
                    limit: 15,
                    ...costQueryHelper.apiQuery,
                });
                state.totalCount = total_count > 15 ? 15 : total_count;
                return results;
            } catch (e) {
                ErrorHandler.handleError(e);
                return [];
            }
        };

        /* event */
        const handleToggleLegend = (index) => {
            const convertedIndex = index + ((state.thisPage - 1) * PAGE_SIZE);
            toggleSeries(state.chart as XYChart | PieChart | TreeMap, convertedIndex);
            state.legends[convertedIndex].disabled = !state.legends[convertedIndex]?.disabled;
        };

        watch(() => props.currency, (currency) => {
            if (state.chart) {
                state.chart.data = getCurrencyAppliedChartData(state.chartData, currency, props.currencyRates);
            }
        });
        watch([() => props.period, () => props.filters], async ([period, filters]) => {
            state.loading = true;
            state.items = await listCostAnalysisData(period, filters);
            await setChartDataAndLegends();
            state.chart = drawChart(state.chartRef, state.chartData, state.legends);
            state.loading = false;
        }, { immediate: true });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            PAGE_SIZE,
            handleToggleLegend,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cost-dashboard-stacked-column-widget {
    @apply grid grid-cols-12 gap-4;
    min-height: 24rem;
    .chart-wrapper {
        &.SHORT {
            @apply col-span-5;
        }
        &.LONG {
            @apply col-span-12;
            height: 22.5rem;
        }
        .chart {
            height: 100%;
        }
    }
    .table-wrapper {
        @apply flex flex-col;
        &.SHORT {
            @apply col-span-7;
        }
        &.LONG {
            @apply col-span-12;
        }
        .cost-dashboard-data-table {
            @apply flex flex-col flex-grow;
            .p-data-table {
                margin: 0.5rem 0;
            }
        }
        .table-pagination-wrapper {
            margin-bottom: -1rem;
        }
    }

    &.responsive {
        @screen tablet {
            @apply grid-rows-2;
            .chart-wrapper,
            .table-wrapper {
                @apply col-span-12 row-span-1;
            }
        }
    }
}
</style>
