<template>
    <div class="budget-period-select">
        <p-field-group class="period-select"
                       :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_START_MONTH')"
                       :invalid-text="invalidTexts.startDates"
                       :invalid="!disableValidation && invalidState.startDates"
                       required
        >
            <p-datetime-picker :selected-dates="startDates"
                               data-type="yearToMonth"
                               :invalid="!disableValidation && invalidState.startDates"
                               @update:selectedDates="handleUpdateSelectedDates('startDates', $event)"
            />
        </p-field-group>
        <p-field-group class="period-select"
                       :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_END_MONTH')"
                       :invalid-text="invalidTexts.endDates"
                       :invalid="!disableValidation && invalidState.endDates"
                       required
        >
            <p-datetime-picker :selected-dates="endDates"
                               data-type="yearToMonth"
                               :invalid="!disableValidation && invalidState.endDates"
                               :min-date="endMinDate"
                               @update:selectedDates="handleUpdateSelectedDates('endDates', $event)"
            />
        </p-field-group>
    </div>
</template>

<script lang="ts">

import {
    computed, defineComponent,
    reactive, toRefs, watch,
} from 'vue';

import { PDatetimePicker, PFieldGroup } from '@spaceone/design-system';
import dayjs from 'dayjs';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import type { Period } from '@/services/cost-explorer/type';

interface Props {
    disableValidation?: boolean;
}
export default defineComponent<Props>({
    name: 'BudgetPeriodSelect',
    components: {
        PFieldGroup,
        PDatetimePicker: PDatetimePicker as any,
    },
    props: {
        disableValidation: {
            type: Boolean,
            default: false,
        },
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
            startDates: (value: string[]) => (value[0] ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.REQUIRED_START_MONTH')),
            endDates: (value: string[]) => (value[0] ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.REQUIRED_END_MONTH')),
        });

        const handleUpdateSelectedDates = (target: 'startDates'|'endDates', value) => {
            if (target === 'startDates') {
                setForm(target, value);
                if (endDates.value.length) setForm('endDates', []);
            } else {
                setForm(target, value);
            }
        };

        const state = reactive({
            period: computed<Period>(() => ({
                start: dayjs.utc(startDates.value[0]).locale('en').format('YYYY-MM'),
                end: dayjs.utc(endDates.value[0]).locale('en').format('YYYY-MM'),
            })),
            endMinDate: computed(() => {
                const start = startDates.value[0];
                return start ? dayjs.utc(start).format('YYYY-MM') : undefined;
            }),
        });

        watch(() => state.period, (period) => {
            emit('update', period, isAllValid.value);
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
});
</script>

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
