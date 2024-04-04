<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { PButtonModal, PDatetimePicker, PFieldGroup } from '@spaceone/design-system';
import type { DATA_TYPE } from '@spaceone/design-system/types/inputs/datetime-picker/type';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';

import { useProxyValue } from '@/common/composables/proxy-state';


interface DateOption {
    minDate?: string;
    maxDate?: string;
}
interface Props {
    visible: boolean;
    datetimePickerDataType?: DATA_TYPE;
    start?: string;
    end?: string;
    startDateSetting?: DateOption;
    endDateSetting?: DateOption;
    hideHelpText?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
    datetimePickerDataType: 'yearToDate',
    hideHelpText: false,
    start: undefined,
    end: undefined,
    startDateSetting: () => ({}),
    endDateSetting: () => ({}),
});

const emit = defineEmits<{(event: 'update:visible', visible: boolean): void;
    (event: 'confirm', start: string, end: string): void;
    (event: 'cancel'): void;
}>();

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
    endDateSetting: computed<DateOption>(() => {
        if (!isEmpty(props.endDateSetting)) return props.endDateSetting;
        if (!state.startDates.length) return {};

        const startDate = dayjs.utc(state.startDates[0]);
        const minDate = startDate.format('YYYY-MM');
        return { minDate };
    }),
});

/* Event */
const handleUpdateVisible = (visible: boolean) => {
    state.proxyVisible = visible;
};
const handleConfirm = () => {
    state.proxyVisible = false;
    // const period: Period = {};
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
                           :help-text="props.hideHelpText ? '': $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.HELP_TEXT.UP_TO_LAST_12_MONTHS')"
                           required
            >
                <p-datetime-picker class="datetime-picker"
                                   :selected-dates="state.startDates"
                                   :invalid="!!state.startDates.length && !!state.endDates.length && state.invalid"
                                   :min-date="props.startDateSetting?.minDate"
                                   :max-date="props.startDateSetting?.maxDate"
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
