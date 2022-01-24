<template>
    <p-button-modal
        :header-title="headerTitle"
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
                                   :min-date="settingsByGranularity.autoDateLimitDay ? calculatedMinDateFrom : settingsByGranularity.minDate"
                                   :max-date="settingsByGranularity.autoDateLimitDay ? calculatedMaxDateFrom : settingsByGranularity.maxDate"
                />
            </p-field-group>
            <p-field-group class="period-select"
                           :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.TO')"
                           :help-text="settingsByGranularity.helpTextTo"
                           required
            >
                <p-datetime-picker class="datetime-picker" :data-type="granularity ? settingsByGranularity.dateType : datetimePickerDataType" :selected-dates.sync="endDate"
                                   :invalid="!!startDate.length && !!endDate.length && invalid"
                                   :min-date="settingsByGranularity.autoDateLimitDay ? calculatedMinDateTo : settingsByGranularity.minDate"
                                   :max-date="settingsByGranularity.autoDateLimitDay ? calculatedMaxDateTo : settingsByGranularity.maxDate"
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
    autoDateLimitDay?: number | undefined;
    helpTextFrom?: TranslateResult | undefined;
    helpTextTo?: TranslateResult | undefined;
    minDate?: string | undefined;
    maxDate?: string | undefined;
    dateType?: DATA_TYPE;
}

const today = dayjs.utc();
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
        headerTitle: {
            type: String,
            default: '',
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
            settingsByGranularity: computed<CustomRangeModalSettings>(() => {
                if (!props.granularity) return {};
                const customRangeModalSettingsByGranularity = {
                    [GRANULARITY.ACCUMULATED]: {
                        helpTextFrom: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HELP_TEXT.UP_TO_LAST_12_MONTHS'),
                        minDate: today.subtract(1, 'year').add(1, 'day').format('YYYY-MM-DD'),
                        maxDate: today.format('YYYY-MM-DD'),
                        dateType: DATA_TYPE.yearToDate,
                    },
                    [GRANULARITY.DAILY]: {
                        helpTextTo: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HELP_TEXT.UP_TO_31_DAYS'),
                        autoDateLimitDay: 31,
                        minDate: undefined,
                        maxDate: undefined,
                        dateType: DATA_TYPE.yearToDate,
                    },
                    [GRANULARITY.MONTHLY]: {
                        helpTextFrom: i18n.t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HELP_TEXT.UP_TO_LAST_12_MONTHS'),
                        minDate: today.subtract(1, 'year').format('YYYY-MM-DD'),
                        maxDate: today.format('YYYY-MM-DD'),
                        dateType: DATA_TYPE.yearToMonth,
                    },
                };
                return customRangeModalSettingsByGranularity[props.granularity];
            }),
            calculatedMinDateFrom: computed(() => {
                if (state.endDate.length) return dayjs.utc(state.endDate[0]).subtract(state.settingsByGranularity.autoDateLimitDay - 1, 'day').format('YYYY-MM-DD');
                return undefined;
            }),
            calculatedMaxDateFrom: computed(() => {
                if (state.endDate.length) return dayjs.utc(state.endDate[0]).add(state.settingsByGranularity.autoDateLimitDay - 1, 'day').format('YYYY-MM-DD');
                return undefined;
            }),
            calculatedMinDateTo: computed(() => {
                if (state.startDate.length) return dayjs.utc(state.startDate[0]).subtract(state.settingsByGranularity.autoDateLimitDay - 1, 'day').format('YYYY-MM-DD');
                return undefined;
            }),
            calculatedMaxDateTo: computed(() => {
                if (state.startDate.length) return dayjs.utc(state.startDate[0]).add(state.settingsByGranularity.autoDateLimitDay - 1, 'day').format('YYYY-MM-DD');
                return undefined;
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
