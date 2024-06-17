<script setup lang="ts">
import {
    defineExpose, reactive, computed,
} from 'vue';

import {
    PDataLoader,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget/use-widget-frame';
import { getWidgetBasedOnDate } from '@/common/modules/widgets/_helpers/widget-date-helper';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';
import type { GroupByValue, TableDataFieldValue } from '@/common/modules/widgets/types/widget-field-value-type';


type Data = ListResponse<{
    [key: string]: string|number;
}>;

const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const state = reactive({
    loading: false,
    data: null as Data | null,
    //
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    tableDataField: computed<string|string[]|undefined>(() => (props.widgetOptions?.tableDataField as TableDataFieldValue)?.value),
    groupByField: computed<string[]|undefined>(() => (props.widgetOptions?.groupBy as GroupByValue)?.value as string[]|undefined),
    dateRange: computed<DateRange>(() => {
        const _start = state.basedOnDate;
        const _end = state.basedOnDate;
        // if (state.xAxisField === DATE_FIELD) {
        //     [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, state.xAxisCount);
        // }
        return { start: _start, end: _end };
    }),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange: computed(() => state.dateRange),
});

const fetchWidget = async (): Promise<Data|APIErrorToast> => {
    try {
        state.loading = true;
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
            : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
        const _fields = {};
        if (Array.isArray(state.tableDataField)) {
            state.tableDataField?.forEach((field) => {
                _fields[field] = { key: field, operator: 'sum' };
            });
        } else {
            _fields[state.tableDataField] = { key: state.tableDataField, operator: 'sum' };
        }
        return await _fetcher({
            widget_id: props.widgetId,
            query: {
                granularity: state.granularity,
                start: state.dateRange.start,
                end: state.dateRange.end,
                group_by: state.groupByField,
                fields: _fields,
            },
            vars: props.dashboardVariables,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        return ErrorHandler.makeAPIErrorToast(e);
    } finally {
        state.loading = false;
    }
};
const loadWidget = async (data?: Data): Promise<Data|APIErrorToast> => {
    const res = data ?? await fetchWidget();
    if (typeof res === 'function') return res;
    state.data = res;
    return state.data;
};

useWidgetInitAndRefresh({ props, emit, loadWidget });
defineExpose<WidgetExpose<Data>>({
    loadWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <p-data-loader class="chart-loader"
                       :loading="state.loading"
                       loader-type="skeleton"
                       disable-empty-case
                       :loader-backdrop-opacity="1"
                       show-data-from-scratch
        >
            <div class="chart">
                {{ state.data }}
            </div>
        </p-data-loader>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.chart-loader {
    height: 100%;
    .chart {
        height: 100%;
    }
}
</style>
