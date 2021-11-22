<template>
    <div class="product-cost-trend">
        <p-chart-loader :loading="chartLoading" class="chart-wrapper">
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef" class="chart" />
        </p-chart-loader>
        <div class="table-wrapper">
            <div class="month-pagination-wrapper">
                <span>Month</span>
                <p-text-pagination :all-page="allMonthPage"
                                   :this-page.sync="thisMonthPage"
                                   :show-page-number="false"
                />
            </div>
            <p-data-table :fields="fields"
                          :items="items.slice(thisPage * pageSize - 8, thisPage * pageSize)"
                          :total-count="totalCount"
                          disable-hover
            >
                <template #col-product-format="{value, index}">
                    <span class="toggle-button" @click="handleClickLegend(index)">
                        <p-status :text="(index + ((thisPage - 1) * pageSize) + 1).toString()"
                                  :icon-color="getStatusIconColor(index)"
                                  :text-color="getStatusTextColor(index)"
                        />
                    </span>
                    {{ value ? value : '--' }}
                </template>
            </p-data-table>
            <div class="table-pagination-wrapper">
                <p-text-pagination :all-page="allPage"
                                   :this-page.sync="thisPage"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { range } from 'lodash';
import dayjs from 'dayjs';
import am4themesAnimated from '@amcharts/amcharts4/themes/animated';

import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PChartLoader, PDataTable, PSkeleton, PTextPagination, PStatus,
} from '@spaceone/design-system';

import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';
import { GRANULARITY, GROUP_BY_ITEM } from '@/services/billing/cost-management/cost-analysis/lib/config';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    getTableDataFromRawData, getXYChartDataAndLegends,
} from '@/services/billing/cost-management/cost-analysis/lib/converting-data-helper';
import ErrorHandler from '@/common/composables/error/errorHandler';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import config from '@/lib/config';
import { gray } from '@/styles/colors';
import { commaFormatter, numberFormatter } from '@spaceone/console-core-lib';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { getConvertedFilter } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import {
    customColorTheme, toggleSeries, CUSTOM_COLORS, DISABLED_COLOR,
} from '@/common/composables/dynamic-chart';
import { XYChart } from '@amcharts/amcharts4/charts';
import { Legend } from '@/common/composables/dynamic-chart/type';

am4core.useTheme(customColorTheme);
am4core.useTheme(am4themesAnimated);


interface TableItem {
    product: string;
    [key: string]: string | number;
}

