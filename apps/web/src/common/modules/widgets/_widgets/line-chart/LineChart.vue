<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, reactive, ref, watch,
} from 'vue';

import dayjs from 'dayjs';
import type { LineSeriesOption } from 'echarts/charts';
import { init } from 'echarts/core';
import type {
    EChartsType,
} from 'echarts/core';
import {
    isEmpty, throttle,
} from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import type { Query } from '@cloudforet/core-lib/space-connector/type';
import { numberFormatter } from '@cloudforet/utils';

import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import { DATE_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import {
    getApiQueryDateRange,
    getReferenceLabel, getRefinedDynamicFieldData,
    getWidgetBasedOnDate,
    getWidgetDateFields,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import type { DateRange, DynamicFieldData, StaticFieldData } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';
import type {
    XAxisValue, DateFormatValue, TableDataFieldValue,
} from '@/common/modules/widgets/types/widget-field-value-type';

import { MASSIVE_CHART_COLORS } from '@/styles/colorsets';


type Data = StaticFieldData|DynamicFieldData;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();

const chartContext = ref<HTMLElement|null>(null);
const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
    data: null as Data | null,
    chart: null as EChartsType | null,
    xAxisData: [],
    chartData: [],
    unit: computed<string|undefined>(() => widgetFrameProps.value.unitMap?.[state.dataField]),
    chartOptions: computed<LineSeriesOption>(() => ({
        color: MASSIVE_CHART_COLORS,
        grid: {
            left: 10,
            right: 10,
            containLabel: true,
        },
        legend: {
            type: 'scroll',
            show: state.showLegends,
            bottom: 0,
            left: 0,
            icon: 'circle',
            itemWidth: 10,
            itemHeight: 10,
            formatter: (val) => getReferenceLabel(props.allReferenceTypeInfo, state.dataField, val),
        },
        tooltip: {
            trigger: 'axis',
            confine: true,
            formatter: (params) => {
                const _params = params as any[];
                let _axisValue = getReferenceLabel(props.allReferenceTypeInfo, state.xAxisField, _params[0].axisValue);
                if (state.xAxisField === DATE_FIELD.DATE) {
                    _axisValue = dayjs.utc(_axisValue).format(state.dateFormat);
                }
                if (state.unit) _axisValue += ` (${state.unit})`;
                const _values = _params.map((p) => {
                    const _seriesName = getReferenceLabel(props.allReferenceTypeInfo, state.dataField, p.seriesName);
                    const _value = p.value ? numberFormatter(p.value) : undefined;
                    if (!_value) return undefined;
                    return `${p.marker} ${_seriesName}: <b>${_value}</b>`;
                });
                return [_axisValue, ..._values].filter((d) => !!d).join('<br/>');
            },
        },
        xAxis: {
            type: 'category',
            data: state.xAxisData,
            axisLabel: {
                formatter: (val) => {
                    if (state.xAxisField === DATE_FIELD.DATE) {
                        return dayjs.utc(val).format(state.dateFormat);
                    }
                    return getReferenceLabel(props.allReferenceTypeInfo, state.xAxisField, val);
                },
            },
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (val) => numberFormatter(val, { notation: 'compact' }),
            },
        },
        series: state.chartData,
    })),
    // required fields
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    xAxisField: computed<string>(() => (props.widgetOptions?.xAxis as XAxisValue)?.value),
    xAxisCount: computed<number>(() => (props.widgetOptions?.xAxis as XAxisValue)?.count),
    dataFieldInfo: computed<TableDataFieldValue>(() => props.widgetOptions?.tableDataField as TableDataFieldValue),
    dataFieldType: computed<TableDataFieldValue['fieldType']>(() => state.dataFieldInfo?.fieldType),
    dataField: computed<string|string[]|undefined>(() => state.dataFieldInfo?.value),
    dataCriteria: computed<string|undefined>(() => state.dataFieldInfo?.criteria),
    dataMaxCount: computed<number>(() => state.dataFieldInfo?.count),
    dateRange: computed<DateRange>(() => {
        let _start = state.basedOnDate;
        let _end = state.basedOnDate;
        if (Object.values(DATE_FIELD).includes(state.xAxisField)) {
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.xAxisCount);
        } else if (Object.values(DATE_FIELD).includes(state.dataField)) {
            [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.dataMaxCount);
        }
        return { start: _start, end: _end };
    }),
    // optional fields
    showLegends: computed<boolean>(() => props.widgetOptions?.legend as boolean),
    dateFormat: computed<string|undefined>(() => {
        const _dateFormat = (props.widgetOptions?.dateFormat as DateFormatValue)?.value || 'MMM DD, YYYY';
        return DATE_FORMAT?.[_dateFormat]?.[state.granularity];
    }),
    missingValue: computed<string|undefined>(() => props.widgetOptions?.missingValue as string),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange: computed(() => state.dateRange),
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
    noData: computed(() => (state.data ? !state.data.results?.length : false)),
});

