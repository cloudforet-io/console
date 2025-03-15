<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import dayjs from 'dayjs';

import {
    PButtonModal, PFieldGroup, PDatetimePicker, useProxyValue,
} from '@cloudforet/mirinae';

import type { Period } from '@/services/cost-explorer/types/cost-explorer-query-type';

interface DateOption {
    minDate?: string;
    maxDate?: string;
}

const props = withDefaults(defineProps<{
    visible: boolean;
    selectedDateRange?: Period;
}>(), {
    visible: false,
    selectedDateRange: () => ({}),
});

const emit = defineEmits<{(event: 'update:visible', visible: boolean): void;
    (event: 'confirm', period: Period): void;
}>();

const state = reactive({
    proxyVisible: useProxyValue('visible', props, emit),
    dateType: 'yearToMonth',
    invalid: computed(() => !state.selectedDates.length),
    selectedDates: [] as string[],
    dateLimitSetting: computed<DateOption>(() => {
        const minDate = dayjs.utc().subtract(3, 'year').format('YYYY-MM');
        const maxDate = dayjs.utc().format('YYYY-MM');
        return { minDate, maxDate };
    }),
});

const handleUpdateVisible = (visible: boolean) => {
    state.proxyVisible = visible;
};
const handleUpdateSelectedDates = (selectedDates: string[]) => {
    if (!selectedDates.length) return;
    const originDates = state.selectedDates;

    if (dayjs.utc(originDates[0]).isSame(dayjs.utc(selectedDates[0]), 'month')) return;
    state.selectedDates = selectedDates;
};
const handleConfirm = () => {
    state.proxyVisible = false;
    const period: Period = {};
    period.start = dayjs.utc(state.selectedDates[0]).format('YYYY-MM');
    period.end = dayjs.utc(state.selectedDates[0]).endOf('month').format('YYYY-MM');
    emit('confirm', period);
};

watch(() => props.visible, (visible) => {
    if (visible) {
        if (props.selectedDateRange?.start) {
            state.selectedDates = [props.selectedDateRange?.start];
        } else {
            state.selectedDates = [dayjs.utc().format('YYYY-MM')];
        }
    } else {
        state.selectedDates = [];
    }
});

</script>

<template>
    <p-button-modal :header-title="$t('DASHBOARDS.DETAIL.SELECT_MONTH')"
                    centered
                    size="sm"
                    fade
                    backdrop
                    :visible.sync="state.proxyVisible"
                    :disable="state.invalid"
                    @update:visible="handleUpdateVisible"
                    @confirm="handleConfirm"
    >
        <template #body>
            <p-field-group class="period-select"
                           :label="$t('DASHBOARDS.DETAIL.CUSTOM_DATE_MODAL_MONTH')"
                           required
            >
                <p-datetime-picker class="datetime-picker"
                                   :data-type="state.dateType"
                                   :selected-dates="state.selectedDates"
                                   :invalid="state.invalid"
                                   :min-date="state.dateLimitSetting.minDate"
                                   :max-date="state.dateLimitSetting.maxDate"
                                   @update:selected-dates="handleUpdateSelectedDates"
                />
            </p-field-group>
        </template>
        <template #confirm-button>
            {{ $t('DASHBOARDS.DETAIL.APPLY') }}
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