export default {
    name: 'ProductCostTrend',
    components: {
        PChartLoader,
        PSkeleton,
        PDataTable,
        PTextPagination,
        PStatus,
    },
    props: {},
    setup() {
        const state = reactive({
            filters: [],
            top15ProductNames: [],
            //
            chartLoading: false,
            chartRegistry: {},
            chart: null as XYChart | null,
            chartRef: null as HTMLElement | null,
            chartData: [],
            legends: [] as Legend[],
            //
            items: [] as TableItem[],
            fields: computed<DataTableField[]>(() => {
                const fields = [{ name: GROUP_BY_ITEM.PRODUCT, label: 'Product' }];
                const fiveMonthsAgo = dayjs.utc().subtract(5, 'month');
                range(state.thisMonthPage * 3 - 3, state.thisMonthPage * 3).forEach((d) => {
                    const date = fiveMonthsAgo.add(d, 'month');
                    fields.push({ name: date.format('YYYY-MM'), label: date.format('MMM') });
                });
                return fields;
            }),
            totalCount: 15,
            allPage: computed(() => Math.ceil(state.totalCount / state.pageSize)),
            pageSize: 8,
            thisPage: 1,
            allMonthPage: 2,
            thisMonthPage: 2,
            // prevThreeMonths: computed(() => range(3, 6).map(d => dayjs.utc().subtract(d, 'month').format('YYYY-MM'))),
            // currThreeMonths: computed(() => range(0, 3).map(d => dayjs.utc().subtract(d, 'month').format('YYYY-MM'))),
        });

        /* util */
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
            chart.data = chartData;

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
            dateAxis.renderer.labels.template.fill = am4core.color(gray[400]);
            dateAxis.tooltip.label.fontSize = 12;
            dateAxis.renderer.grid.template.strokeOpacity = 0;
            // dateAxis.renderer.labels.template.adapter.add('fill', (text, target) => {
            //     if (state.currThreeMonths.includes(dayjs.utc(target.dataItem.date).format('YYYY-MM'))) {
            //         return am4core.color(gray[600]);
            //     }
            //     console.log(dayjs.utc(target.dataItem.date).format('YYYY-MM'));
            //     return am4core.color(gray[400]);
            // });

            const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = true;
            valueAxis.renderer.minWidth = 20;
            valueAxis.fontSize = 12;
            valueAxis.extraMax = 0.01;
            valueAxis.renderer.grid.template.strokeOpacity = 1;
            valueAxis.renderer.grid.template.stroke = am4core.color(gray[200]);
            valueAxis.renderer.labels.template.fill = am4core.color(gray[400]);
            valueAxis.tooltip.label.fontSize = 12;
            valueAxis.renderer.labels.template.adapter.add('text', (text, target) => {
                if (target.dataItem) {
                    if (target.dataItem.value === 0) return '($USD) 0'; // todo: have to be changed
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
                series.tooltip.label.fontSize = 10;
                series.stacked = true;
                series.columns.template.propertyFields.fillOpacity = 'fillOpacity';
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
        const getStatusIconColor = (index) => {
            const convertedIndex = index + ((state.thisPage - 1) * state.pageSize);
            const legend = state.legends[convertedIndex];
            if (legend?.disabled) return DISABLED_COLOR;
            return CUSTOM_COLORS[convertedIndex];
        };
        const getStatusTextColor = (index) => {
            const convertedIndex = index + ((state.thisPage - 1) * state.pageSize);
            const legend = state.legends[convertedIndex];
            if (legend?.disabled) return DISABLED_COLOR;
            return null;
        };

        /* api */
        const costApiQueryHelper = new ApiQueryHelper();
        const getCostTableData = async () => {
            costApiQueryHelper.setFilters(getConvertedFilter(state.filters));
            try {
                const thisMonth = dayjs.utc();
                const { results, total_count } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: GRANULARITY.MONTHLY,
                    group_by: [GROUP_BY_ITEM.PRODUCT],
                    start: thisMonth.subtract(5, 'month'),
                    end: thisMonth.format('YYYY-MM'),
                    pivot_type: 'TABLE',
                    page: {
                        limit: 15,
                    },
                    ...costApiQueryHelper.data,
                });
                state.totalCount = total_count > 15 ? 15 : total_count;
                state.items = getTableDataFromRawData(results, [{ name: GROUP_BY_ITEM.PRODUCT, label: 'Product' }]) as TableItem[];
                state.top15ProductNames = results.map(d => d.product);
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        const getCostChartData = async (top15ProductNames) => {
            costApiQueryHelper.setFilters([
                ...getConvertedFilter(state.filters),
                {
                    k: GROUP_BY_ITEM.PRODUCT,
                    v: top15ProductNames,
                    o: '',
                },
            ]);
            try {
                const thisMonth = dayjs.utc();
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: GRANULARITY.MONTHLY,
                    group_by: [GROUP_BY_ITEM.PRODUCT],
                    start: thisMonth.subtract(5, 'month'),
                    end: thisMonth.format('YYYY-MM'),
                    pivot_type: 'CHART',
                    ...costApiQueryHelper.data,
                });
                const { chartData, legends } = getXYChartDataAndLegends(results, GROUP_BY_ITEM.PRODUCT);
                state.chartData = chartData;
                state.legends = legends;
            } catch (e) {

            }
        };

        /* event */
        const handleClickLegend = (index) => {
            const convertedIndex = index + ((state.thisPage - 1) * state.pageSize);
            toggleSeries(state.chart as XYChart, convertedIndex);
            state.legends[convertedIndex].disabled = !state.legends[convertedIndex]?.disabled;
        };

        (() => {
            getCostTableData();
        })();

        watch(() => state.top15ProductNames, (top15ProductNames) => {
            if (top15ProductNames.length > 0) {
                getCostChartData(top15ProductNames);
            }
        });
        watch([() => state.chartRef, () => state.chartData], ([chartContext, chartData]) => {
            if (chartContext && chartData.length) {
                state.chart = drawChart(chartContext, chartData, state.legends);
            }
        }, { immediate: false });

        return {
            ...toRefs(state),
            CUSTOM_COLORS,
            DISABLED_COLOR,
            handleClickLegend,
            getStatusIconColor,
            getStatusTextColor,
        };
    },
};
</script>

<style lang="postcss" scoped>
.product-cost-trend {
    @apply grid grid-cols-12;
    .chart-wrapper {
        @apply col-span-6;
        .chart {
            height: 100%;
        }
    }
    .table-wrapper {
        @apply col-span-6;
        display: grid;
        .month-pagination-wrapper {
            display: flex;
            align-items: center;
        }
        .table-pagination-wrapper {
            text-align: center;
            font-size: 0.875rem;
        }
        .p-data-table {
            .toggle-button {
                cursor: pointer;
            }
        }
    }
}
</style>
