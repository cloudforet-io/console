<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import {
    PFieldGroup, PToggleButton, PSelectDropdown, PI, PDatetimePicker, PTooltip, PTextInput,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { DateRange } from '@/api-clients/dashboard/_types/dashboard-type';

import { useWidgetDateRange } from '@/common/modules/widgets/_composables/use-widget-date-range';
import { useWidgetContextStore } from '@/common/modules/widgets/_store/widget-context-store';
import {
    DAILY_ENABLED_VALUES,
    DATE_RANGE_ADVANCED_OPERATOR_MAP,
    DATE_RANGE_DAILY_VALUE_MAP,
    DATE_RANGE_MONTHLY_VALUE_MAP,
    DATE_RANGE_YEARLY_VALUE_MAP,
    MONTHLY_ENABLED_VALUES,
    YEARLY_ENABLED_VALUES,
} from '@/common/modules/widgets/_widget-fields/date-range/constant';
import { checkInvalidCustomValue } from '@/common/modules/widgets/_widget-fields/date-range/helper';
import type {
    DateRangeAdvancedOperator,
    DateRangeOptions,
    DateRangeValue,
    DateRangeValueType,
} from '@/common/modules/widgets/_widget-fields/date-range/type';
import type { GranularityValue } from '@/common/modules/widgets/_widget-fields/granularity/type';
import type {
    WidgetFieldComponentProps,
} from '@/common/modules/widgets/types/widget-field-type';


const GRANULARITY_UNIT_MAP = {
    MONTHLY: { singular: 'Month', plural: 'Months' },
    DAILY: { singular: 'Day', plural: 'Days' },
    YEARLY: { singular: 'Year', plural: 'Years' },
};

const getCommonDateRangeValueLabel = (value: string): string => {
    if (value === 'auto') return 'Auto';
    if (value === 'custom') return 'Custom';
    if (value === 'advanced') return 'Advanced';
    return 'Auto';
};
const FIELD_KEY = 'dateRange';

const props = defineProps<WidgetFieldComponentProps<DateRangeOptions>>();
const widgetContextStore = useWidgetContextStore();
const widgetContextState = widgetContextStore.state;
const state = reactive({
    fieldValue: computed<DateRangeValue>(() => props.fieldManager.data[FIELD_KEY].value),
    granularity: computed<GranularityValue['granularity']>(() => (props.fieldManager.data.granularity?.value?.granularity || 'MONTHLY')),
    baseDateRange: computed<DateRange|undefined>(() => widgetContextState.dashboard?.options?.date_range),
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
});

const { dateRange } = useWidgetDateRange({
    dateRangeFieldValue: computed(() => state.fieldValue),
    baseOnDate: computed(() => (state.fieldValue?.inherit ? state.baseDateRange?.end : undefined)),
    granularity: computed(() => props.fieldManager.data.granularity?.value),
    usePreviewFormat: true,
});


/* Event */
const handleSelectDateRangeValue = (selected: DateRangeValueType) => {
    if (selected === 'custom') {
        const isInherit = !!state.fieldValue?.inherit;
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
        props.fieldManager.setFieldValue(FIELD_KEY, {
            inherit: state.fieldValue?.inherit,
            options: {
                value: selected,
                start: _start,
                end: _end,
            },
        });
    } else if (selected === 'advanced') {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            inherit: state.fieldValue?.inherit,
            options: {
                value: selected,
                start: 0,
                end: 0,
                start_operator: DATE_RANGE_ADVANCED_OPERATOR_MAP.ADD,
                end_operator: DATE_RANGE_ADVANCED_OPERATOR_MAP.ADD,
            },
        });
    } else {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            inherit: state.fieldValue?.inherit,
            options: {
                value: selected,
            },
        });
    }
};
const handleUpdateInherit = (value: boolean) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        inherit: value,
        options: {
            value: 'auto',
        },
    });
};

const handleSelectCustomValue = (type: 'start'|'end', selected: number) => {
    const isInherit = !!state.fieldValue?.inherit;

    if (isInherit) {
        props.fieldManager.setFieldValue(FIELD_KEY, {
            inherit: true,
            options: {
                ...state.fieldValue?.options,
                [type]: selected,
            },
        });
    } else {
        let value;
        if (state.granularity === 'YEARLY') {
            value = type === 'start' ? `${selected}-01-01` : `${selected}-12-31`;
        } else if (state.granularity === 'MONTHLY') {
            value = '';
        }
        props.fieldManager.setFieldValue(FIELD_KEY, {
            inherit: false,
            options: {
                ...state.fieldValue?.options,
                [type]: value,
            },
        });
    }
};

