<template>
    <div class="cost-dashboard-stacked-column-widget"
         :class="{responsive: !printMode}"
    >
        <p-data-loader :loading="loading"
                       class="chart-wrapper"
                       :class="widgetType"
                       :disable-transition="printMode"
        >
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef"
                 class="chart"
            />
        </p-data-loader>
        <div class="table-wrapper"
             :class="widgetType"
        >
            <cost-dashboard-data-table :fields="fields"
                                       :items="items"
                                       :loading="loading"
                                       :this-page.sync="thisPage"
                                       :page-size="PAGE_SIZE"
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
import {
    computed, defineComponent, onUnmounted, reactive, toRefs, watch,
} from 'vue';

import type { PieChart, TreeMap, XYChart } from '@amcharts/amcharts4/charts';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import {
    PDataLoader, PSkeleton,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import dayjs from 'dayjs';

import { commaFormatter, numberFormatter } from '@cloudforet/core-lib';
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';

import { CURRENCY } from '@/store/modules/display/config';
import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import { toggleSeries } from '@/lib/amcharts/helper';
import config from '@/lib/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import { GRANULARITY, GROUP_BY_ITEM_MAP } from '@/services/cost-explorer/lib/config';
import { getConvertedFilter } from '@/services/cost-explorer/lib/helper';
import type { GroupBy, Period } from '@/services/cost-explorer/type';
import {
    getCurrencyAppliedChartData, getLegends, getTooltipText, getXYChartData,
} from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import CostDashboardDataTable
    from '@/services/cost-explorer/widgets/modules/CostDashboardDataTable.vue';
import type {
    ChartData, CostAnalyzeModel, Legend, WidgetProps,
} from '@/services/cost-explorer/widgets/type';

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
        PDataLoader,
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
            providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
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
                start: start.format('YYYY-MM-DD'),
                end: dayjs.utc(props.period.end).endOf('month').format('YYYY-MM-DD'),
            };
            state.chartData = getXYChartData(state.items, GRANULARITY.MONTHLY, _period, props.groupBy as GroupBy);
            state.legends = getLegends(state.items, GRANULARITY.MONTHLY, props.groupBy as GroupBy);
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

            if (legends.length) {
                legends.forEach((legend) => {
                    createSeries(legend);
                });
            } else {
                const dummyChartData = [...chartData];
                dummyChartData[0].dummy = 0;
                chart.data = dummyChartData;
                valueAxis.min = 0;
                valueAxis.extraMax = 100;
                valueAxis.renderer.minGridDistance = 40;
                createSeries({ name: 'dummy', label: 'dummy' });
            }

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
                    start: start.format('YYYY-MM'),
                    end: dayjs.utc(period.end).format('YYYY-MM'),
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

        // LOAD REFERENCE STORE
        (async () => {
            await store.dispatch('reference/provider/load');
        })();

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
