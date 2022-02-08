<template>
    <p-button-modal
        :header-title="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.CUSTOM_RANGE')"
        centered
        size="sm"
        fade
        :scrollable="false"
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
                <p-datetime-picker class="datetime-picker" :data-type="granularity ? settingsByGranularity.dateType : datetimePickerDataType" :selected-dates.sync="startDate"
                                   :invalid="!!startDate.length && !!endDate.length && invalid"
                                   :min-date="fromDate.minDate"
                                   :max-date="fromDate.maxDate"
                />
            </p-field-group>
            <p-field-group class="period-select"
                           :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.TO')"
                           :help-text="settingsByGranularity.helpTextTo"
                           required
            >
                <p-datetime-picker class="datetime-picker" :data-type="granularity ? settingsByGranularity.dateType : datetimePickerDataType" :selected-dates.sync="endDate"
                                   :invalid="!!startDate.length && !!endDate.length && invalid"
                                   :min-date="toDate.minDate"
                                   :max-date="toDate.maxDate"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<script lang="ts">
import { PButtonModal, PDatetimePicker, PFieldGroup } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { DATA_TYPE } from '@spaceone/design-system/src/inputs/datetime-picker/type';
import dayjs from 'dayjs';
import { GRANULARITY } from '@/services/billing/cost-management/lib/config';
import { TranslateResult } from 'vue-i18n';
import { i18n } from '@/translations';

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
    name: 'CostDashboardCustomRangeModal',
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
            default: DATA_TYPE.yearToDate,
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
                if (!state.startDate.length || !state.endDate.length) return true;
                const timeUnit = props.datetimePickerDataType === DATA_TYPE.yearToDate ? 'day' : 'month';
                const startDate = dayjs.utc(state.startDate[0]);
                const endDate = dayjs.utc(state.endDate[0]);
                return startDate.isAfter(endDate, timeUnit) || endDate.diff(startDate, 'year') >= 1;
            }),
            startDate: [],
            endDate: [],
            fromDate: computed<DateOption>(() => {
                let minDate;
                let maxDate;
                if (!state.endDate.length) return { minDate, maxDate };

                const endDate = dayjs.utc(state.endDate[0]);
                if (props.granularity === GRANULARITY.DAILY) {
                    minDate = endDate.subtract(1, 'month').format('YYYY-MM-DD');
                    maxDate = endDate.format('YYYY-MM-DD');
                } else if (props.granularity === GRANULARITY.MONTHLY || props.granularity === GRANULARITY.ACCUMULATED) {
                    minDate = endDate.subtract(11, 'month').format('YYYY-MM-DD');
                    maxDate = endDate.format('YYYY-MM-DD');
                }
                return { minDate, maxDate };
            }),
            toDate: computed<DateOption>(() => {
                let minDate;
                let maxDate;
                if (!state.startDate.length) return { minDate, maxDate };

                const startDate = dayjs.utc(state.startDate[0]);
                if (props.granularity === GRANULARITY.DAILY) {
                    minDate = startDate.format('YYYY-MM-DD');
                    maxDate = startDate.add(1, 'month').format('YYYY-MM-DD');
                } else if (props.granularity === GRANULARITY.MONTHLY || props.granularity === GRANULARITY.ACCUMULATED) {
                    minDate = startDate.format('YYYY-MM-DD');
                    maxDate = startDate.add(11, 'month').format('YYYY-MM-DD');
                }
                return { minDate, maxDate };
            }),
            settingsByGranularity: computed<CustomRangeModalSettings>(() => {
                if (!props.granularity) return {};
                const customRangeModalSettingsByGranularity = {
                    [GRANULARITY.ACCUMULATED]: {
                        helpTextFrom: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HELP_TEXT.UP_TO_LAST_12_MONTHS'),
                        dateType: DATA_TYPE.yearToDate,
                    },
                    [GRANULARITY.DAILY]: {
                        helpTextTo: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HELP_TEXT.UP_TO_31_DAYS'),
                        dateType: DATA_TYPE.yearToDate,
                    },
                    [GRANULARITY.MONTHLY]: {
                        helpTextFrom: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HELP_TEXT.UP_TO_LAST_12_MONTHS'),
                        dateType: DATA_TYPE.yearToMonth,
                    },
                };
                return customRangeModalSettingsByGranularity[props.granularity];
            }),
        });
        const handleConfirm = () => {
            state.proxyVisible = false;
            const period = {
                start: state.startDate[0],
                end: state.endDate[0],
            };
            emit('confirm', period);
        };
        return {
            ...toRefs(state),
            handleConfirm,
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
