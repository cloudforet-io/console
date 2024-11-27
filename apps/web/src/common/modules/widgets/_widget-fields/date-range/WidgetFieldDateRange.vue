<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import {
    PFieldGroup, PToggleButton, PSelectDropdown, PI, PDatetimePicker, PTooltip, PTextInput,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import { i18n } from '@/translations';

import { useProxyValue } from '@/common/composables/proxy-state';
import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import {
    DATE_RANGE_ADVANCED_OPERATOR_MAP,
    DATE_RANGE_DAILY_VALUE_MAP,
    DATE_RANGE_DAILY_VALUES, DATE_RANGE_MONTHLY_VALUE_MAP,
    DATE_RANGE_MONTHLY_VALUES, DATE_RANGE_YEARLY_VALUE_MAP, DATE_RANGE_YEARLY_VALUES,
} from '@/common/modules/widgets/_widget-fields/date-range/constant';
import type {
    DateRangeAdvancedOperator,
    DateRangeOptions,
    DateRangeValue,
    DateRangeValueType,
} from '@/common/modules/widgets/_widget-fields/date-range/type';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
} from '@/common/modules/widgets/types/widget-field-type';

const GRANULARITY_UNIT_MAP = {
    MONTHLY: { singular: 'Month', plural: 'Months' },
    DAILY: { singular: 'Day', plural: 'Days' },
    YEARLY: { singular: 'Year', plural: 'Years' },
};

const MONTHLY_ENABLED_VALUES = ['auto', ...DATE_RANGE_MONTHLY_VALUES, 'custom', 'advanced'];
const DAILY_ENABLED_VALUES = ['auto', ...DATE_RANGE_DAILY_VALUES, 'custom', 'advanced'];
const YEARLY_ENABLED_VALUES = ['auto', ...DATE_RANGE_YEARLY_VALUES, 'custom', 'advanced'];

const getCommonDateRangeValueLabel = (value: string): string => {
    if (value === 'auto') return 'Auto';
    if (value === 'custom') return 'Custom';
    if (value === 'advanced') return 'Advanced';
    return 'Auto';
};

const props = defineProps<WidgetFieldComponentProps<DateRangeOptions, DateRangeValue>>();
const emit = defineEmits<WidgetFieldComponentEmit<DateRangeValue>>();
const state = reactive({
    granularity: computed<string>(() => (props.allValueMap?.granularity as string|undefined) || 'MONTHLY'),
    baseDateRange: computed(() => props.dateRange),
    proxyValue: useProxyValue<DateRangeValue>('value', props, emit),
    valueMenuItems: computed<MenuItem[]>(() => {
        if (state.granularity === 'MONTHLY') return MONTHLY_ENABLED_VALUES.map((value) => ({ label: DATE_RANGE_MONTHLY_VALUE_MAP[value] || getCommonDateRangeValueLabel(value), name: value }));
        if (state.granularity === 'DAILY') return DAILY_ENABLED_VALUES.map((value) => ({ label: DATE_RANGE_DAILY_VALUE_MAP[value] || getCommonDateRangeValueLabel(value), name: value }));
        if (state.granularity === 'YEARLY') return YEARLY_ENABLED_VALUES.map((value) => ({ label: DATE_RANGE_YEARLY_VALUE_MAP[value] || getCommonDateRangeValueLabel(value), name: value }));
        return [];
    }),
    inheritCustomMenuItems: computed<MenuItem[]>(() => {
        if (state.granularity === 'MONTHLY') {
            return Array.from({ length: 12 }, (_, i) => ({ name: (i + 1), label: (i + 1).toString() }));
        }
        if (state.granularity === 'DAILY') {
            return Array.from({ length: 31 }, (_, i) => ({ name: (i + 1), label: (i + 1).toString() }));
        }
        const currentYear = dayjs().year();
        return Array.from({ length: 3 }, (_, i) => ({ name: currentYear - i, label: (currentYear - i).toString() }));
    }),
    disinheritYearlyCustomMenuItems: computed<MenuItem[]>(() => {
        const currentYear = dayjs().year();
        return Array.from({ length: 10 }, (_, i) => ({ name: currentYear - i, label: (currentYear - i).toString() }));
    }),
    advancedOperatorMenuItems: computed<MenuItem[]>(() => [
        { name: DATE_RANGE_ADVANCED_OPERATOR_MAP.ADD, label: 'Plus', icon: 'ic_plus-circle' },
        { name: DATE_RANGE_ADVANCED_OPERATOR_MAP.SUBSTRACT, label: 'Minus', icon: 'ic_minus_circle' },
    ]),
    isValid: computed<boolean>(() => {
        const _value = state.proxyValue?.options?.value;
        if (!_value) return false;
        if (checkInvalidCustomValue().invalid) return false;
        if (state.granularity === 'MONTHLY' && !MONTHLY_ENABLED_VALUES.includes(_value)) return false;
        if (state.granularity === 'DAILY' && !DAILY_ENABLED_VALUES.includes(_value)) return false;
        if (state.granularity === 'YEARLY' && !YEARLY_ENABLED_VALUES.includes(_value)) return false;
        return true;
    }),
});

