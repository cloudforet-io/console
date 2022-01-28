<template>
    <cost-dashboard-card-widget-layout
        :title="$t('BILLING.COST_MANAGEMENT.DASHBOARD.COST_BY_PROJECT')"
        :data-range="15"
        :widget-link="widgetLink"
        :no-data="!loading && data.length === 0"
        class="cost-by-project"
    >
        <p-chart-loader :loading="loading" class="chart-wrapper">
            <template #loader>
                <p-skeleton height="100%" />
            </template>
            <div ref="chartRef" class="chart" />
        </p-chart-loader>
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">
import { sum } from 'lodash';
import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { TreeMap } from '@amcharts/amcharts4/charts';

import {
    computed, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import { PChartLoader, PSkeleton } from '@spaceone/design-system';

import CostDashboardCardWidgetLayout
    from '@/services/billing/cost-management/widgets/modules/CostDashboardCardWidgetLayout.vue';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { getConvertedFilter } from '@/services/billing/cost-management/cost-analysis/lib/helper';
import { GRANULARITY, GROUP_BY } from '@/services/billing/cost-management/lib/config';
import { WidgetProps } from '@/services/billing/cost-management/widgets/type';
import { CURRENCY } from '@/store/modules/display/config';
import { BILLING_ROUTE } from '@/services/billing/routes';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import config from '@/lib/config';
import { store } from '@/store';
import {
    gray, violet, white,
} from '@/styles/colors';


const CATEGORY_KEY = 'category';
const VALUE_KEY = 'value';

interface CostByProjectChartData {
    category: string;
    value: number;
    backgroundColor?: string;
    textColor?: string;
}

export default {
    name: 'CostByProject',
    components: {
        CostDashboardCardWidgetLayout,
        PChartLoader,
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
            validator(value: CURRENCY) {
                return Object.values(CURRENCY).includes(value);
            },
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props: WidgetProps) {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as TreeMap | null,
            chartRegistry: {},
            loading: false,
            data: [] as CostByProjectChartData[],
            widgetLink: computed(() => ({
                name: BILLING_ROUTE.COST_MANAGEMENT.COST_ANALYSIS._NAME,
                params: {},
                query: {
                    granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                    groupBy: arrayToQueryString([GROUP_BY.PROJECT]),
                    period: objectToQueryString(props.period),
                    filters: objectToQueryString(props.filters),
                },
            })),
            projects: computed(() => store.state.resource.project.items),
        });

        /* Util */
        const disposeChart = (chartContext) => {
            if (state.chartRegistry[chartContext]) {
                state.chartRegistry[chartContext].dispose();
                delete state.chartRegistry[chartContext];
            }
        };
        const drawChart = (chartContext) => {
            const createChart = () => {
                disposeChart(chartContext);
                state.chartRegistry[chartContext] = am4core.create(chartContext, am4charts.TreeMap);
                return state.chartRegistry[chartContext];
            };
            const chart = createChart();
            if (!config.get('AMCHARTS_LICENSE.ENABLED')) chart.logo.disabled = true;
            chart.colors.step = 1;

            chart.data = state.data;
            chart.dataFields.name = CATEGORY_KEY;
            chart.dataFields.value = VALUE_KEY;
            chart.zoomOutButton.disabled = true;
            chart.dataFields.color = 'backgroundColor';

            const totalCost = sum(state.data.map(d => d.value));
            const series = chart.seriesTemplates.create('0');
            series.tooltip.fontSize = 14;
            series.columns.template.stroke = am4core.color('white');
            series.columns.template.strokeWidth = 3;
            series.columns.template.strokeOpacity = 1;
            series.columns.template.adapter.add('tooltipText', (tooltipText, target) => {
                if (target.tooltipDataItem && target.tooltipDataItem.dataContext) {
                    const percentage = (100 * target.dataItem.value) / totalCost;
                    const currencyMoney = currencyMoneyFormatter(target.dataItem.value, props.currency, props.currencyRates, true);
                    return `{${CATEGORY_KEY}}: [bold]${currencyMoney}[/] (${percentage.toFixed(2)}%)`;
                }
                return tooltipText;
            });
            const seriesBullet = series.bullets.push(new am4charts.LabelBullet());
            seriesBullet.locationY = 0.5;
            seriesBullet.locationX = 0.5;
            seriesBullet.label.adapter.add('text', (text, target) => {
                if (target.dataItem?.value) {
                    const percentage = (100 * target.dataItem.value) / totalCost;
                    if (percentage >= 5) {
                        return `[font-size: 14px; {textColor};]{${CATEGORY_KEY}}[/]`;
                    }
                }
                return '';
            });
        };
        const getConvertedChartData = (chartData: CostByProjectChartData[]): CostByProjectChartData[] => {
            const results: CostByProjectChartData[] = [];
            chartData.forEach((d, idx) => {
                let backgroundColor = violet[200];
                let textColor = gray[900];
                if (idx < 3) {
                    textColor = white;
                    if (idx === 0) {
                        backgroundColor = violet[700];
                    } else if (idx === 1) {
                        backgroundColor = violet[500];
                    } else {
                        backgroundColor = violet[400];
                    }
                } else if (idx < 8) {
                    backgroundColor = violet[300];
                }

                results.push({
                    ...d,
                    backgroundColor,
                    textColor,
                });
            });
            return results;
        };

        /* Api */
        const costQueryHelper = new QueryHelper();
        const fetchData = async () => {
            costQueryHelper.setFilters(getConvertedFilter(props.filters));
            try {
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    granularity: GRANULARITY.ACCUMULATED,
                    group_by: ['project_id'],
                    start: dayjs.utc(props.period?.start).format('YYYY-MM-01'),
                    end: dayjs.utc(props.period?.end).add(1, 'month').format('YYYY-MM-01'),
                    limit: 15,
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
                const rawData = await fetchData();
                const chartData: CostByProjectChartData[] = [];
                rawData.forEach((d) => {
                    if (d.usd_cost > 0) {
                        chartData.push({
                            category: d.project_id ? (state.projects[d.project_id]?.label || d.project_id) : 'Unknown',
                            value: d.usd_cost,
                        });
                    }
                });
                state.data = getConvertedChartData(chartData);
            } catch (e) {
                ErrorHandler.handleError(e);
                state.data = [];
            } finally {
                state.loading = false;
            }
        };

        /* Watcher */
        watch([() => state.loading, () => state.chartRef], ([loading, chartContext]) => {
            if (!loading && chartContext) {
                drawChart(chartContext);
            }
        }, { immediate: false });

        watch([() => props.period, () => props.filters, () => props.currency], () => {
            getChartData();
        }, { immediate: true });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.cost-by-project {
    height: 25rem;

    .chart-wrapper {
        @apply h-full;
    }
    .chart {
        @apply h-full w-full;
    }
}
</style>