const handleUpdateDisinheritMonthlyCustomSelectedDates = (type: 'start'|'end', selectedDates: string[]) => {
    if (!selectedDates.length) return;
    const value = type === 'start' ? dayjs.utc(selectedDates[0]).startOf('month').format('YYYY-MM-DD')
        : dayjs.utc(selectedDates[0]).endOf('month').format('YYYY-MM-DD');
    props.fieldManager.setFieldValue(FIELD_KEY, {
        inherit: false,
        options: {
            ...state.fieldValue?.options,
            [type]: value,
        },
    });
};

const handleUpdateDisinheritDailyCustomSelectedDates = (selectedDates: string[]) => {
    if (!selectedDates.length || selectedDates.length !== 2) return;

    const _start = dayjs.utc(selectedDates[0]).format('YYYY-MM-DD');
    const _end = dayjs.utc(selectedDates[1]).format('YYYY-MM-DD');
    props.fieldManager.setFieldValue(FIELD_KEY, {
        inherit: false,
        options: {
            ...state.fieldValue?.options,
            start: _start,
            end: _end,
        },
    });
};

const handleSelectAdvancedOperator = (type: 'start_operator'|'end_operator', selected: DateRangeAdvancedOperator) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        inherit: state.fieldValue?.inherit,
        options: {
            ...state.fieldValue?.options,
            [type]: selected,
        },
    });
};

const handleUpdateAdvancedValue = (type: 'start'|'end', value: string) => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        inherit: state.fieldValue?.inherit,
        options: {
            ...state.fieldValue?.options,
            [type]: parseInt(value),
        },
    });
};