const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => state.proxyValue),
    baseOnDate: computed(() => (state.proxyValue?.inherit ? state.baseDateRange?.end : undefined)),
    granularity: computed(() => state.granularity),
    usePreviewFormat: true,
});

const checkInvalidCustomValue = () => {
    const _value = state.proxyValue?.options?.value;
    if (_value === 'custom') {
        if (!state.proxyValue.options.start || !state.proxyValue.options.end) return { invalid: true, text: '' };
        if (state.proxyValue?.inherit) {
            const inheritCustomStartValue = state.proxyValue?.options?.start || 0;
            const inheritCustomEndValue = state.proxyValue?.options?.end || 0;
            if (inheritCustomStartValue > inheritCustomEndValue) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_RANGE_TEXT') };
            const gap = inheritCustomEndValue - inheritCustomStartValue;
            if (state.granularity === 'YEARLY' && gap >= 3) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
            if (state.granularity === 'MONTHLY' && gap >= 12) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
            if (state.granularity === 'DAILY' && gap >= 31) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
        } else {
            const _startDate = dayjs.utc(state.proxyValue?.options?.start);
            const _endDate = dayjs.utc(state.proxyValue?.options.end);
            if (state.granularity === 'YEARLY' && _endDate.diff(_startDate, 'year') >= 3) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
            if (state.granularity === 'MONTHLY' && _endDate.diff(_startDate, 'month') >= 12) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
            if (state.granularity === 'DAILY' && _endDate.diff(_startDate, 'day') >= 31) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
            if (_startDate.isAfter(_endDate)) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_RANGE_TEXT') };
        }
    } else if (_value === 'advanced') {
        if (
            (state.proxyValue.options.start === undefined || state.proxyValue.options.end === undefined)
            || (Number.isNaN(state.proxyValue.options.start) || Number.isNaN(state.proxyValue.options.end))
        ) return { invalid: true, text: '' };
        const _startOperator = state.proxyValue?.options?.start_operator;
        const _endOperator = state.proxyValue?.options?.end_operator;
        const _start = state.proxyValue?.options?.start as number|undefined;
        const _end = state.proxyValue?.options?.end as number|undefined;
        const _startValue: number = _startOperator === DATE_RANGE_ADVANCED_OPERATOR_MAP.ADD ? _start || 0 : (_start || 0) * -1;
        const _endValue: number = _endOperator === DATE_RANGE_ADVANCED_OPERATOR_MAP.ADD ? _end || 0 : (_end || 0) * -1;

        const gap = _endValue - _startValue;

        if (gap < 0) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_RANGE_TEXT') };
        if (state.granularity === 'YEARLY' && gap >= 3) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
        if (state.granularity === 'MONTHLY' && gap >= 12) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
        if (state.granularity === 'DAILY' && gap >= 31) return { invalid: true, text: i18n.t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INVALID_LIMIT_TEXT') };
    }
    return { invalid: false, text: '' };
};

/* Event */
const handleSelectDateRangeValue = (selected: DateRangeValueType) => {
    if (selected === 'custom') {
        const isInherit = !!state.proxyValue?.inherit;
        let _start;
        let _end;
        if (state.granularity === 'YEARLY') {
            _start = isInherit ? dayjs.utc().year() : dayjs.utc().startOf('year').format('YYYY-MM-DD');
            _end = isInherit ? dayjs.utc().year() : dayjs.utc().endOf('year').format('YYYY-MM-DD');
        } else if (state.granularity === 'MONTHLY') {
            _start = isInherit ? dayjs.utc().month() + 1 : dayjs.utc().startOf('month').format('YYYY-MM-DD');
            _end = isInherit ? dayjs.utc().month() + 1 : dayjs.utc().endOf('month').format('YYYY-MM-DD');
        } else if (state.granularity === 'DAILY') {
            _start = isInherit ? dayjs.utc().date() : dayjs.utc().startOf('day').format('YYYY-MM-DD');
            _end = isInherit ? dayjs.utc().date() : dayjs.utc().endOf('day').format('YYYY-MM-DD');
        }
        state.proxyValue = {
            inherit: state.proxyValue?.inherit,
            options: {
                value: selected,
                start: _start,
                end: _end,
            },
        };
    } else if (selected === 'advanced') {
        state.proxyValue = {
            inherit: state.proxyValue?.inherit,
            options: {
                value: selected,
                start: 0,
                end: 0,
                start_operator: DATE_RANGE_ADVANCED_OPERATOR_MAP.ADD,
                end_operator: DATE_RANGE_ADVANCED_OPERATOR_MAP.ADD,
            },
        };
    } else {
        state.proxyValue = {
            inherit: state.proxyValue?.inherit,
            options: {
                value: selected,
            },
        };
    }
};
const handleUpdateInherit = (value: boolean) => {
    state.proxyValue = {
        inherit: value,
        options: {
            value: 'auto',
        },
    };
};

const handleSelectCustomValue = (type: 'start'|'end', selected: number) => {
    const isInherit = !!state.proxyValue?.inherit;

    if (isInherit) {
        state.proxyValue = {
            inherit: true,
            options: {
                ...state.proxyValue?.options,
                [type]: selected,
            },
        };
    } else {
        let value;
        if (state.granularity === 'YEARLY') {
            value = type === 'start' ? `${selected}-01-01` : `${selected}-12-31`;
        } else if (state.granularity === 'MONTHLY') {
            value = '';
        }

        state.proxyValue = {
            inherit: false,
            options: {
                ...state.proxyValue?.options,
                [type]: value,
            },
        };
    }
};

const handleUpdateDisinheritMonthlyCustomSelectedDates = (type: 'start'|'end', selectedDates: string[]) => {
    if (!selectedDates.length) return;
    const value = type === 'start' ? dayjs.utc(selectedDates[0]).startOf('month').format('YYYY-MM-DD')
        : dayjs.utc(selectedDates[0]).endOf('month').format('YYYY-MM-DD');
    state.proxyValue = {
        inherit: false,
        options: {
            ...state.proxyValue?.options,
            [type]: value,
        },
    };
};

const handleUpdateDisinheritDailyCustomSelectedDates = (selectedDates: string[]) => {
    if (!selectedDates.length || selectedDates.length !== 2) return;

    const _start = dayjs.utc(selectedDates[0]).format('YYYY-MM-DD');
    const _end = dayjs.utc(selectedDates[1]).format('YYYY-MM-DD');

    state.proxyValue = {
        inherit: false,
        options: {
            ...state.proxyValue?.options,
            start: _start,
            end: _end,
        },
    };
};

const handleSelectAdvancedOperator = (type: 'start_operator'|'end_operator', selected: DateRangeAdvancedOperator) => {
    state.proxyValue = {
        inherit: state.proxyValue?.inherit,
        options: {
            ...state.proxyValue?.options,
            [type]: selected,
        },
    };
};

const handleUpdateAdvancedValue = (type: 'start'|'end', value: number) => {
    state.proxyValue = {
        inherit: state.proxyValue?.inherit,
        options: {
            ...state.proxyValue?.options,
            [type]: parseInt(value),
        },
    };
};

/* Watcher */
watch(() => state.granularity, () => {
    state.proxyValue = {
        inherit: state.proxyValue?.inherit,
        options: {
            value: 'auto',
        },
    };
});

watch(() => state.isValid, (isValid) => {
    emit('update:is-valid', isValid);
});

const checkInvalidValueAndSetValidValue = (value: DateRangeValueType, granularity?: string): DateRangeValueType => {
    if (!value || !granularity) return 'auto';
    if (granularity === 'MONTHLY' && !MONTHLY_ENABLED_VALUES.includes(value)) return 'auto';
    if (granularity === 'DAILY' && !DAILY_ENABLED_VALUES.includes(value)) return 'auto';
    if (granularity === 'YEARLY' && !YEARLY_ENABLED_VALUES.includes(value)) return 'auto';
    return value;
};

onMounted(() => {
    if (props.value) {
        state.proxyValue = {
            inherit: props.value?.inherit,
            options: {
                value: checkInvalidValueAndSetValidValue(props.value?.options?.value, state.granularity),
                start: props.value?.options?.value === 'custom' || props.value?.options?.value === 'advanced' ? props.value?.options?.start : undefined,
                end: props.value?.options?.value === 'custom' || props.value?.options?.value === 'advanced' ? props.value?.options?.end : undefined,
                start_operator: props.value?.options?.value === 'advanced' ? props.value?.options?.start_operator : undefined,
                end_operator: props.value?.options?.value === 'advanced' ? props.value?.options?.end_operator : undefined,
            },
        };
    } else {
        state.proxyValue = {
            inherit: true,
            options: {
                value: 'auto',
            },
        };
    }
});
</script>

<template>
    <div class="widget-field-date-range">
        <p-field-group :label="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE')"
                       required
        >
            <div class="form-wrapper">
                <div class="inherit-toggle">
                    <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.USE_BASE_DATE') }}</span>
                    <p-toggle-button :value="state.proxyValue?.inherit"
                                     @update:value="handleUpdateInherit"
                    />
                </div>
                <div class="range-contents">
                    <div class="value-selector">
                        <p-select-dropdown style-type="transparent"
                                           :menu="state.valueMenuItems"
                                           :selected="state.proxyValue?.options?.value"
                                           @select="handleSelectDateRangeValue"
                        >
                            <template #dropdown-left-area>
                                <p-i class="inherit-icon"
                                     :name="state.proxyValue?.inherit ? 'ic_link' : 'ic_unlink'"
                                     width="1rem"
                                     height="1rem"
                                />
                            </template>
                        </p-select-dropdown>

                        <p-tooltip v-if="state.proxyValue?.inherit"
                                   :contents="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INFO_TEXT')"
                        >
                            <p-i name="ic_info-circle"
                                 width="1rem"
                                 height="1rem"
                            />
                        </p-tooltip>
                    </div>
                    <div class="value-detail">
                        <div v-if="state.proxyValue?.options?.value === 'custom'"
                             class="custom-advanced-range-selector"
                        >
                            <div class="select-wrapper">
                                <!--Inherit CASE-->
                                <template v-if="state.proxyValue?.inherit">
                                    <p-field-group class="selector-field-group"
                                                   required
                                    >
                                        <template #label>
                                            <span class="field-label">
                                                {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.START') }}
                                                <span class="granularity-unit">
                                                    ({{ GRANULARITY_UNIT_MAP[state.granularity]?.singular }})
                                                </span>
                                            </span>
                                        </template>
                                        <p-select-dropdown :menu="state.inheritCustomMenuItems"
                                                           :selected="state.proxyValue?.options?.start"
                                                           block
                                                           :invalid="checkInvalidCustomValue().invalid"
                                                           @select="handleSelectCustomValue('start', $event)"
                                        />
                                    </p-field-group>
                                    <p-field-group class="selector-field-group"
                                                   required
                                    >
                                        <template #label>
                                            <span class="field-label">
                                                {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.END') }}
                                                <span class="granularity-unit">
                                                    ({{ GRANULARITY_UNIT_MAP[state.granularity]?.sigular }})
                                                </span>
                                            </span>
                                        </template>
                                        <p-select-dropdown :menu="state.inheritCustomMenuItems"
                                                           :selected="state.proxyValue?.options?.end"
                                                           block
                                                           :invalid="checkInvalidCustomValue().invalid"
                                                           @select="handleSelectCustomValue('end', $event)"
                                        />
                                    </p-field-group>
                                </template>
                                <!--Disinherit CASE-->
                                <template v-else>
                                    <div v-if="state.granularity === 'YEARLY'"
                                         class="disinherit-custom-yearly-selector"
                                    >
                                        <p-field-group class="selector-field-group"
                                                       required
                                        >
                                            <template #label>
                                                <span class="field-label">
                                                    {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.START') }}
                                                    <span class="granularity-unit">
                                                        ({{ GRANULARITY_UNIT_MAP[state.granularity]?.singular }})
                                                    </span>
                                                </span>
                                            </template>
                                            <p-select-dropdown :menu="state.disinheritYearlyCustomMenuItems"
                                                               :selected="dayjs.utc(state.proxyValue?.options?.start).year()"
                                                               block
                                                               :invalid="checkInvalidCustomValue().invalid"
                                                               @select="handleSelectCustomValue('start', $event)"
                                            />
                                        </p-field-group>
                                        <p-field-group class="selector-field-group"
                                                       required
                                        >
                                            <template #label>
                                                <span class="field-label">
                                                    {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.END') }}
                                                    <span class="granularity-unit">
                                                        ({{ GRANULARITY_UNIT_MAP[state.granularity]?.singular }})
                                                    </span>
                                                </span>
                                            </template>
                                            <p-select-dropdown :menu="state.disinheritYearlyCustomMenuItems"
                                                               :selected="dayjs.utc(state.proxyValue?.options?.end).year()"
                                                               block
                                                               :invalid="checkInvalidCustomValue().invalid"
                                                               @select="handleSelectCustomValue('end', $event)"
                                            />
                                        </p-field-group>
                                    </div>
                                    <div v-else-if="state.granularity === 'MONTHLY'"
                                         class="disinherit-custom-monthly-selector"
                                    >
                                        <p-field-group class="selector-field-group"
                                                       required
                                        >
                                            <template #label>
                                                <span class="field-label">
                                                    {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.START') }}
                                                </span>
                                            </template>
                                            <p-datetime-picker class="picker"
                                                               select-mode="single"
                                                               data-type="yearToMonth"
                                                               :selected-dates="[dayjs.utc(state.proxyValue?.options?.start).format('YYYY-MM')]"
                                                               :invalid="checkInvalidCustomValue().invalid"
                                                               @update:selected-dates="handleUpdateDisinheritMonthlyCustomSelectedDates('start', $event)"
                                            />
                                        </p-field-group>
                                        <p-field-group class="selector-field-group"
                                                       required
                                        >
                                            <template #label>
                                                <span class="field-label">
                                                    {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.END') }}
                                                </span>
                                            </template>
                                            <p-datetime-picker class="picker"
                                                               select-mode="single"
                                                               data-type="yearToMonth"
                                                               :selected-dates="[dayjs.utc(state.proxyValue?.options?.end).format('YYYY-MM')]"
                                                               :invalid="checkInvalidCustomValue().invalid"
                                                               @update:selected-dates="handleUpdateDisinheritMonthlyCustomSelectedDates('end', $event)"
                                            />
                                        </p-field-group>
                                    </div>
                                    <div v-else
                                         class="disinherit-custom-daily-selector"
                                    >
                                        <p-datetime-picker class="picker"
                                                           select-mode="range"
                                                           :selected-dates="[
                                                               dayjs.utc(state.proxyValue?.options?.start).format('YYYY-MM-DD'),
                                                               dayjs.utc(state.proxyValue?.options?.end).format('YYYY-MM-DD')
                                                           ]"
                                                           :invalid="checkInvalidCustomValue().invalid"
                                                           @update:selected-dates="handleUpdateDisinheritDailyCustomSelectedDates"
                                        />
                                    </div>
                                </template>
                            </div>
                            <p v-if="checkInvalidCustomValue().invalid"
                               class="invalid-text"
                            >
                                {{ checkInvalidCustomValue().text }}
                            </p>
                        </div>
                        <div v-else-if="state.proxyValue?.options?.value === 'advanced'"
                             class="custom-advanced-range-selector"
                        >
                            <div class="select-wrapper">
                                <p-field-group class="selector-field-group"
                                               required
                                >
                                    <template #label>
                                        <span class="field-label">
                                            {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.START') }}
                                        </span>
                                    </template>
                                    <div class="advanced-field-content">
                                        <div class="range-preview">
                                            {{ dateRange.start }}
                                        </div>
                                        <div class="advanced-content-wrapper">
                                            <div class="operator">
                                                <span>Today</span>
                                                <p-select-dropdown class="advanced-selector"
                                                                   :menu="state.advancedOperatorMenuItems"
                                                                   :selected="state.proxyValue?.options?.start_operator"
                                                                   :invalid="checkInvalidCustomValue().invalid"
                                                                   @update:selected="handleSelectAdvancedOperator('start_operator', $event)"
                                                >
                                                    <template #dropdown-button="item">
                                                        <div class="selected">
                                                            <p-i :name="item?.icon"
                                                                 width="1rem"
                                                                 height="1rem"
                                                            />
                                                            <span>{{ item?.label }}</span>
                                                        </div>
                                                    </template>
                                                </p-select-dropdown>
                                            </div>
                                            <div class="value">
                                                <p-text-input class="advanced-input"
                                                              type="number"
                                                              :value="state.proxyValue?.options?.start"
                                                              :invalid="checkInvalidCustomValue().invalid"
                                                              @update:value="handleUpdateAdvancedValue('start', $event)"
                                                />
                                                <span>{{ GRANULARITY_UNIT_MAP[state.granularity]?.plural }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </p-field-group>
                                <p-field-group class="selector-field-group"
                                               required
                                >
                                    <template #label>
                                        <span class="field-label">
                                            {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.END') }}
                                        </span>
                                    </template>
                                    <div class="advanced-field-content">
                                        <div class="range-preview">
                                            {{ dateRange.end }}
                                        </div>
                                        <div class="advanced-content-wrapper">
                                            <div class="operator">
                                                <span>Today</span>
                                                <p-select-dropdown class="advanced-selector"
                                                                   :menu="state.advancedOperatorMenuItems"
                                                                   :selected="state.proxyValue?.options?.end_operator"
                                                                   :invalid="checkInvalidCustomValue().invalid"
                                                                   @update:selected="handleSelectAdvancedOperator('end_operator', $event)"
                                                >
                                                    <template #dropdown-button="item">
                                                        <div class="selected">
                                                            <p-i :name="item?.icon"
                                                                 width="1rem"
                                                                 height="1rem"
                                                            />
                                                            <span>{{ item?.label }}</span>
                                                        </div>
                                                    </template>
                                                </p-select-dropdown>
                                            </div>
                                            <div class="value">
                                                <p-text-input class="advanced-input"
                                                              type="number"
                                                              :value="state.proxyValue?.options?.end"
                                                              :invalid="checkInvalidCustomValue().invalid"
                                                              @update:value="handleUpdateAdvancedValue('end', $event)"
                                                />
                                                <span>{{ GRANULARITY_UNIT_MAP[state.granularity]?.plural }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </p-field-group>
                            </div>
                            <p v-if="checkInvalidCustomValue().invalid"
                               class="invalid-text"
                            >
                                {{ checkInvalidCustomValue().text }}
                            </p>
                        </div>
                        <div v-else
                             class="date-preview"
                        >
                            {{ `${dateRange.start} ~ ${dateRange.end}` }}
                        </div>
                    </div>
                </div>
            </div>
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
.widget-field-date-range {
    .form-wrapper {
        @apply border-2 border-gray-150 rounded-lg w-full;

        .inherit-toggle {
            @apply flex items-center justify-between text-label-md text-gray-900 border-b border-gray-150;

            gap: 0.375rem;
            padding: 0.75rem;
        }
        .range-contents {
            padding: 0.25rem 0.75rem 0.75rem;
            .value-selector {
                @apply w-full flex items-center justify-between;
                height: 2rem;
                margin-bottom: 0.125rem;
                .inherit-icon {
                    min-width: 1rem;
                }
            }
            .value-detail {
                @apply w-full;
                .date-preview {
                    @apply bg-gray-100 rounded-lg text-label-md text-gray-900;
                    height: 2rem;
                    padding: 0.375rem 0.75rem;
                }
                .custom-advanced-range-selector {
                    .select-wrapper {
                        @apply flex gap-2;
                        .selector-field-group {
                            width: calc(50% - 0.25rem);
                            .field-label {
                                @apply text-label-sm text-gray-900 font-bold;
                                .granularity-unit {
                                    @apply text-gray-500 font-normal;
                                }
                            }
                            .advanced-field-content {
                                @apply rounded-l;
                                .range-preview {
                                    @apply bg-gray-100 text-label-md text-gray-900 rounded-t-lg;
                                    padding: 0.375rem 0.75rem;
                                }
                                .advanced-content-wrapper {
                                    @apply border border-gray-150 rounded-b-lg;
                                    padding: 0.75rem 0.5rem;
                                    .operator {
                                        @apply flex items-center gap-1 flex-wrap;
                                        margin-bottom: 0.25rem;
                                    }
                                    .value {
                                        @apply flex items-center gap-1 flex-wrap;
                                    }
                                    .advanced-selector {
                                        @apply flex-1;
                                        .selected {
                                            @apply flex items-center gap-1 text-label-md text-gray-800;
                                        }
                                    }
                                    .advanced-input {
                                        @apply flex-1;
                                        min-width: 6.5rem;
                                    }
                                }
                            }
                        }
                    }
                    .disinherit-custom-yearly-selector {
                        @apply flex gap-2 w-full;
                    }
                    .disinherit-custom-monthly-selector {
                        @apply flex gap-2 w-full;
                    }
                    .disinherit-custom-daily-selector {
                        @apply w-full;
                    }
                    .invalid-text {
                        @apply text-label-md text-red-500;
                        margin-top: 0.25rem;
                    }
                }
            }
        }
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    margin-bottom: 0;
}

/* custom design-system component - p-datetime-picker */
:deep(.p-datetime-picker) {
    width: 100%;
}
</style>
