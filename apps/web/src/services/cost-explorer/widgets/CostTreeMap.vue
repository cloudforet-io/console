<template>
    <cost-dashboard-card-widget-layout
        :title="name ? name : $t('BILLING.COST_MANAGEMENT.DASHBOARD.COST_BY_PROJECT')"
        :data-range="DATA_LIMIT"
        :widget-link="widgetLink"
        :no-data="!loading && data.length === 0"
        :print-mode="printMode"
        class="cost-tree-map"
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
        <div v-if="printMode"
             class="table-wrapper"
        >
            <p-data-table v-for="(itemSet, itemSetIdx) in itemSetList"
                          :key="itemSetIdx"
                          class="table"
                          :fields="fields"
                          :items="itemSet"
                          :loading="loading"
                          :bordered="false"
                          :row-height-fixed="!printMode"
                          table-style-type="simple"
                          disable-hover
            >
                <template #col-format="{field, item, index}">
                    <div class="right">
                        <template v-if="field.name === groupBy">
                            <p-status class="group-by-index"
                                      :text="getConvertedIndex(index, itemSetIdx)?.toString()"
                                      :icon-color="item.backgroundColor"
                            />
                            <span>{{ item.category }}</span>
                        </template>
                        <template v-else>
                            {{ currencyMoneyFormatter(item.value, currency, currencyRates, true) }}
                        </template>
                    </div>
                </template>
            </p-data-table>
        </div>
    </cost-dashboard-card-widget-layout>
</template>

<script lang="ts">

import {
    computed, defineComponent, onUnmounted, reactive, toRefs, watch,
} from 'vue';

import type { TreeMap } from '@amcharts/amcharts4/charts';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as am4core from '@amcharts/amcharts4/core';
import {
    PDataLoader, PSkeleton, PDataTable, PStatus,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import dayjs from 'dayjs';
import { sum } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { Currency } from '@/store/modules/display/config';
import { CURRENCY } from '@/store/modules/display/config';

import config from '@/lib/config';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import ErrorHandler from '@/common/composables/error/errorHandler';

import {
    gray, violet, white,
} from '@/styles/colors';

import type { WidgetOptions } from '@/services/cost-explorer/cost-dashboard/type';
import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import { getConvertedFilter } from '@/services/cost-explorer/lib/helper';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { getPieChartData } from '@/services/cost-explorer/widgets/lib/widget-data-helper';
import CostDashboardCardWidgetLayout
    from '@/services/cost-explorer/widgets/modules/CostDashboardCardWidgetLayout.vue';
import type { CostAnalyzeModel, PieChartData, WidgetProps } from '@/services/cost-explorer/widgets/type';

const CATEGORY_KEY = 'category';
const VALUE_KEY = 'value';
const MAX_TABLE_COLUMN = 8;
const DATA_LIMIT = 10;

interface CostTreeMapData extends PieChartData {
    backgroundColor?: string;
    textColor?: string;
}

export default defineComponent<WidgetProps>({
    name: 'CostTreeMap',
    components: {
        CostDashboardCardWidgetLayout,
        PDataTable,
        PDataLoader,
        PSkeleton,
        PStatus,
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
            validator(value: Currency) {
                return Object.values(CURRENCY).includes(value);
            },
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
    setup(props: WidgetProps<WidgetOptions>, { emit }) {
        const state = reactive({
            chartRef: null as HTMLElement | null,
            chart: null as TreeMap | null,
            chartRegistry: {},
            loading: false,
            groupBy: computed(() => props.options?.group_by),
            data: [] as CostTreeMapData[],
            widgetLink: computed(() => {
                if (props.printMode) return undefined;
                return {
                    name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
                    params: {},
                    query: {
                        granularity: primitiveToQueryString(GRANULARITY.ACCUMULATED),
                        group_by: arrayToQueryString([state.groupBy]),
                        period: objectToQueryString(props.period),
                        filters: objectToQueryString(props.filters),
                    },
                };
            }),
            fields: computed<DataTableField[]>(() => ([
                { name: state.groupBy, label: 'name' },
                { name: 'value', label: 'Cost', textAlign: 'right' },
            ])),
            itemSetList: computed<CostTreeMapData[][]>(() => {
                if (state.data.length > MAX_TABLE_COLUMN) return [state.data.slice(0, MAX_TABLE_COLUMN), state.data.slice(MAX_TABLE_COLUMN)];
                return [state.data];
            }),
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
            chart.events.on('ready', () => {
                emit('rendered');
            });
            chart.colors.step = 1;

            chart.data = state.data;
            chart.dataFields.name = CATEGORY_KEY;
            chart.dataFields.value = VALUE_KEY;
            chart.zoomOutButton.disabled = true;
            chart.dataFields.color = 'backgroundColor';

            const totalCost = sum(state.data.map((d) => d.value));
            const series = chart.seriesTemplates.create('0');
            if (props.printMode) series.showOnInit = false;
            if (series.tooltip) series.tooltip.fontSize = 14;
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
                    if (percentage >= 2.5) {
                        return `[font-size: 14px; {textColor};]{${CATEGORY_KEY}}[/]`;
                    }
                }
                return '';
            });
        };
        const getConvertedChartData = (chartData: CostTreeMapData[]): CostTreeMapData[] => {
            const results: CostTreeMapData[] = [];
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
        const getConvertedIndex = (index, itemSetIdx) => index + 1 + ((itemSetIdx) * MAX_TABLE_COLUMN);
        /* Api */
        const costQueryHelper = new QueryHelper();
        const fetchData = async (): Promise<CostAnalyzeModel[]> => {
            costQueryHelper.setFilters(getConvertedFilter(props.filters));
            const { results } = await SpaceConnector.client.costAnalysis.cost.analyze({
                granularity: GRANULARITY.ACCUMULATED,
                group_by: [props.options.group_by],
                start: dayjs.utc(props.period?.start).format('YYYY-MM'),
                end: dayjs.utc(props.period?.end).format('YYYY-MM'),
                limit: DATA_LIMIT,
                ...costQueryHelper.apiQuery,
            });
            return results;
        };
        const getChartData = async () => {
            try {
                state.loading = true;
                const rawData = await fetchData();
                const chartData: CostTreeMapData[] = getPieChartData(rawData, state.groupBy);
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

        watch([() => props.period, () => props.filters, () => props.currency], async () => {
            await getChartData();
            if (state.data.length === 0) emit('rendered');
        }, { immediate: true });

        onUnmounted(() => {
            if (state.chart) state.chart.dispose();
        });

        return {
            ...toRefs(state),
            DATA_LIMIT,
            getConvertedIndex,
            currencyMoneyFormatter,
        };
    },
});
</script>

<style lang="postcss" scoped>
.cost-tree-map {
    .chart-wrapper {
        @apply h-full;
        height: 18.75rem;
    }
    .chart {
        @apply h-full w-full;
    }
    .table-wrapper {
        @apply flex flex-wrap items-start;
        .group-by-index {
            margin-right: 1rem;
        }
        .table {
            display: inline-block;
            width: 50%;
        }

        /* custom design-system component - p-data-table */
        :deep(.p-data-table) thead {
            display: none;
        }
    }

    /* custom cost-dashboard-card-widget-layout */

    /* custom design-system component - p-card */
    &.cost-dashboard-card-widget-layout.p-card:deep(.body) {
        .no-data {
            height: 18.75rem;
        }
    }
}
</style>
