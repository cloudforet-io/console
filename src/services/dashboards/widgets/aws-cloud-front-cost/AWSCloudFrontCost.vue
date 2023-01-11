<template>
    <widget-frame v-bind="widgetFrameProps"
                  class="aws-cloud-front-cost"
                  @refresh="handleRefresh"
    >
        <template v-if="state.selectorItems.length"
                  #header-right
        >
            <widget-frame-header-dropdown :items="state.selectorItems"
                                          :selected="state.selectedSelectorType"
                                          @select="handleSelectSelectorType"
            />
        </template>
        <div class="chart-wrapper">
            <p-data-loader class="chart-loader"
                           :loading="state.loading"
                           :data="state.data"
                           loader-type="skeleton"
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
                           :currency="state.currency"
                           :currency-rates="props.currencyRates"
                           :all-reference-type-info="props.allReferenceTypeInfo"
                           :legends.sync="state.legends"
                           :color-set="colorSet"
                           :this-page="state.thisPage"
                           :show-next-page="state.data?.more"
                           @update:thisPage="handleUpdateThisPage"
        />
    </widget-frame>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue';
import {
    computed, defineExpose, defineProps, nextTick, reactive, ref, toRef, toRefs,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router/types/router';

import { PDataLoader } from '@spaceone/design-system';
import bytes from 'bytes';
import { cloneDeep } from 'lodash';

import { byteFormatter } from '@cloudforet/core-lib';
import { getPageStart } from '@cloudforet/core-lib/component-util/pagination';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ReferenceType } from '@/store/modules/reference/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { arrayToQueryString, objectToQueryString, primitiveToQueryString } from '@/lib/router-query-string';

import { useAmcharts5 } from '@/common/composables/amcharts5';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { gray } from '@/styles/colors';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import type { DateRange } from '@/services/dashboards/config';
import type { Field } from '@/services/dashboards/widgets/_components/type';
import WidgetDataTable from '@/services/dashboards/widgets/_components/WidgetDataTable.vue';
import WidgetFrame from '@/services/dashboards/widgets/_components/WidgetFrame.vue';
import WidgetFrameHeaderDropdown from '@/services/dashboards/widgets/_components/WidgetFrameHeaderDropdown.vue';
import type { UsageType, WidgetExpose, WidgetProps } from '@/services/dashboards/widgets/_configs/config';
import { GROUP_BY_ITEM_MAP } from '@/services/dashboards/widgets/_configs/view-config';
import { getXYChartLegends, getRefinedXYChartData } from '@/services/dashboards/widgets/_helpers/widget-chart-helper';
import { getReferenceTypeOfGroupBy, sortTableData } from '@/services/dashboards/widgets/_helpers/widget-table-helper';
import { useWidgetColorSet } from '@/services/dashboards/widgets/_hooks/use-widget-color-set';
import { useWidgetFrameProps } from '@/services/dashboards/widgets/_hooks/use-widget-frame-props';
import { useWidgetLifecycle } from '@/services/dashboards/widgets/_hooks/use-widget-lifecycle';
// eslint-disable-next-line import/no-cycle
import { useWidgetState } from '@/services/dashboards/widgets/_hooks/use-widget-state';
import type { CostAnalyzeDataModel, Legend } from '@/services/dashboards/widgets/type';


type Data = CostAnalyzeDataModel['results'];
interface FullData {
    results: Data;
    more: boolean;
}

const USAGE_SOURCE_UNIT = 'GB';
const USAGE_TYPE_LABEL_MAP: Record<Extract<UsageType, 'data-transfer.out'|'requests.http'|'requests.https'>, TranslateResult> = {
    'data-transfer.out': 'Transfer-out',
    'requests.http': 'Requests (HTTP)',
    'requests.https': 'Requests (HTTPS)',
};

const props = defineProps<WidgetProps>();
const chartContext = ref<HTMLElement|null>(null);
const chartHelper = useAmcharts5(chartContext);
const { colorSet } = useWidgetColorSet({
    theme: toRef(props, 'theme'),
    dataSize: computed(() => state.chartData?.length ?? 0),
});
const state = reactive({
    ...toRefs(useWidgetState<FullData>(props)),
    fieldsKey: computed<string>(() => (state.selectedSelectorType === 'cost' ? 'usd_cost' : 'usage_quantity')),
    legends: [] as Legend[],
    chartData: computed(() => {
        const valueKey = `${state.fieldsKey}_sum`;
        const _chartData = getRefinedXYChartData(state.data?.results, state.groupBy, 'usage_type', valueKey, true);
        return _chartData.reverse();
    }),
    tableFields: computed<Field[]>(() => {
        if (!state.groupBy) return [];
        const textOptions: Field['textOptions'] = {
            type: state.fieldsKey === 'usd_cost' ? 'cost' : 'size',
            sourceUnit: USAGE_SOURCE_UNIT,
        };
        const groupByLabel = GROUP_BY_ITEM_MAP[state.groupBy]?.label ?? state.groupBy;
        const referenceType = getReferenceTypeOfGroupBy(props.allReferenceTypeInfo, state.groupBy) as ReferenceType;
        return [
            { name: state.groupBy, label: groupByLabel, textOptions: { type: 'reference', referenceType } },
            { name: `${state.fieldsKey}_sum.0.value`, label: 'Transfer-out', textOptions },
            { name: `${state.fieldsKey}_sum.1.value`, label: 'Requests (HTTP)' },
            { name: `${state.fieldsKey}_sum.2.value`, label: 'Requests (HTTPS)' },
        ];
    }),
    dateRange: computed<DateRange>(() => ({
        start: state.settings?.date_range?.start,
        end: state.settings?.date_range?.end,
    })),
    thisPage: 1,
    widgetLocation: computed<Location>(() => ({
        name: COST_EXPLORER_ROUTE.COST_ANALYSIS._NAME,
        params: {},
        query: {
            granularity: primitiveToQueryString(state.granularity),
            group_by: arrayToQueryString([state.groupBy]),
            period: objectToQueryString(state.dateRange),
            filters: objectToQueryString({ ...state.options.filters, provider: ['aws'], product: ['AmazonCloudFront'] }),
        },
    })),
});

