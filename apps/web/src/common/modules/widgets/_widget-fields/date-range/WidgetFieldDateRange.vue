<script lang="ts" setup>
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import {
    PFieldGroup, PToggleButton, PSelectDropdown, PI, PDatetimePicker,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/inputs/context-menu/type';

import { useProxyValue } from '@/common/composables/proxy-state';
import {
    DATE_RANGE_DAILY_VALUE_MAP,
    DATE_RANGE_DAILY_VALUES, DATE_RANGE_MONTHLY_VALUE_MAP,
    DATE_RANGE_MONTHLY_VALUES, DATE_RANGE_YEARLY_VALUE_MAP, DATE_RANGE_YEARLY_VALUES,
} from '@/common/modules/widgets/_widget-fields/date-range/constant';
import type { DateRangeOptions, DateRangeValue, DateRangeValueType } from '@/common/modules/widgets/_widget-fields/date-range/type';
import type {
    WidgetFieldComponentProps,
    WidgetFieldComponentEmit,
} from '@/common/modules/widgets/types/widget-field-type';

const GRANULARITY_UNIT_MAP = {
    MONTHLY: 'Month',
    DAILY: 'Day',
    YEARLY: 'Year',
};

const MONTHLY_ENABLED_VALUES = ['auto', ...DATE_RANGE_MONTHLY_VALUES, 'custom'];
const DAILY_ENABLED_VALUES = ['auto', ...DATE_RANGE_DAILY_VALUES, 'custom'];
const YEARLY_ENABLED_VALUES = ['auto', ...DATE_RANGE_YEARLY_VALUES, 'custom'];

const getCommonDateRangeValueLabel = (value: string): string => {
    if (value === 'auto') return 'Auto';
    if (value === 'custom') return 'Custom';
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
    datePreview: computed<{start: string; end: string;}>(() => {
        const isInherit = !!state.proxyValue.inherit;
        const _granularity = state.granularity;
        const relativeDateRangeValue = state.proxyValue?.options?.value;

        const baseEndDate = isInherit ? state.baseDateRange?.end : undefined;
        const thisYear = dayjs.utc(baseEndDate).year();
        const thisMonth = dayjs.utc(baseEndDate).month() + 1;
        const baseDate = baseEndDate ? dayjs.utc(baseEndDate).endOf('month') : dayjs.utc(baseEndDate);

        // Results
        let _start = '';
        let _end = '';

        if (_granularity === 'MONTHLY') {
            if (relativeDateRangeValue === 'auto') {
                _start = baseDate.subtract(11, 'month').startOf('month').format('YYYY-MM-DD');
                _end = baseDate.endOf('month').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'thisMonth') {
                _start = baseDate.startOf('month').format('YYYY-MM-DD');
                _end = baseDate.endOf('month').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastMonth') {
                const lastMonthDate = baseDate.subtract(1, 'month');
                _start = lastMonthDate.startOf('month').format('YYYY-MM-DD');
                _end = lastMonthDate.endOf('month').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastTwoMonths') {
                const lastMonthDate = baseDate.subtract(2, 'month');
                _start = lastMonthDate.startOf('month').format('YYYY-MM-DD');
                _end = lastMonthDate.endOf('month').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'thisQuarter') {
                if (thisMonth >= 1 && thisMonth <= 3) {
                    _start = `${thisYear}-01-01`;
                    _end = `${thisYear}-03-31`;
                } else if (thisMonth >= 4 && thisMonth <= 6) {
                    _start = `${thisYear}-04-01`;
                    _end = `${thisYear}-06-30`;
                } else if (thisMonth >= 7 && thisMonth <= 9) {
                    _start = `${thisYear}-07-01`;
                    _end = `${thisYear}-09-30`;
                } else if (thisMonth >= 10 && thisMonth <= 12) {
                    _start = `${thisYear}-10-01`;
                    _end = `${thisYear}-12-31`;
                }
            } else if (relativeDateRangeValue === 'lastQuarter') {
                if (thisMonth >= 1 && thisMonth <= 3) {
                    _start = `${thisYear}-10-01`;
                    _end = `${thisYear}-12-31`;
                } else if (thisMonth >= 4 && thisMonth <= 6) {
                    _start = `${thisYear}-01-01`;
                    _end = `${thisYear}-03-31`;
                } else if (thisMonth >= 7 && thisMonth <= 9) {
                    _start = `${thisYear}-04-01`;
                    _end = `${thisYear}-06-30`;
                } else if (thisMonth >= 10 && thisMonth <= 12) {
                    _start = `${thisYear}-07-01`;
                    _end = `${thisYear}-09-30`;
                }
            }
        }
        if (_granularity === 'DAILY') {
            if (relativeDateRangeValue === 'auto') {
                _start = baseDate.subtract(29, 'day').format('YYYY-MM-DD');
                _end = baseDate.format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'today') {
                _start = baseDate.format('YYYY-MM-DD');
                _end = baseDate.format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'yesterday') {
                _start = baseDate.subtract(1, 'day').format('YYYY-MM-DD');
                _end = baseDate.subtract(1, 'day').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastTwoDays') {
                _start = baseDate.subtract(2, 'day').format('YYYY-MM-DD');
                _end = baseDate.subtract(2, 'day').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastSevenDays') {
                _start = baseDate.subtract(7, 'day').format('YYYY-MM-DD');
                _end = baseDate.subtract(7, 'day').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastFourteenDays') {
                _start = baseDate.subtract(14, 'day').format('YYYY-MM-DD');
                _end = baseDate.subtract(14, 'day').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastThirtyDays') {
                _start = baseDate.subtract(30, 'day').format('YYYY-MM-DD');
                _end = baseDate.subtract(30, 'day').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'thisWeek') {
                _start = baseDate.startOf('week').format('YYYY-MM-DD');
                _end = baseDate.endOf('week').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'thisWeekToDate') {
                _start = baseDate.startOf('week').format('YYYY-MM-DD');
                _end = baseDate.format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastWeek') {
                _start = baseDate.subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
                _end = baseDate.subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
            }
        }
        if (_granularity === 'YEARLY') {
            if (relativeDateRangeValue === 'auto') {
                _start = baseDate.subtract(2, 'year').startOf('year').format('YYYY-MM-DD');
                _end = baseDate.endOf('year').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'thisYear') {
                _start = baseDate.startOf('year').format('YYYY-MM-DD');
                _end = baseDate.endOf('year').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastYear') {
                _start = baseDate.subtract(1, 'year').startOf('year').format('YYYY-MM-DD');
                _end = baseDate.subtract(1, 'year').endOf('year').format('YYYY-MM-DD');
            } else if (relativeDateRangeValue === 'lastTwoYears') {
                _start = baseDate.subtract(2, 'year').startOf('year').format('YYYY-MM-DD');
                _end = baseDate.subtract(2, 'year').endOf('year').format('YYYY-MM-DD');
            }
        }
        return {
            start: _start,
            end: _end,
        };
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
    isValid: computed<boolean>(() => {
        const _value = state.proxyValue?.options?.value;
        if (!_value) return false;
        if (checkInvalidCustomValue()) return false;
        if (state.granularity === 'MONTHLY' && !MONTHLY_ENABLED_VALUES.includes(_value)) return false;
        if (state.granularity === 'DAILY' && !DAILY_ENABLED_VALUES.includes(_value)) return false;
        if (state.granularity === 'YEARLY' && !YEARLY_ENABLED_VALUES.includes(_value)) return false;
        return true;
    }),
});

const checkInvalidCustomValue = () => {
    const _value = state.proxyValue?.options?.value;
    if (_value === 'custom') {
        if (!state.proxyValue.options.start || !state.proxyValue.options.end) return true;
        if (state.proxyValue?.inherit) {
            const inheritCustomStartValue = state.proxyValue?.options?.start || 0;
            const inheritCustomEndValue = state.proxyValue?.options?.end || 0;
            if (inheritCustomStartValue > inheritCustomEndValue) return true;
            const gap = inheritCustomEndValue - inheritCustomStartValue;
            if (state.granularity === 'YEARLY' && gap >= 3) return true;
            if (state.granularity === 'MONTHLY' && gap >= 12) return true;
            if (state.granularity === 'DAILY' && gap >= 30) return true;
        } else {
            const _startDate = dayjs.utc(state.proxyValue?.options?.start);
            const _endDate = dayjs.utc(state.proxyValue?.options.end);
            if (state.granularity === 'YEARLY' && _endDate.diff(_startDate, 'year') >= 3) return true;
            if (state.granularity === 'MONTHLY' && _endDate.diff(_startDate, 'month') >= 12) return true;
            if (state.granularity === 'DAILY' && _endDate.diff(_startDate, 'day') >= 30) return true;
            if (_startDate.isAfter(_endDate)) return true;
        }
    }
    return false;
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
            _start = isInherit ? dayjs.utc().day() : dayjs.utc().startOf('day').format('YYYY-MM-DD');
            _end = isInherit ? dayjs.utc().day() : dayjs.utc().endOf('day').format('YYYY-MM-DD');
        }
        state.proxyValue = {
            inherit: state.proxyValue.inherit,
            options: {
                value: selected,
                start: _start,
                end: _end,
            },
        };
    } else {
        state.proxyValue = {
            inherit: state.proxyValue.inherit,
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
    const isInherit = !!state.proxyValue.inherit;

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
                start: props.value?.options?.value === 'custom' ? props.value?.options?.start : undefined,
                end: props.value?.options?.value === 'custom' ? props.value?.options?.end : undefined,
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
                <div class="header">
                    <div class="value-selector">
                        <p-select-dropdown style-type="transparent"
                                           :menu="state.valueMenuItems"
                                           :selected="state.proxyValue?.options?.value"
                                           @select="handleSelectDateRangeValue"
                        >
                            <template #dropdown-left-area>
                                <p-i class="inherit-icon"
                                     :name="state.proxyValue.inherit ? 'ic_link' : 'ic_unlink'"
                                     width="1rem"
                                     height="1rem"
                                />
                            </template>
                        </p-select-dropdown>
                    </div>
                    <div class="inherit-toggle">
                        <span>{{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.INHERIT') }}</span>
                        <p-toggle-button :value="state.proxyValue?.inherit"
                                         @update:value="handleUpdateInherit"
                        />
                    </div>
                </div>
                <div class="body">
                    <div v-if="state.proxyValue?.options?.value === 'custom'"
                         class="custom-range-selector"
                    >
                        <!--Inherit CASE-->
                        <template v-if="state.proxyValue.inherit">
                            <p-field-group class="selector-field-group"
                                           required
                            >
                                <template #label>
                                    <span class="field-label">
                                        {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.START') }}
                                        <span class="granularity-unit">
                                            ({{ GRANULARITY_UNIT_MAP[state.granularity] }})
                                        </span>
                                    </span>
                                </template>
                                <p-select-dropdown :menu="state.inheritCustomMenuItems"
                                                   :selected="state.proxyValue?.options?.start"
                                                   block
                                                   :invalid="checkInvalidCustomValue()"
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
                                            ({{ GRANULARITY_UNIT_MAP[state.granularity] }})
                                        </span>
                                    </span>
                                </template>
                                <p-select-dropdown :menu="state.inheritCustomMenuItems"
                                                   :selected="state.proxyValue?.options?.end"
                                                   block
                                                   :invalid="checkInvalidCustomValue()"
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
                                                ({{ GRANULARITY_UNIT_MAP[state.granularity] }})
                                            </span>
                                        </span>
                                    </template>
                                    <p-select-dropdown :menu="state.disinheritYearlyCustomMenuItems"
                                                       :selected="dayjs.utc(state.proxyValue?.options?.start).year()"
                                                       block
                                                       :invalid="checkInvalidCustomValue()"
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
                                                ({{ GRANULARITY_UNIT_MAP[state.granularity] }})
                                            </span>
                                        </span>
                                    </template>
                                    <p-select-dropdown :menu="state.disinheritYearlyCustomMenuItems"
                                                       :selected="dayjs.utc(state.proxyValue?.options?.end).year()"
                                                       block
                                                       :invalid="checkInvalidCustomValue()"
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
                                                       :invalid="checkInvalidCustomValue()"
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
                                                       :invalid="checkInvalidCustomValue()"
                                                       @update:selected-dates="handleUpdateDisinheritMonthlyCustomSelectedDates('end', $event)"
                                    />
                                </p-field-group>
                            </div>
                            <div v-else
                                 class="disinherit-custom-daily-selector"
                            >
                                <p-datetime-picker class="picker"
                                                   select-mode="range"
                                                   :selected-dates="[dayjs.utc(state.proxyValue?.options?.start).format('YYYY-MM-DD'), dayjs.utc(state.proxyValue?.options?.end).format('YYYY-MM-DD')]"
                                                   :invalid="checkInvalidCustomValue()"
                                                   @update:selected-dates="handleUpdateDisinheritDailyCustomSelectedDates"
                                />
                            </div>
                        </template>
                    </div>
                    <div v-else
                         class="date-preview"
                    >
                        {{ `${state.datePreview.start} ~ ${state.datePreview.end}` }}
                    </div>
                </div>
            </div>
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
.widget-field-date-range {
    .form-wrapper {
        @apply border border-gray-150 rounded-lg w-full;
        padding: 0.5rem 0.75rem 0.75rem 0.75rem;

        .header {
            @apply flex items-center justify-between;
            .value-selector {
                .inherit-icon {
                    min-width: 1rem;
                }
            }
            .inherit-toggle {
                @apply inline-flex items-center text-label-sm text-gray-600 rounded-md bg-gray-100;
                gap: 0.375rem;
                padding: 0.25rem 0.375rem 0.25rem 0.5rem;
            }
        }
        .body {
            .date-preview {
                @apply bg-gray-100 rounded-lg text-label-md text-gray-900;
                padding: 0.375rem 0.75rem;
            }
            .custom-range-selector {
                @apply flex gap-2;
                .selector-field-group {
                    width: calc(50% - 0.25rem);
                    .field-label {
                        @apply text-label-sm text-gray-900 font-bold;
                        .granularity-unit {
                            @apply text-gray-500 font-normal;
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
