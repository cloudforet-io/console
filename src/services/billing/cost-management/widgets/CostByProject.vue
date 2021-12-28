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
import dayjs from 'dayjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { TreeMap } from '@amcharts/amcharts4/charts';

import {
    computed, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';

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
import { PChartLoader, PSkeleton } from '@spaceone/design-system';


const categoryKey = 'projectId';
const valueName = 'cost';

interface ChartData {
    projectId: string;
    projectName: string;
    cost: number;
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
            data: [] as ChartData[],
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
            chart.colors.step = 2;

            chart.data = state.data;
            chart.dataFields.value = valueName;
            chart.dataFields.name = categoryKey;

            const series = chart.seriesTemplates.create('0');
            const seriesBullet = series.bullets.push(new am4charts.LabelBullet());
            seriesBullet.locationY = 0.5;
            seriesBullet.locationX = 0.5;
            seriesBullet.label.text = `[font-size: 1rem; bold]{projectName}[/]
[font-size: 1.125rem; text-align: center]{cost}`;
            series.tooltip.disabled = true;
        };

        const costQueryHelper = new QueryHelper();
        const fetchData = async () => {
            costQueryHelper.setFilters(getConvertedFilter(props.filters));
            try {
                const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                    include_usage_quantity: false,
                    granularity: GRANULARITY.ACCUMULATED,
                    group_by: ['project_id'],
                    start: dayjs.utc(props.period?.start).format('YYYY-MM-DD'),
                    end: dayjs.utc(props.period?.end).endOf('month').format('YYYY-MM-DD'),
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
                state.data = rawData.map(d => ({
                    projectId: d.project_id,
                    cost: currencyMoneyFormatter(d.usd_cost, props.currency, props.currencyRates, false, 10000000),
                    projectName: d.project_id ? (state.projects[d.project_id]?.label || d.project_id) : 'No Project',
                }));
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
    height: 20rem;
}
</style>
