<template>
    <div class="budget-form-amount-plan-period-select">
        <p-field-group class="period-select"
                       :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_START_MONTH')"
                       :invalid-text="invalidTexts.startDates"
                       :invalid="invalidState.startDates"
                       required
        >
            <p-datetime-picker :selected-dates="startDates" data-type="yearToMonth"
                               :invalid="invalidState.startDates"
                               :max-date="endDates[0] || ''"
                               @update:selectedDates="handleUpdateSelectedDates('startDates', $event)"
            />
        </p-field-group>
        <p-field-group class="period-select"
                       :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_END_MONTH')"
                       :invalid-text="invalidTexts.endDates"
                       :invalid="invalidState.endDates"
                       required
        >
            <p-datetime-picker :selected-dates="endDates" data-type="yearToMonth"
                               :invalid="invalidState.endDates"
                               :min-date="startDates[0] || ''"
                               @update:selectedDates="handleUpdateSelectedDates('endDates', $event)"
            />
        </p-field-group>
    </div>
</template>

<script lang="ts">
import {
    reactive, toRefs, watchEffect,
} from '@vue/composition-api';

import { PDatetimePicker, PFieldGroup } from '@spaceone/design-system';
import { useFormValidator } from '@/common/composables/form-validator';
import dayjs from 'dayjs';

export default {
    name: 'BudgetFormAmountPlanPeriodSelect',
    components: {
        PFieldGroup,
        PDatetimePicker,
    },
    setup(props, { emit }) {
        const {
            forms: { startDates, endDates },
            invalidTexts, invalidState, isAllValid,
            setForm,
        } = useFormValidator({
            startDates: [] as string[],
            endDates: [] as string[],
        }, {
            startDates: (value: string[]) => (value.length > 0 ? '' : 'Required'),
            endDates: (value: string[]) => (value.length > 0 ? '' : 'Required'),
        });

        const handleUpdateSelectedDates = (target: 'startDates'|'endDates', value) => {
            if (target === 'startDates') {
                let start = value[0];
                const end = endDates.value[0];

                if (start && end && dayjs(end).isSameOrBefore(dayjs(start))) {
                    start = undefined;
                }

                setForm(target, [start]);
            } else {
                let end = value[0];
                const start = startDates.value[0];

                if (start && end && dayjs(start).isSameOrAfter(dayjs(end))) {
                    end = undefined;
                }

                setForm(target, [end]);
            }
        };

        const state = reactive({});

        watchEffect(() => {
            if (!isAllValid.value) return;

            const period = { start: startDates.value[0], end: endDates.value[0] };
            emit('update', period);
        });

        return {
            startDates,
            endDates,
            invalidTexts,
            invalidState,
            ...toRefs(state),
            setForm,
            handleUpdateSelectedDates,
        };
    },
};
</script>

<style lang="postcss" scoped>
.budget-form-amount-plan-period-select {
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
