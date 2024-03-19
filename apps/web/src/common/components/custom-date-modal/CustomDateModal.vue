<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { PButtonModal, PDatetimePicker, PFieldGroup } from '@spaceone/design-system';
import type { DATA_TYPE } from '@spaceone/design-system/types/inputs/datetime-picker/type';
import dayjs from 'dayjs';

import { useProxyValue } from '@/common/composables/proxy-state';


interface DateSetting {
    minDate?: string;
    maxDate?: string;
}
interface Props {
    visible: boolean;
    datetimePickerDataType?: DATA_TYPE;
    start?: string;
    end?: string;
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
        return startDate.isAfter(endDate, timeUnit) || endDate.diff(startDate, 'year') >= 1;
    }),
    startDates: [] as string[],
    endDates: [] as string[],
    startDateSetting: computed<DateSetting|undefined>(() => {
        if (!props.useRestrictedMode) return undefined;
        if (props.datetimePickerDataType === 'yearToMonth') {
            const minDate = today.subtract(35, 'month').format('YYYY-MM');
            const maxDate = today.format('YYYY-MM');
            return { minDate, maxDate };
        }
        if (props.datetimePickerDataType === 'yearToDate') {
            const minDate = today.subtract(1, 'month').format('YYYY-MM-DD');
            const maxDate = today.format('YYYY-MM-DD');
            return { minDate, maxDate };
        }
        return undefined;
    }),
    endDateSetting: computed<DateSetting|undefined>(() => {
        if (!state.startDates.length) return undefined;
        const _dateFormat = props.datetimePickerDataType === 'yearToDate' ? 'YYYY-MM-DD' : 'YYYY-MM';
        if (!props.useRestrictedMode) {
            const startDate = dayjs.utc(state.startDates[0]);
            const minDate = startDate.format(_dateFormat);
            return { minDate };
        }

        let maxDate: string;
        const startDate = dayjs.utc(state.startDates[0]);
        const minDate = startDate.format(_dateFormat);

        let maxRawData = startDate.add(11, 'month');
        if (props.datetimePickerDataType === 'yearToDate') {
            maxRawData = startDate.add(1, 'month');
        }

        if (props.disableFuture && maxRawData.isAfter(dayjs.utc())) {
            maxDate = dayjs.utc().format(_dateFormat);
        } else maxDate = maxRawData.format(_dateFormat);
        return { minDate, maxDate };
    }),
});

/* Event */
const handleUpdateVisible = (visible: boolean) => {
    state.proxyVisible = visible;
};
const handleConfirm = () => {
    state.proxyVisible = false;
    const start = dayjs.utc(state.startDates[0]).format('YYYY-MM');
    const end = dayjs.utc(state.endDates[0]).endOf('month').format('YYYY-MM');
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
                                   data-type="yearToMonth"
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
