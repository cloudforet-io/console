<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="trend-of-pass-and-fail-findings"
                  @refresh="refreshWidget"
    >
        <div class="data-container">
            <div class="chart-wrapper">
                <p-data-loader class="chart-loader"
                               :loading="state.loading"
                               :data="state.chartData"
                               loader-type="skeleton"
                               disable-empty-case
                               :loader-backdrop-opacity="1"
                               show-data-from-scratch
                >
                    <div ref="chartContext"
                         class="chart"
                    />
                </p-data-loader>
            </div>
            <widget-data-table :loading="state.loading"
                               :fields="state.tableFields"
                               :items="state.data?.results"
                               :all-reference-type-info="props.allReferenceTypeInfo"
                               :legends.sync="state.legends"
                               :color-set="colorSet"
                               :this-page="state.thisPage"
                               :show-next-page="state.data?.more"
                               @update:thisPage="handleUpdateThisPage"
            />
        </div>
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef, toRefs,
} from 'vue';

import { PDataLoader } from '@spaceone/design-system';
import dayjs from 'dayjs';
import { cloneDeep, random } from 'lodash';

import type { ReferenceType } from '@/store/modules/reference/type';

import { useAmcharts5 } from '@/common/composables/amcharts5';

import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import { COMPLIANCE_STATUS_MAP } from '@/services/dashboards/widgets/_configs/asset-config';
import { CHART_TYPE, WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';
import type {
    WidgetExpose, WidgetProps,
} from '@/services/dashboards/widgets/_configs/config';
import { ASSET_GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';
import {
    getDateAxisSettings,
} from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import {
    getReferenceTypeOfGroupBy, getWidgetTableDateFields,
} from '@/services/dashboards/widgets/_helpers/widget-table-helper';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
// eslint-disable-next-line import/no-cycle
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { CostAnalyzeDataModel, Legend, XYChartData } from '@/services/dashboards/widgets/type';


type Data = CostAnalyzeDataModel['results'];
interface FullData {
    results: Data;
    more: boolean;
}
const DATE_FORMAT = 'YYYY-MM';
const DATE_FIELD_NAME = 'date';

const props = defineProps<WidgetProps>();

const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.legends?.length ?? 0),
});
const state = reactive({
    ...toRefs(useWidgetState<FullData>(props)),
    // chartData: computed<XYChartData[]>(() => getRefinedXYChartData(state.data?.results, state.groupBy)),
    chartData: computed(() => ([
        { date: '2023-02', PASS: random(300, 500), FAIL: random(0, 100) },
        { date: '2023-03', PASS: random(300, 500), FAIL: random(0, 100) },
        { date: '2023-04', PASS: random(300, 500), FAIL: random(0, 100) },
        { date: '2023-05', PASS: random(300, 500), FAIL: random(0, 100) },
    ])),
    tableFields: computed<Field[]>(() => {
        if (!state.groupBy) return [];
        const refinedFields = getWidgetTableDateFields(state.granularity, state.dateRange, { type: 'cost' });
        const groupByLabel = ASSET_GROUP_BY_ITEM_MAP[state.groupBy]?.label ?? state.groupBy;
        const referenceType = getReferenceTypeOfGroupBy(props.allReferenceTypeInfo, state.groupBy) as ReferenceType;
        return [
            {
                label: groupByLabel,
                name: state.groupBy,
                textOptions: { type: 'reference', referenceType },
            },
            ...refinedFields,
        ];
    }),
    dateRange: computed<DateRange>(() => {
        const end = dayjs.utc(state.settings?.date_range?.end).format(DATE_FORMAT);
        const range = props.size === WIDGET_SIZE.full ? 11 : 3;
        const start = dayjs.utc(end).subtract(range, 'month').format(DATE_FORMAT);
        return { start, end };
    }),
    legends: [] as Legend[],
    thisPage: 1,
    disableReferenceColor: computed<boolean>(() => !!props.theme),
});
const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Api */
const fetchData = async () => {
    // TODO: fetch data
};

/* Util */
const drawChart = (chartData: XYChartData[]) => {
    const { chart, xAxis, yAxis } = chartHelper.createXYDateChart({}, getDateAxisSettings(state.dateRange));
    xAxis.get('baseInterval').timeUnit = 'month';
    yAxis.get('renderer').setAll({
        minGridDistance: 18,
    });

    if (state.chartType === CHART_TYPE.LINE) {
        chart.get('cursor')?.lineX.setAll({
            visible: true,
        });
    }

    Object.entries(COMPLIANCE_STATUS_MAP).forEach(([k, v]) => {
        const seriesSettings = {
            name: v.label,
            valueYField: k,
            stroke: v.color,
            fill: v.color,
            stacked: true,
        };
        const series = chartHelper.createXYLineSeries(chart, seriesSettings);
        chart.series.push(series);
        series.bullets.clear();
        series.fills.template.setAll({
            opacity: 0.2,
            visible: true,
        });
        // set data processor
        series.data.processor = chartHelper.createDataProcessor({
            dateFormat: DATE_FORMAT,
            dateFields: [DATE_FIELD_NAME],
        });
        // const tooltip = chartHelper.createTooltip();
        // chartHelper.setXYSharedTooltipText(chart, tooltip, state.currency, props.currencyRates);
        // series.set('tooltip', tooltip);
        series.data.setAll(cloneDeep(chartData));
    });
};

const initWidget = async (data?: FullData): Promise<FullData> => {
    state.loading = true;
    state.data = data ?? await fetchData();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (thisPage = 1): Promise<FullData> => {
    await nextTick();
    state.loading = true;
    state.thisPage = thisPage;
    state.data = await fetchData();
    chartHelper.refreshRoot();
    await nextTick();
    if (chartHelper.root.value) drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

/* Event */
const handleUpdateThisPage = (thisPage: number) => {
    state.thisPage = thisPage;
    refreshWidget(thisPage);
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
    refreshWidget,
    props,
    state,
});

defineExpose<WidgetExpose<FullData>>({
    initWidget,
    refreshWidget,
});
</script>

<style lang="postcss" scoped>
.trend-of-pass-and-fail-findings {
    .data-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        .chart-wrapper {
            height: 185px;
            margin-bottom: 1rem;
            .chart-loader {
                height: 100%;
                .chart {
                    height: 100%;
                }
            }
        }
        .widget-data-table {
            flex-grow: 1;
        }
    }
    &.full {
        .widget-data-table {
            height: auto;
        }
    }
}
</style>
