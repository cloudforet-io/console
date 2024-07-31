<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import { useResizeObserver } from '@vueuse/core/index';
import {
    computed, defineExpose, reactive, ref,
} from 'vue';

import dayjs from 'dayjs';
import { throttle } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PI,
} from '@cloudforet/mirinae';
import { numberFormatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
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
    getDateFormat,
    getTimeUnit,
    getWidgetBasedOnDate,
    getWidgetDateRange,
} from '@/common/modules/widgets/_helpers/widget-date-helper';
import type { DateRange } from '@/common/modules/widgets/types/widget-data-type';
import type {
    WidgetProps, WidgetEmit, WidgetExpose,
} from '@/common/modules/widgets/types/widget-display-type';
import type {
    IconValue,
    ComparisonValue,
    AbbreviationValue,
} from '@/common/modules/widgets/types/widget-field-value-type';

import { gray } from '@/styles/colors';


type Data = ListResponse<{
    [key: string]: string|number;
}>;
const props = defineProps<WidgetProps>();
const emit = defineEmits<WidgetEmit>();
const topPartRef = ref<null | HTMLElement>(null);
const valueTextRef = ref<null | HTMLElement>(null);
const state = reactive({
    loading: false,
    errorMessage: undefined as string|undefined,
    data: null as Data | null,
    previousValue: computed<number>(() => {
        const _dateFormat = getDateFormat(state.granularity);
        const _timeUnit = getTimeUnit(state.granularity);
        const _previousDate = dayjs.utc(state.basedOnDate).subtract(1, _timeUnit).format(_dateFormat);
        return state.data?.results.find((item) => item[DATE_FIELD.DATE] === _previousDate)?.[state.dataField] ?? 0;
    }),
    currentValue: computed<number>(() => {
        const _dateFormat = getDateFormat(state.granularity);
        const _currentDate = dayjs.utc(state.basedOnDate).format(_dateFormat);
        return state.data?.results.find((item) => item[DATE_FIELD.DATE] === _currentDate)?.[state.dataField] ?? 0;
    }),
    valueText: computed<string|undefined>(() => {
        if (state.abbreviation) return numberFormatter(state.currentValue, { notation: 'compact' });
        return numberFormatter(state.currentValue);
    }),
    granularity: computed<string>(() => props.widgetOptions?.granularity as string),
    basedOnDate: computed(() => getWidgetBasedOnDate(state.granularity, props.dashboardOptions?.date_range?.end)),
    dataField: computed<string|undefined>(() => props.widgetOptions?.dataField as string),
    dateRange: computed<DateRange>(() => {
        const [_start, _end] = getWidgetDateRange(state.granularity, state.basedOnDate, 2);
        return { start: _start, end: _end };
    }),
    // optional fields
    iconName: computed<string|undefined>(() => (props.widgetOptions?.icon as IconValue)?.icon?.name),
    iconColor: computed<string>(() => (props.widgetOptions?.icon as IconValue)?.color),
    comparisonColor: computed<string|undefined>(() => {
        const _comparison = state.currentValue - state.previousValue;
        if (!_comparison) return gray[700];

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
        let _percentage = '--';
        if (state.previousValue > 0) {
            _percentage = (_comparison / state.previousValue * 100).toFixed(2);
        }
        let _fixedAmount = numberFormatter(_comparison, { notation: 'compact' });
        if (!_fixedAmount || _fixedAmount === '0') _fixedAmount = '--';
        if (_format === 'all') {
            return `${_fixedAmount} (${_percentage}%)`;
        }
        if (_format === 'percent') {
            return `${_percentage}%`;
        }
        return _fixedAmount;
    }),
    comparisonText: computed(() => {
        const _comparison = state.currentValue - state.previousValue;
        if (!_comparison) return i18n.t('COMMON.WIDGETS.NUMBER_CARD.NO_CHANGE');

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
    abbreviation: computed<boolean>(() => (props.widgetOptions?.abbreviation as AbbreviationValue)?.toggleValue ?? false),
});
const { widgetFrameProps, widgetFrameEventHandlers } = useWidgetFrame(props, emit, {
    dateRange: computed(() => ({
        end: state.dateRange.end,
    })),
    errorMessage: computed(() => state.errorMessage),
    widgetLoading: computed(() => state.loading),
    noData: computed(() => (state.data ? !state.data.results?.length : false)),
});

/* Util */
const setValueTextFontSize = () => {
    if (!valueTextRef.value || !topPartRef.value) return;
    let _fontSize = 56;
    let _maxWidth = useElementSize(topPartRef).width.value;
    let _valueTextWidth = useElementSize(valueTextRef).width.value;
    if (state.iconName) _maxWidth -= 32;
    while ((_valueTextWidth > _maxWidth) && _fontSize > 0) {
        _fontSize -= 1;
        valueTextRef.value.style.fontSize = `${_fontSize}px`;
        _valueTextWidth = useElementSize(valueTextRef).width.value;
    }
};

/* Api */
const fetchWidget = async (): Promise<Data|APIErrorToast|undefined> => {
    if (props.widgetState === 'INACTIVE') return undefined;
    try {
        const _isPrivate = props.widgetId.startsWith('private');
        const _fetcher = _isPrivate
            ? SpaceConnector.clientV2.dashboard.privateWidget.load<PrivateWidgetLoadParameters, Data>
            : SpaceConnector.clientV2.dashboard.publicWidget.load<PublicWidgetLoadParameters, Data>;
        const res = await _fetcher({
            widget_id: props.widgetId,
            query: {
                granularity: state.granularity,
                start: state.dateRange.start,
                end: state.dateRange.end,
                group_by: [DATE_FIELD.DATE],
                fields: {
                    [state.dataField]: {
                        key: state.dataField,
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

const loadWidget = async (): Promise<Data|APIErrorToast> => {
    state.loading = true;
    const res = await fetchWidget();
    if (typeof res === 'function') return res;
    state.data = res;
    state.loading = false;
    return state.data;
};


useResizeObserver(valueTextRef, throttle(() => {
    setValueTextFontSize();
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
        <div class="content-wrapper">
            <div ref="topPartRef"
                 class="top-part"
            >
                <div v-if="state.iconName"
                     class="icon-wrapper"
                >
                    <p-i :name="state.iconName"
                         width="1.5rem"
                         height="1.5rem"
                         :color="state.iconColor"
                    />
                </div>
                <span ref="valueTextRef"
                      class="value-text"
                      :class="[props.size]"
                      style="font-size: 56px;"
                >{{ state.valueText }}</span>
            </div>
            <div v-if="props.widgetOptions?.comparison"
                 class="comparison-wrapper"
            >
                <p-i v-if="state.currentValue !== state.previousValue"
                     :name="(state.currentValue > state.previousValue) ? 'ic_caret-up-filled-alt' : 'ic_caret-down-filled-alt'"
                     :color="state.comparisonColor"
                     width="1rem"
                     height="1rem"
                />
                <span :style="{ 'color': state.comparisonColor }">
                    {{ state.comparisonValue }}
                </span>
                <span>{{ state.comparisonText }}</span>
            </div>
        </div>
    </widget-frame>
</template>

<style lang="postcss" scoped>
.content-wrapper {
    height: 100%;
    .top-part {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        .value-text {
            flex: 1;
            line-height: 1.25;
            display: inline-block;
            white-space: nowrap;
            &.full {
                font-size: 8rem;
            }
        }
    }
    .comparison-wrapper {
        @apply text-label-sm text-gray-700;
        padding-top: 0.5rem;
    }
}
</style>
