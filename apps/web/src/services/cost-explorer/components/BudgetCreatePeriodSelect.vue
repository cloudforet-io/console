<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { PDatetimePicker, PFieldGroup } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import type { Period } from '@/services/cost-explorer/types/cost-explorer-query-type';


interface DateOption {
    minDate?: string;
    maxDate?: string;
}

const emit = defineEmits<{(e: 'update', period: Period, isValid: boolean): void; }>();
const {
    forms: { startDates, endDates },
    invalidTexts, invalidState, isAllValid,
    setForm,
} = useFormValidator({
    startDates: [] as string[],
    endDates: [] as string[],
}, {
    startDates: (value: string[]) => (value[0] ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.REQUIRED_START_MONTH')),
    endDates: (value: string[]) => (value[0] ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.REQUIRED_END_MONTH')),
});

const state = reactive({
    period: computed<Period>(() => ({
        start: dayjs.utc(startDates.value[0]).locale('en').format('YYYY-MM'),
        end: dayjs.utc(endDates.value[0]).locale('en').format('YYYY-MM'),
    })),
    endDateSetting: computed<DateOption>(() => {
        let minDate;
        let maxDate;
        if (!startDates.value.length) return { minDate, maxDate };

        const startDate = dayjs.utc(startDates.value[0]);
        minDate = startDate.format('YYYY-MM');
        maxDate = startDate.add(11, 'month').format('YYYY-MM');
        return { minDate, maxDate };
    }),
});


/* Event */
const handleUpdateSelectedDates = (target: 'startDates'|'endDates', value) => {
    if (target === 'startDates') {
        setForm(target, value);
        if (endDates.value.length) setForm('endDates', []);
    } else {
        setForm(target, value);
    }
};


/* Watcher */
watch(() => state.period, (period) => {
    emit('update', period, isAllValid.value);
});
</script>

<template>
    <div class="budget-create-period-select">
        <p-field-group class="period-select"
                       :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_START_MONTH')"
                       :invalid-text="invalidTexts.startDates"
                       :invalid="invalidState.startDates"
                       required
        >
            <p-datetime-picker :selected-dates="startDates"
                               data-type="yearToMonth"
                               :invalid="!!startDates.length && !!endDates.length && invalidState.startDates"
                               @update:selectedDates="handleUpdateSelectedDates('startDates', $event)"
            />
        </p-field-group>
        <p-field-group class="period-select"
                       :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_END_MONTH')"
                       :invalid-text="invalidTexts.endDates"
                       :invalid="invalidState.endDates"
                       required
        >
            <p-datetime-picker :selected-dates="endDates"
                               data-type="yearToMonth"
                               :invalid="!!startDates.length && !!endDates.length && invalidState.endDates"
                               :min-date="state.endDateSetting.minDate"
                               :max-date="state.endDateSetting.maxDate"
                               @update:selectedDates="handleUpdateSelectedDates('endDates', $event)"
            />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.budget-create-period-select {
    display: flex;
    flex-wrap: wrap;
    .period-select {
        margin-right: 1rem;
    }

    @screen mobile {
        .period-select {
            width: 100%;
        }
    }
}
</style>