const widgetFrameProps:ComputedRef = useWidgetFrameProps(props, state);

/* Api */
const fetchData = async (): Promise<FullData> => {
    // TODO: If there's no groupBy(required field), widget has to show invalid text.
    if (!state.groupBy) return { results: [], more: false };
    try {
        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper.setFilters([
            { k: 'usage_type', v: ['data-transfer.out', 'requests.http', 'requests.https'], o: '' },
            { k: 'product', v: 'AmazonCloudFront', o: '=' },
            { k: 'usage_type', v: null, o: '!=' },
        ]);
        apiQueryHelper.addFilter(...state.consoleFilters);
        if (state.pageSize) apiQueryHelper.setPage(getPageStart(state.thisPage, state.pageSize), state.pageSize);
        const { results, more } = await SpaceConnector.clientV2.costAnalysis.cost.analyze({
            query: {
                granularity: state.granularity,
                group_by: [state.groupBy, 'usage_type'],
                start: state.dateRange.start,
                end: state.dateRange.end,
                fields: {
                    usd_cost_sum: {
                        key: 'usd_cost',
                        operator: 'sum',
                    },
                    usage_quantity_sum: {
                        key: 'usage_quantity',
                        operator: 'sum',
                    },
                },
                sort: [{ key: '_total_usd_cost_sum', desc: true }],
                field_group: ['usage_type'],
                ...apiQueryHelper.data,
            },
        });
        return { results: sortTableData(results, 'usage_type'), more };
    } catch (e) {
        ErrorHandler.handleError(e);
        return { results: [], more: false };
    }
};

const drawChart = (chartData) => {
    if (!state.groupBy) return;
    const { chart, xAxis, yAxis } = chartHelper.createXYHorizontalChart();
    chartHelper.setChartColors(chart, colorSet.value);
    yAxis.set('categoryField', state.groupBy);
    yAxis.data.setAll(cloneDeep(chartData));
    // legend
    const legend = chartHelper.createLegend({
        nameField: 'name',
    });
    chart.children.push(legend);

    Object.entries(USAGE_TYPE_LABEL_MAP).forEach(([name, label]) => {
        const seriesSettings = {
            name: label,
            valueXField: name,
            categoryYField: state.groupBy,
            xAxis,
            yAxis,
            baseAxis: yAxis,
            stacked: true,
        };
        const series = chartHelper.createXYColumnSeries(chart, seriesSettings);
        chart.series.push(series);
        const tooltip = chartHelper.createTooltip();
        tooltip.label.adapters.add('text', (text, target) => {
            // let _text = `[${gray[700]}]{valueX}[/]`;
            let _text = `[${gray[700]}]${target.dataItem?.dataContext?.[state.groupBy]}[/]`;
            chart.series.each((s) => {
                const fieldName = s.get('valueYField') || s.get('valueXField') || '' as UsageType;
                let value = target.dataItem?.dataContext?.[fieldName];
                if (value === undefined) value = '--';
                if (fieldName === 'data-transfer.out') {
                    if (state.selectedSelectorType === 'cost') {
                        if (state.currency) value = currencyMoneyFormatter(value, state.currency, props.currencyRates);
                    } else {
                        value = bytes.parse(`${value}${USAGE_SOURCE_UNIT}`);
                        value = byteFormatter(value);
                    }
                }
                _text += `\n[${s.get('stroke')?.toString()}; fontSize: 10px]●[/] [fontSize: 14px;}]${s.get('name')}:[/] [bold; fontSize: 14px]${value}[/]`;
            });
            return _text;
        });
        series.set('tooltip', tooltip);
        series.data.setAll(cloneDeep(chartData));
    });
    if (legend) legend.data.setAll(chart.series.values);
};

const initWidget = async (data?: FullData) => {
    state.loading = true;
    state.data = data ?? await fetchData();
    state.legends = getXYChartLegends(state.data.results, state.groupBy, props.allReferenceTypeInfo);
    await nextTick();
    drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

const refreshWidget = async (thisPage = 1) => {
    state.loading = true;
    state.thisPage = thisPage;
    state.data = await fetchData();
    state.legends = getXYChartLegends(state.data.results, state.groupBy, props.allReferenceTypeInfo);
    await nextTick();
    chartHelper.refreshRoot();
    drawChart(state.chartData);
    state.loading = false;
    return state.data;
};

/* Event */
const handleSelectSelectorType = (selected: string) => {
    state.selectedSelectorType = selected;
    refreshWidget();
};
const handleUpdateThisPage = (thisPage: number) => {
    state.thisPage = thisPage;
    refreshWidget(thisPage);
};

const handleRefresh = () => {
    refreshWidget();
};

useWidgetLifecycle({
    disposeWidget: chartHelper.disposeRoot,
});

defineExpose<WidgetExpose<FullData>>({
    initWidget,
    refreshWidget,
});
</script>
<style lang="postcss" scoped>
.aws-cloud-front-cost {
    .chart-wrapper {
        height: 10.75rem;
        .chart-loader {
            height: 100%;
            .chart {
                height: 100%;
            }
        }
    }
    .widget-data-table {
        height: 50%;
    }
    &.full {
        .widget-data-table {
            height: auto;
        }
    }
}
</style>
