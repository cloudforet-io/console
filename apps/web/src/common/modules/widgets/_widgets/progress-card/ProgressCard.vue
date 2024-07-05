<script setup lang="ts">
import { computed, defineExpose, reactive } from 'vue';

import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { numberFormatter } from '@cloudforet/utils';

import type { PrivateWidgetLoadParameters } from '@/schema/dashboard/private-widget/api-verbs/load';
import type { PublicWidgetLoadParameters } from '@/schema/dashboard/public-widget/api-verbs/load';
import { i18n } from '@/translations';

import type { APIErrorToast } from '@/common/composables/error/errorHandler';
import ErrorHandler from '@/common/composables/error/errorHandler';
import WidgetFrame from '@/common/modules/widgets/_components/WidgetFrame.vue';
import { useWidgetFrame } from '@/common/modules/widgets/_composables/use-widget-frame';
import { useWidgetInitAndRefresh } from '@/common/modules/widgets/_composables/use-widget-init-and-refresh';
import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import {
    getDateFormat, getTimeUnit,
    getWidgetBasedOnDate,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import type { DateRange, WidgetLoadData } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit,
    WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';
import type { ComparisonValue } from '@/common/modules/widgets/types/widget-field-value-type';


const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
    data: null as WidgetLoadData | null,
    previousValue: computed<number>(() => {
        const _dateFormat = getDateFormat(state.granularity);
        const _timeUnit = getTimeUnit(state.granularity);
        const _previousDate = dayjs.utc(state.basedOnDate).subtract(1, _timeUnit).format(_dateFormat);
        return state.data?.results.find((item) => item.Date === _previousDate)?.[state.dataField] ?? 0;
    }),
    currentValue: computed<number>(() => {
        const _dateFormat = getDateFormat(state.granularity);
        const _currentDate = dayjs.utc(state.basedOnDate).format(_dateFormat);
        return state.data?.results.find((item) => item.Date === _currentDate)?.[state.dataField] ?? 0;
    }),
    // required fields
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    totalField: computed<string>(() => props.widgetOptions?.totalField as string),
    basisField: computed<string>(() => props.widgetOptions?.basisField as string),
    dateRange: computed<DateRange>(() => {
        const [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, 2);
        return { start: _start, end: _end };
    }),
    // optional fields
    comparisonColor: computed<string|undefined>(() => {
        const _target = (props.widgetOptions?.comparison as ComparisonValue[])?.[0];
        if (state.currentValue > state.previousValue) {
            return _target?.increaseColor;
        }
        return _target?.decreaseColor;
    }),
    comparisonValue: computed<string>(() => {
        const _target = (props.widgetOptions?.comparison as ComparisonValue[])?.[0];
        const _comparison = Math.abs(state.currentValue - state.previousValue);
        const _format = _target?.format || 'all';
        const _percentage = _comparison / state.previousValue * 100;
        const _fixedAmount = numberFormatter(_comparison, { notation: 'compact' }) || '--';
        if (_format === 'all') {
            return `${_fixedAmount} (${_percentage.toFixed(2)}%)`;
        }
        if (_format === 'percent') {
            return `${_percentage.toFixed(2)}%`;
        }
        return _fixedAmount;
    }),
    comparisonText: computed(() => {
        const _comparison = state.currentValue - state.previousValue;
        let _text;
        if (_comparison < 0) {
            if (state.granularity === 'YEARLY') {
                _text = i18n.t('COMMON.WIDGETS.NUMBER_CARD.LESS_THAN_PREVIOUS_YEAR');
            } else if (state.granularity === 'MONTHLY') {
                _text = i18n.t('COMMON.WIDGETS.NUMBER_CARD.LESS_THAN_PREVIOUS_MONTH');
            } else {
                _text = i18n.t('COMMON.WIDGETS.NUMBER_CARD.LESS_THAN_PREVIOUS_DAY');
            }
        } else if (state.granularity === 'YEARLY') {
            _text = i18n.t('COMMON.WIDGETS.NUMBER_CARD.MORE_THAN_PREVIOUS_YEAR');
        } else if (state.granularity === 'MONTHLY') {
            _text = i18n.t('COMMON.WIDGETS.NUMBER_CARD.MORE_THAN_PREVIOUS_MONTH');
        } else {
            _text = i18n.t('COMMON.WIDGETS.NUMBER_CARD.MORE_THAN_PREVIOUS_DAY');
        }
        return _text;
    }),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange: computed(() => ({
        end: state.dateRange.end,
    })),
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
});

/* Api */
const fetchWidget = async (): Promise<WidgetLoadData|APIErrorToast|undefined> => {
    if (props.widgetState === 'INACTIVE') return undefined;
    try {
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, WidgetLoadData>
            : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, WidgetLoadData>;
        const res = await _fetcher({
            widget_id: props.widgetId,
            query: {
                granularity: state.granularity,
                start: state.dateRange.start,
                end: state.dateRange.end,
                group_by: [DATE_FIELD.DATE],
                fields: {
                    [state.totalField]: {
                        key: state.totalField,
                        operator: 'sum',
                    },
                    [state.basisField]: {
                        key: state.basisField,
                        operator: 'sum',
                    },
                },
            },
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
const loadWidget = async (data?: WidgetLoadData): Promise<WidgetLoadData|APIErrorToast> => {
    state.loading = true;
    const res = data ?? await fetchWidget();
    if (typeof res === 'function') return res;
    state.data = res;
    state.loading = false;
    return state.data;
};

useWidgetInitAndRefresh({ props, emit, loadWidget });
defineExpose<WidgetExpose<WidgetLoadData>>({
    loadWidget,
});
</script>

<template>
    <widget-frame v-bind="widgetFrameProps"
                  v-on="widgetFrameEventHandlers"
    >
        <div class="chart">
            Progress Card
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.chart {
    height: 100%;
}
</style>
