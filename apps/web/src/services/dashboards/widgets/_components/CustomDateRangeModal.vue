<template>
    <p-button-modal
        :header-title="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.CUSTOM_RANGE')"
        centered
        size="sm"
        fade
        backdrop
        :visible.sync="proxyVisible"
        :disabled="invalid"
        @confirm="handleConfirm"
    >
        <template #body>
            <p-field-group class="period-select"
                           :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.FROM')"
                           :help-text="settingsByGranularity.helpTextFrom"
                           required
            >
                <p-datetime-picker class="datetime-picker"
                                   :data-type="granularity ? settingsByGranularity.dateType : datetimePickerDataType"
                                   :selected-dates="startDates"
                                   :invalid="!!startDates.length && !!endDates.length && invalid"
                                   @update:selected-dates="handleUpdateStartDates"
                />
            </p-field-group>
            <p-field-group class="period-select"
                           :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.TO')"
                           :help-text="settingsByGranularity.helpTextTo"
                           required
            >
                <p-datetime-picker class="datetime-picker"
                                   :data-type="granularity ? settingsByGranularity.dateType : datetimePickerDataType"
                                   :selected-dates="endDates"
                                   :invalid="!!startDates.length && !!endDates.length && invalid"
                                   :min-date="endDateSetting.minDate"
                                   :max-date="endDateSetting.maxDate"
                                   @update:selected-dates="handleUpdateEndDates"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">

import {
    computed, reactive, toRefs, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PButtonModal, PDatetimePicker, PFieldGroup } from '@spaceone/design-system';
import type { DATA_TYPE } from '@spaceone/design-system/types/inputs/datetime-picker/type';
import dayjs from 'dayjs';

import { i18n } from '@/translations';

import { GRANULARITY } from '@/services/cost-explorer/lib/config';
import type { Period } from '@/services/cost-explorer/type';

interface CustomRangeModalSettings {
    helpTextFrom?: TranslateResult | undefined;
    helpTextTo?: TranslateResult | undefined;
    dateType?: DATA_TYPE;
}

interface DateOption {
    minDate?: string;
    maxDate?: string;
}

export default {
    name: 'CustomDateRangeModal',
    components: {
        PButtonModal,
        PFieldGroup,
        PDatetimePicker,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        datetimePickerDataType: {
            type: String,
            default: 'yearToDate',
        },
        granularity: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: computed({
                get() { return props.visible; },
                set(val) { emit('update:visible', val); },
            }),
            invalid: computed(() => {
                if (!state.startDates.length || !state.endDates.length) return true;
                const timeUnit = props.datetimePickerDataType === 'yearToDate' ? 'day' : 'month';
                const startDate = dayjs.utc(state.startDates[0]);
                const endDate = dayjs.utc(state.endDates[0]);
                return startDate.isAfter(endDate, timeUnit) || endDate.diff(startDate, 'year') >= 1;
            }),
            startDates: [] as string[],
            endDates: [] as string[],
            endDateSetting: computed<DateOption>(() => {
                let minDate;
                let maxDate;
                if (!state.startDates.length) return { minDate, maxDate };

                const startDate = dayjs.utc(state.startDates[0]);
                if (props.granularity === GRANULARITY.DAILY) {
                    minDate = startDate.format('YYYY-MM-DD');
                    maxDate = startDate.add(1, 'month').subtract(1, 'day').format('YYYY-MM-DD');
                } else {
                    minDate = startDate.format('YYYY-MM');
                    maxDate = startDate.add(11, 'month').format('YYYY-MM');
                }
                return { minDate, maxDate };
            }),
            settingsByGranularity: computed<CustomRangeModalSettings>(() => {
                if (!props.granularity) return {};
                const customRangeModalSettingsByGranularity = {
                    [GRANULARITY.ACCUMULATED]: {
                        helpTextFrom: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HELP_TEXT.UP_TO_LAST_12_MONTHS'),
                        dateType: 'yearToMonth',
                    },
                    [GRANULARITY.DAILY]: {
                        helpTextTo: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HELP_TEXT.UP_TO_31_DAYS'),
                        dateType: 'yearToDate',
                    },
                    [GRANULARITY.MONTHLY]: {
                        helpTextFrom: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HELP_TEXT.UP_TO_LAST_12_MONTHS'),
                        dateType: 'yearToMonth',
                    },
                };
                return customRangeModalSettingsByGranularity[props.granularity];
            }),
        });

        /* Event */
        const handleConfirm = () => {
            state.proxyVisible = false;
            const period: Period = {};
            if (props.granularity === GRANULARITY.DAILY) {
                period.start = state.startDates[0];
                period.end = state.endDates[0];
            } else {
                period.start = dayjs.utc(state.startDates[0]).format('YYYY-MM-01');
                period.end = dayjs.utc(state.endDates[0]).endOf('month').format('YYYY-MM-DD');
            }
            emit('confirm', period);
        };
        const handleUpdateStartDates = (selectedDates: string[]) => {
            if (selectedDates.length && state.startDates[0] !== selectedDates[0]) {
                state.startDates = selectedDates;
                state.endDates = [];
            }
        };
        const handleUpdateEndDates = (selectedDates: string[]) => {
            if (selectedDates.length && state.endDates[0] !== selectedDates[0]) {
                state.endDates = selectedDates;
            }
        };

        watch(() => props.visible, (visible) => {
            if (visible) {
                state.startDates = [];
                state.endDates = [];
            }
        });

        return {
            ...toRefs(state),
            handleConfirm,
            handleUpdateStartDates,
            handleUpdateEndDates,
        };
    },
};
</script>

<style scoped lang="postcss">
.period-select {
    .datetime-picker {
        width: 100%;
    }
}
</style>
