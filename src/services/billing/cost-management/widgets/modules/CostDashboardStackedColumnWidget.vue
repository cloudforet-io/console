<template>
    <div class="cost-dashboard-stacked-column-widget">
        <p-chart-loader :loading="loading" class="chart-wrapper">
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef" class="chart" />
        </p-chart-loader>
        <div class="table-wrapper">
            <cost-dashboard-data-table :fields="fields"
                                       :items="items"
                                       :loading="loading"
                                       :this-page.sync="thisPage"
                                       :page-size="9"
                                       :chart="chart"
                                       :legends="legends"
                                       :currency-rates="currencyRates"
                                       :currency="currency"
                                       show-legend
                                       @toggle-legend="handleToggleLegend"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { range } from 'lodash';
import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { XYChart } from '@amcharts/amcharts4/charts';

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
import { DEFAULT_CHART_COLORS, DISABLED_LEGEND_COLOR } from '@/styles/colorsets';

import {
    getCurrencyAppliedChartData, getLegends, getXYChartData,
} from '@/services/billing/cost-management/widgets/lib/widget-data-helper';
import { getConvertedFilter } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { GRANULARITY, GROUP_BY, GROUP_BY_ITEM_MAP } from '@/services/billing/cost-management/lib/config';
import { CURRENCY } from '@/store/modules/display/config';
import {
    ChartData, CostAnalyzeModel, Legend, WidgetProps,
} from '@/services/billing/cost-management/widgets/type';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { store } from '@/store';


interface Props extends WidgetProps {
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
    },
    setup(props: Props) {
        const state = reactive({
            providers: computed(() => store.state.resource.provider.items),
            _period: computed(() => ({
                start: dayjs(props.period.end).subtract(3, 'month').format('YYYY-MM'),
                end: dayjs.utc(props.period.end).endOf('month').format('YYYY-MM-DD'),
            })),
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
                const startMonth = dayjs.utc(props.period.end).subtract(3, 'month');
                const thisMonth = dayjs.utc();
                range(4).forEach((d) => {
                    const date = startMonth.add(d, 'month');
                    fields.push({
                        name: `usd_cost.${date.format('YYYY-MM')}`,
                        label: thisMonth.isSame(date, 'month') ? `${date.format('MMM')} (MTD)` : date.format('MMM'),
                    });
                });
                return fields;
            }),
            totalCount: 15,
            thisPage: 1,
        });

        /* util */
        const setChartDataAndLegends = () => {
            state.chartData = getXYChartData(state.items, GRANULARITY.MONTHLY, state._period, props.groupBy as GROUP_BY);
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
            dateAxis.dataFields.category = 'date';
            dateAxis.renderer.minGridDistance = 30;
            dateAxis.fontSize = 12;
            dateAxis.tooltip.disabled = true;
            dateAxis.renderer.grid.template.strokeOpacity = 1;
            dateAxis.renderer.grid.template.location = 0;
            dateAxis.renderer.labels.template.fill = am4core.color(gray[600]);
            dateAxis.tooltip.label.fontSize = 12;
            dateAxis.renderer.grid.template.strokeOpacity = 0;

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;
            valueAxis.renderer.minWidth = 20;
            valueAxis.fontSize = 12;
            valueAxis.extraMax = 0.01;
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.labels.template.fill = am4core.color(gray[600]);
            valueAxis.tooltip.label.fontSize = 12;
            valueAxis.renderer.labels.template.adapter.add('text', (text, target) => {
                if (target.dataItem) {
                    if (target.dataItem.value) return commaFormatter(numberFormatter(target.dataItem.value));
                }
                return text;
            });

            const createSeries = (legend) => {
                const series = chart.series.push(new am4charts.ColumnSeries());
                series.name = legend.label;
                series.dataFields.dateX = 'date';
                series.dataFields.valueY = legend.name;
                series.strokeWidth = 0;
                series.columns.template.width = am4core.percent(60);
                series.tooltipText = '{name}: [bold]{valueY}[/]';
                series.columns.template.propertyFields.fill = legend.color;
                series.tooltip.label.fontSize = 10;
                series.stacked = true;
                if (legend.color) series.fill = am4core.color(legend.color);
                return series;
            };

            legends.forEach((legend) => {
                createSeries(legend);
            });

            chart.cursor = new am4charts.XYCursor();
            chart.cursor.maxTooltipDistance = 20;
            chart.cursor.lineX.disabled = true;
            chart.cursor.lineY.disabled = true;

            return chart;
        };

        /* api */
        const costQueryHelper = new QueryHelper();
        const listCostAnalysisData = async (period, filters): Promise<CostAnalyzeModel[]> => {
            costQueryHelper.setFilters(getConvertedFilter(filters));
            try {
                const { results, total_count } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: GRANULARITY.MONTHLY,
                    group_by: [props.groupBy],
                    start: period.start,
                    end: period.end,
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
            state.legends[index].disabled = !state.legends[index]?.disabled;
        };

        watch(() => props.currency, (currency) => {
            if (state.chart) {
                state.chart.data = getCurrencyAppliedChartData(state.chartData, currency, props.currencyRates);
            }
        });
        watch([() => state._period, () => props.filters], async ([_period, filters]) => {
            state.loading = true;
            state.items = await listCostAnalysisData(_period, filters);
            await setChartDataAndLegends();
            state.chart = drawChart(state.chartRef, state.chartData, state.legends);
            state.loading = false;
        }, { immediate: true });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            DEFAULT_CHART_COLORS,
            DISABLED_LEGEND_COLOR,
            handleToggleLegend,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cost-dashboard-stacked-column-widget {
    @apply grid grid-cols-12;
    min-height: 24rem;
    .chart-wrapper {
        @apply col-span-5;
        .chart {
            height: 100%;
        }
    }
    .table-wrapper {
        @apply flex flex-col col-span-7;
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

    @screen tablet {
        @apply grid-rows-2;
        .chart-wrapper,
        .table-wrapper {
            @apply col-span-12 row-span-1;
        }
    }
}
</style>
