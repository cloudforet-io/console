<script lang="ts" setup>
import { PButtonModal, PDatetimePicker, PFieldGroup } from '@spaceone/design-system';
import type { DATA_TYPE } from '@spaceone/design-system/types/inputs/datetime-picker/type';
import dayjs from 'dayjs';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import type { Period } from '@/services/cost-explorer/type';

interface DateOption {
    minDate?: string;
    maxDate?: string;
}

export interface Period {
    start?: string;
    end?: string;
}

const props = withDefaults(defineProps<{
    visible: boolean;
    datetimePickerDataType?: DATA_TYPE;
    selectedDateRange?: Period;
}>(), {
    visible: false,
    datetimePickerDataType: 'yearToDate',
    selectedDateRange: () => ({}),
});

const emit = defineEmits<{(event: 'update:visible', visible: boolean): void;
    (event: 'confirm', period: Period): void;
}>();
const { t } = useI18n();

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
    startDateSetting: computed<DateOption>(() => {
        const today = dayjs.utc();
        const minDate = today.subtract(35, 'month').format('YYYY-MM');
        const maxDate = today.format('YYYY-MM');
        return { minDate, maxDate };
    }),
    endDateSetting: computed<DateOption>(() => {
        let minDate;
        let maxDate;
        if (!state.startDates.length) return { minDate, maxDate };

        const startDate = dayjs.utc(state.startDates[0]);
        minDate = startDate.format('YYYY-MM');
        const maxRawData = startDate.add(11, 'month');
        if (maxRawData.isAfter(dayjs.utc())) {
            maxDate = dayjs.utc().format('YYYY-MM');
        } else maxDate = maxRawData.format('YYYY-MM');
        return { minDate, maxDate };
    }),
});

/* Event */
const handleUpdateVisible = (visible: boolean) => {
    state.proxyVisible = visible;
};
const handleConfirm = () => {
    state.proxyVisible = false;
    const period: Period = {};
    period.start = dayjs.utc(state.startDates[0]).format('YYYY-MM');
    period.end = dayjs.utc(state.endDates[0]).endOf('month').format('YYYY-MM');
    emit('confirm', period);
};
const handleUpdateSelectedDates = (type: 'start'|'end', selectedDates: string[]) => {
    if (!selectedDates.length) return;

    const originDates = type === 'start' ? state.startDates : state.endDates;
    if (dayjs.utc(originDates[0]).isSame(dayjs.utc(selectedDates[0]), 'day')) return;

    if (type === 'start') {
        state.startDates = selectedDates;
        state.endDates = [];
    } else {
        state.endDates = selectedDates;
    }
};

watch(() => props.visible, (visible) => {
    if (visible) {
        if (props.selectedDateRange?.start) {
            state.startDates = [props.selectedDateRange?.start];
        } else {
            state.startDates = [];
        }
        if (props.selectedDateRange?.end) {
            state.endDates = [props.selectedDateRange?.end];
        } else {
            state.endDates = [];
        }
    } else {
        state.startDates = [];
        state.endDates = [];
    }
});

</script>

<template>
    <p-button-modal :header-title="t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.CUSTOM_RANGE')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :visible="state.proxyVisible"
                    :disabled="state.invalid"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
    >
        <template #body>
            <p-field-group class="period-select"
                           :label="t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.FROM')"
                           :help-text="t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HELP_TEXT.UP_TO_LAST_12_MONTHS')"
                           required
            >
                <p-datetime-picker class="datetime-picker"
                                   :selected-dates="state.startDates"
                                   :invalid="!!state.startDates.length && !!state.endDates.length && state.invalid"
                                   :min-date="state.startDateSetting.minDate"
                                   :max-date="state.startDateSetting.maxDate"
                                   data-type="yearToMonth"
                                   @update:selected-dates="handleUpdateSelectedDates('start', $event)"
                />
            </p-field-group>
            <p-field-group class="period-select"
                           :label="t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.TO')"
                           required
            >
                <p-datetime-picker class="datetime-picker"
                                   :selected-dates="state.endDates"
                                   :invalid="!!state.startDates.length && !!state.endDates.length && state.invalid"
                                   :min-date="state.endDateSetting.minDate"
                                   :max-date="state.endDateSetting.maxDate"
                                   data-type="yearToMonth"
                                   @update:selected-dates="handleUpdateSelectedDates('end', $event)"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style scoped lang="postcss">
.period-select {
    .datetime-picker {
        width: 100%;
    }
}
</style>
