<script lang="ts" setup>

import { PDatetimePicker, PFieldGroup } from '@spaceone/design-system';
import dayjs from 'dayjs';
import {
    computed,
    reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { useFormValidator } from '@/common/composables/form-validator';

import type { Period } from '@/services/cost-explorer/type';

interface Props {
    disableValidation?: boolean;
}

withDefaults(defineProps<Props>(), {
    disableValidation: false,
});
const emit = defineEmits<{(e:'update', value: Period, valid: boolean): void}>();
const { t } = useI18n();

const {
    forms: { startDates, endDates },
    invalidTexts, invalidState, isAllValid,
    setForm,
} = useFormValidator({
    startDates: [] as string[],
    endDates: [] as string[],
}, {
    startDates: (value: string[]) => (value[0] ? '' : t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.REQUIRED_START_MONTH')),
    endDates: (value: string[]) => (value[0] ? '' : t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.REQUIRED_END_MONTH')),
});

const handleUpdateSelectedDates = (target: 'startDates'|'endDates', value) => {
    if (target === 'startDates') {
        setForm(target, value);
    } else {
        setForm(target, value);
    }
};

const state = reactive({
    period: computed<Period>(() => ({
        start: dayjs.utc(startDates.value[0]).locale('en').format('YYYY-MM'),
        end: dayjs.utc(endDates.value[0]).locale('en').format('YYYY-MM'),
    })),
    startMaxDate: computed(() => {
        const end = endDates.value[0];
        return end ? dayjs.utc(end).format('YYYY-MM') : undefined;
    }),
    endMinDate: computed(() => {
        const start = startDates.value[0];
        return start ? dayjs.utc(start).format('YYYY-MM') : undefined;
    }),
});

watch(() => state.period, (period) => {
    emit('update', period, isAllValid.value);
});

</script>

<template>
    <div class="budget-period-select">
        <p-field-group class="period-select"
                       :label="t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_START_MONTH')"
                       :invalid-text="invalidTexts.startDates"
                       :invalid="!disableValidation && invalidState.startDates"
                       required
        >
            <p-datetime-picker :selected-dates="startDates"
                               data-type="yearToMonth"
                               :invalid="!disableValidation && invalidState.startDates"
                               :max-date="state.startMaxDate"
                               @update:selected-dates="handleUpdateSelectedDates('startDates', $event)"
            />
        </p-field-group>
        <p-field-group class="period-select"
                       :label="t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_END_MONTH')"
                       :invalid-text="invalidTexts.endDates"
                       :invalid="!disableValidation && invalidState.endDates"
                       required
        >
            <p-datetime-picker :selected-dates="endDates"
                               data-type="yearToMonth"
                               :invalid="!disableValidation && invalidState.endDates"
                               :min-date="startDates[0] || ''"
                               @update:selected-dates="handleUpdateSelectedDates('endDates', $event)"
            />
        </p-field-group>
    </div>
</template>

<style lang="postcss" scoped>
.budget-period-select {
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