/* Watcher */
watch(() => state.granularity, () => {
    props.fieldManager.setFieldValue(FIELD_KEY, {
        inherit: state.fieldValue?.inherit,
        options: {
            value: 'auto',
        },
    });
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
                    <p-toggle-button :value="state.fieldValue?.inherit"
                                     @update:value="handleUpdateInherit"
                    />
                </div>
                <div class="range-contents">
                    <div class="value-selector">
                        <p-select-dropdown style-type="transparent"
                                           :menu="state.valueMenuItems"
                                           :selected="state.fieldValue?.options?.value"
                                           @select="handleSelectDateRangeValue"
                        >
                            <template #dropdown-left-area>
                                <p-i class="inherit-icon"
                                     :name="state.fieldValue?.inherit ? 'ic_link' : 'ic_unlink'"
                                     width="1rem"
                                     height="1rem"
                                />
                            </template>
                        </p-select-dropdown>

                        <p-tooltip v-if="state.fieldValue?.inherit"
                                   :contents="$t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.DATE_RANGE_INFO_TEXT')"
                        >
                            <p-i name="ic_info-circle"
                                 width="1rem"
                                 height="1rem"
                            />
                        </p-tooltip>
                    </div>
                    <div class="value-detail">
                        <div v-if="state.fieldValue?.options?.value === 'custom'"
                             class="custom-advanced-range-selector"
                        >
                            <div class="select-wrapper flex gap-2">
                                <!--Inherit CASE-->
                                <template v-if="state.fieldValue?.inherit">
                                    <p-field-group class="selector-field-group-custom"
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
                                                           :selected="state.fieldValue?.options?.start"
                                                           block
                                                           :invalid="checkInvalidCustomValue(state.fieldValue, state.granularity).invalid"
                                                           @select="handleSelectCustomValue('start', $event)"
                                        />
                                    </p-field-group>
                                    <p-field-group class="selector-field-group-custom"
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
                                        <p-select-dropdown :menu="state.inheritCustomMenuItems"
                                                           :selected="state.fieldValue?.options?.end"
                                                           block
                                                           :invalid="checkInvalidCustomValue(state.fieldValue, state.granularity).invalid"
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
                                                               :selected="dayjs.utc(state.fieldValue?.options?.start).year()"
                                                               block
                                                               :invalid="checkInvalidCustomValue(state.fieldValue, state.granularity).invalid"
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
                                                               :selected="dayjs.utc(state.fieldValue?.options?.end).year()"
                                                               block
                                                               :invalid="checkInvalidCustomValue(state.fieldValue, state.granularity).invalid"
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
                                                               :selected-dates="[dayjs.utc(state.fieldValue?.options?.start).format('YYYY-MM')]"
                                                               :invalid="checkInvalidCustomValue(state.fieldValue, state.granularity).invalid"
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
                                                               :selected-dates="[dayjs.utc(state.fieldValue?.options?.end).format('YYYY-MM')]"
                                                               :invalid="checkInvalidCustomValue(state.fieldValue, state.granularity).invalid"
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
                                                               dayjs.utc(state.fieldValue?.options?.start).format('YYYY-MM-DD'),
                                                               dayjs.utc(state.fieldValue?.options?.end).format('YYYY-MM-DD')
                                                           ]"
                                                           :invalid="checkInvalidCustomValue(state.fieldValue, state.granularity).invalid"
                                                           @update:selected-dates="handleUpdateDisinheritDailyCustomSelectedDates"
                                        />
                                    </div>
                                </template>
                            </div>
                            <p v-if="checkInvalidCustomValue(state.fieldValue, state.granularity).invalid"
                               class="invalid-text"
                            >
                                {{ checkInvalidCustomValue(state.fieldValue, state.granularity).text }}
                            </p>
                        </div>
                        <div v-else-if="state.fieldValue?.options?.value === 'advanced'"
                             class="custom-advanced-range-selector"
                        >
                            <div class="select-wrapper flex gap-2 flex-col">
                                <div class="selector-field-group-advanced rounded-lg">
                                    <div class="selector-header flex gap-1 items-center bg-gray-100 rounded-t-lg">
                                        <span class="field-label">
                                            {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.START') }} :
                                        </span>
                                        <span class="range-preview">
                                            {{ dateRange.start }}
                                        </span>
                                    </div>
                                    <div class="advanced-field-content">
                                        <div class="advanced-content-wrapper flex gap-1 items-center">
                                            <p-select-dropdown class="advanced-selector"
                                                               :menu="state.advancedOperatorMenuItems"
                                                               :selected="state.fieldValue?.options?.start_operator"
                                                               :invalid="checkInvalidCustomValue(state.fieldValue, state.granularity).invalid"
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
                                            <p-text-input class="advanced-input"
                                                          type="number"
                                                          size="md"
                                                          :value="state.fieldValue?.options?.start"
                                                          :invalid="checkInvalidCustomValue(state.fieldValue, state.granularity).invalid"
                                                          @update:value="handleUpdateAdvancedValue('start', $event)"
                                            />
                                            <span class="granularity-unit">{{ GRANULARITY_UNIT_MAP[state.granularity]?.plural }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="selector-field-group-advanced  rounded-lg">
                                    <div class="selector-header flex gap-1 items-center bg-gray-100 rounded-t-lg">
                                        <span class="field-label">
                                            {{ $t('DASHBOARDS.WIDGET.OVERLAY.STEP_2.END') }} :
                                        </span>
                                        <span class="range-preview">
                                            {{ dateRange.end }}
                                        </span>
                                    </div>
                                    <div class="advanced-field-content">
                                        <div class="advanced-content-wrapper flex gap-1 items-center">
                                            <p-select-dropdown class="advanced-selector"
                                                               :menu="state.advancedOperatorMenuItems"
                                                               :selected="state.fieldValue?.options?.end_operator"
                                                               :invalid="checkInvalidCustomValue(state.fieldValue, state.granularity).invalid"
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
                                            <p-text-input class="advanced-input"
                                                          type="number"
                                                          :value="state.fieldValue?.options?.end"
                                                          :invalid="checkInvalidCustomValue(state.fieldValue, state.granularity).invalid"
                                                          @update:value="handleUpdateAdvancedValue('end', $event)"
                                            />
                                            <span class="granularity-unit">{{ GRANULARITY_UNIT_MAP[state.granularity]?.plural }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p v-if="checkInvalidCustomValue(state.fieldValue, state.granularity).invalid"
                               class="invalid-text"
                            >
                                {{ checkInvalidCustomValue(state.fieldValue, state.granularity).text }}
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
                        .selector-field-group-custom {
                            width: calc(50% - 0.25rem);
                            .field-label {
                                @apply text-label-sm text-gray-900 font-bold;
                                .granularity-unit {
                                    @apply text-gray-500 font-normal;
                                }
                            }
                        }
                        .selector-field-group-advanced {
                            width: 100%;
                            .selector-header {
                                padding: 0.5rem 0.75rem;
                                .field-label {
                                    @apply text-label-sm text-gray-900 font-bold;
                                }
                                .range-preview {
                                    @apply text-label-md text-gray-900;
                                }
                            }
                            .advanced-field-content {
                                @apply rounded-l;
                                .advanced-content-wrapper {
                                    @apply border border-gray-150 rounded-b-lg;
                                    padding: 0.75rem 0.5rem;
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
                                    .granularity-unit {
                                        @apply text-label-md text-gray-900;
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

/* custom design-system component - p-field-group */
:deep(.p-text-input) {
    .input-container {
        max-height: 2rem;
    }
}
</style>