/* Api */
const fetchWidget = async (): Promise<Data|APIErrorToast|undefined> => {
    if (props.widgetState === 'INACTIVE') return undefined;
    try {
        const _fields = {};
        let _groupBy: string[] = [state.xAxisField];
        let _field_group: string[] = [];
        let _sort: Query['sort'] = [];
        if (state.dataFieldType === 'staticField') {
            state.dataField?.forEach((field) => {
                _fields[field] = { key: field, operator: 'sum' };
            });
            _sort = _groupBy.includes('Date') ? [{ key: 'Date', desc: false }] : state.dataField.map((field) => ({ key: field, desc: true }));
        } else {
            _fields[state.dataCriteria] = { key: state.dataCriteria, operator: 'sum' };
            _field_group = [state.dataField];
            _groupBy = [..._groupBy, state.dataField];
            _sort = _groupBy.includes('Date') && !_field_group.includes('Date') ? [{ key: 'Date', desc: false }] : [{ key: `_total_${state.dataCriteria}`, desc: true }];
        }
        //
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
            : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
        const _queryDateRange = getApiQueryDateRange(state.granularity, state.dateRange);
        const _query: any = {
            granularity: state.granularity,
            start: _queryDateRange.start,
            end: _queryDateRange.end,
            group_by: _groupBy,
            fields: _fields,
            field_group: _field_group,
            sort: _sort,
            page: { start: 1, limit: state.xAxisCount },
        };
        const res = await _fetcher({
            widget_id: props.widgetId,
            query: _query,
            vars: props.dashboardVars,
        });
        state.errorMessage = undefined;
        return res;
    } catch (e: any) {
        state.loading = false;
        state.errorMessage = e.message;
        ErrorHandler.handleError(e);
        return ErrorHandler.makeAPIErrorToast(e);
    }
};

/* Util */
const getDynamicFieldData = (rawData: DynamicFieldData): any[] => {
    // get refined data and series fields
    const [_refinedResults, _seriesFields] = getRefinedDynamicFieldData(rawData, state.dataCriteria, state.dataField, state.dataMaxCount);

    // get xAxis data
    let _xAxisData: string[] = [];
    if (state.xAxisField === DATE_FIELD.DATE) {
        _xAxisData = getWidgetDateFields(state.granularity, state.dateRange.start, state.dateRange.end);
    } else {
        _xAxisData = rawData?.results?.map((v) => v[state.xAxisField] as string) || [];
    }
    state.xAxisData = _xAxisData;

    // get chart data
    const _seriesData: any[] = [];
    const _defaultValue = state.missingValue === 'lineToZero' ? 0 : undefined;
    _seriesFields.forEach((field) => {
        const _data: number[] = [];
        _xAxisData.forEach((d) => {
            const _result = _refinedResults.find((result) => result[state.xAxisField] === d);
            const _value = _result?.[state.dataCriteria].find((v) => v[state.dataField] === field);
            _data.push(_value?.value || _defaultValue);
        });
        _seriesData.push({
            name: field,
            type: 'line',
            data: _data,
        });
    });

    return _seriesData;
};
const getStaticFieldData = (rawData: StaticFieldData): any[] => {
    const _seriesData: any[] = [];
    const _defaultValue = state.missingValue === 'lineToZero' ? 0 : undefined;
    state.dataField.forEach((field) => {
        _seriesData.push({
            name: field,
            type: 'line',
            data: state.xAxisData.map((d) => {
                const _data = rawData.results?.find((v) => v[state.xAxisField] === d);
                return _data ? _data[field] : _defaultValue;
            }),
        });
    });
    return _seriesData;
};
const drawChart = (rawData: Data|null) => {
    if (isEmpty(rawData)) return;

    // set xAxis data
    if (state.xAxisField === DATE_FIELD.DATE) {
        state.xAxisData = getWidgetDateFields(state.granularity, state.dateRange.start, state.dateRange.end);
    } else {
        state.xAxisData = rawData.results?.map((d) => d[state.xAxisField] as string) ?? [];
    }

    // get converted chart data
    let _seriesData: any[];
    if (state.dataFieldType === 'staticField') {
        _seriesData = getStaticFieldData(rawData);
    } else {
        _seriesData = getDynamicFieldData(rawData);
    }
    state.chartData = _seriesData;
};

const loadWidget = async (): Promise<Data|APIErrorToast> => {
    state.loading = true;
    const res = await fetchWidget();
    if (typeof res === 'function') return res;
    state.data = res;
    drawChart(state.data);
    state.loading = false;
    return state.data;
};

/* Watcher */
watch([() => state.chartData, () => chartContext.value], ([, chartCtx]) => {
    if (chartCtx) {
        state.chart = init(chartContext.value);
        state.chart.setOption(state.chartOptions, true);
    }
});

useResizeObserver(chartContext, throttle(() => {
    state.chart?.resize();
}, 500));
useWidgetInitAndRefresh({ props, emit, loadWidget });
defineExpose<WidgetExpose<Data>>({
    loadWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <!--Do not delete div element below. It's defense code for redraw-->
        <div class="h-full">
            <div ref="chartContext"
                 class="h-full"
            />
        </div>
    </widget-frame>
</template>
