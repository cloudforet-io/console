<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import dayjs from 'dayjs';

import { PButtonModal, PDatetimePicker, PFieldGroup } from '@cloudforet/mirinae';
import type { DATA_TYPE } from '@cloudforet/mirinae/types/inputs/datetime-picker/type';

import { useProxyValue } from '@/common/composables/proxy-state';


const DATE_3_YEARS_TO_MONTHS = 36;
const DATE_1_YEAR_TO_MONTHS = 12;
interface DateSetting {
    minDate?: string;
    maxDate?: string;
}
interface Props {
    visible: boolean;
    datetimePickerDataType?: DATA_TYPE;
    start?: string;
    end?: string;
    /* Restricted mode applies a limit of '12 months' for month type, and '1 month' for day type */
    useRestrictedMode?: boolean;
    disableFuture?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    datetimePickerDataType: 'yearToMonth',
    start: undefined,
    end: undefined,
    useRestrictedMode: false,
    disableFuture: false,
});

const emit = defineEmits<{(event: 'update:visible', visible: boolean): void;
    (event: 'confirm', start: string, end: string): void;
    (event: 'cancel'): void;
}>();

const today = dayjs.utc();
const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    invalid: computed(() => {
        if (!state.startDates.length || !state.endDates.length) return true;
        const timeUnit = props.datetimePickerDataType === 'yearToDate' ? 'day' : 'month';
        const startDate = dayjs.utc(state.startDates[0]);
        const endDate = dayjs.utc(state.endDates[0]);

        const diffUnit = props.datetimePickerDataType === 'yearToDate' ? 'month' : 'year';
        return startDate.isAfter(endDate, timeUnit) || endDate.diff(startDate, diffUnit) >= 1;
    }),
    startDates: [] as string[],
    endDates: [] as string[],
    dateFormat: computed<string>(() => (props.datetimePickerDataType === 'yearToDate' ? 'YYYY-MM-DD' : 'YYYY-MM')),
    startDateSetting: computed<DateSetting|undefined>(() => {
        if (!props.useRestrictedMode) return undefined;
        const minDate = today.subtract(DATE_3_YEARS_TO_MONTHS - 1, 'month').format(state.dateFormat);
        const maxDate = today.format(state.dateFormat);
        return { minDate, maxDate };
    }),
    endDateSetting: computed<DateSetting|undefined>(() => {
        if (!state.startDates.length) return undefined;
        if (!props.useRestrictedMode) {
            const startDate = dayjs.utc(state.startDates[0]);
            const minDate = startDate.format(state.dateFormat);
            return { minDate };
        }

        let maxDate: string;
        const startDate = dayjs.utc(state.startDates[0]);
        const minDate = startDate.format(state.dateFormat);

        let maxRawData = startDate.add(DATE_1_YEAR_TO_MONTHS - 1, 'month');
        if (props.datetimePickerDataType === 'yearToDate') {
            maxRawData = startDate.add(1, 'month').subtract(1, 'day');
        }

        if (props.disableFuture && maxRawData.isAfter(dayjs.utc())) {
            maxDate = dayjs.utc().format(state.dateFormat);
        } else maxDate = maxRawData.format(state.dateFormat);
        return { minDate, maxDate };
    }),
});

/* Event */
const handleUpdateVisible = (visible: boolean) => {
    state.proxyVisible = visible;
};
const handleConfirm = () => {
    state.proxyVisible = false;
    const start = dayjs.utc(state.startDates[0]).format(state.dateFormat);
    const end = dayjs.utc(state.endDates[0]).format(state.dateFormat);
    emit('confirm', start, end);
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
        if (props.start) state.startDates = [props.start];
        else state.startDates = [];

        if (props.end) state.endDates = [props.end];
        else state.endDates = [];
    } else {
        state.startDates = [];
        state.endDates = [];
    }
});

</script>

<template>
    <p-button-modal :header-title="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.CUSTOM_RANGE')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :visible="state.proxyVisible"
                    :disabled="state.invalid"
                    @confirm="handleConfirm"
                    @update:visible="handleUpdateVisible"
                    @close="$emit('cancel')"
                    @cancel="$emit('cancel')"
    >
        <template #body>
            <p-field-group class="period-select"
                           :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.FROM')"
                           :help-text="props.useRestrictedMode ? $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HELP_TEXT.UP_TO_LAST_12_MONTHS') : ''"
                           required
            >
                <p-datetime-picker class="datetime-picker"
                                   :selected-dates="state.startDates"
                                   :invalid="!!state.startDates.length && !!state.endDates.length && state.invalid"
                                   :min-date="state.startDateSetting?.minDate"
                                   :max-date="state.startDateSetting?.maxDate"
                                   :data-type="props.datetimePickerDataType"
                                   @update:selected-dates="handleUpdateSelectedDates('start', $event)"
                />
            </p-field-group>
            <p-field-group class="period-select"
                           :label="$t('BILLING.COST_MANAGEMENT.DASHBOARD.FORM.TO')"
                           required
            >
                <p-datetime-picker class="datetime-picker"
                                   :selected-dates="state.endDates"
                                   :invalid="!!state.startDates.length && !!state.endDates.length && state.invalid"
                                   :min-date="state.endDateSetting?.minDate"
                                   :max-date="state.endDateSetting?.maxDate"
                                   :data-type="props.datetimePickerDataType"
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
