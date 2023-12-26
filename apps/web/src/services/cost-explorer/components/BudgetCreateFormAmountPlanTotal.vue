<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PFieldGroup, PTextInput } from '@spaceone/design-system';

import { getNumberFromString, numberFormatter } from '@cloudforet/utils';

import { i18n } from '@/translations';

import { CURRENCY_SYMBOL } from '@/store/modules/settings/config';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap, DataSourceItems } from '@/store/reference/cost-data-source-reference-store';

import { useFormValidator } from '@/common/composables/form-validator';


interface Props {
    dataSourceId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    dataSourceId: undefined,
});
const emit = defineEmits<{(e: 'update', amount: number|undefined, isAllvalid: boolean): void; }>();


const {
    forms: { amount },
    invalidTexts, invalidState, setForm, isAllValid,
} = useFormValidator({
    amount: undefined as number|undefined,
}, {
    amount: (val) => (val ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.REQUIRED_AMOUNT')),
});

const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceStore.getters.costDataSource),
});
const state = reactive({
    formattedAmount: computed<string>({
        get: () => numberFormatter(amount.value),
        set: (val: string) => { setForm('amount', getNumberFromString(val)); },
    }),
    currencyText: computed<string>(() => {
        if (!props.dataSourceId) return '';
        const dataSourceItem:DataSourceItems = storeState.costDataSource[props.dataSourceId];
        const currency = dataSourceItem?.data.plugin_info.metadata?.currency ?? CURRENCY_SYMBOL.USD;
        return CURRENCY_SYMBOL[currency];
    }),
});

watch(() => amount.value, (value) => {
    emit('update', value, isAllValid.value);
});

</script>

<template>
    <div class="budget-create-form-amount-plan-total">
        <p-field-group required
                       :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.AMOUNT_PLAN.LABEL_BUDGET_TOTAL')"
                       :invalid-text="invalidTexts.amount"
                       :invalid="invalidState.amount"
        >
            <p-text-input v-model="state.formattedAmount"
                          placeholder="1,000"
                          :invalid="invalidState.amount"
            >
                <template #right-extra>
                    ({{ state.currencyText }})
                </template>
            </p-text-input>
        </p-field-group>
        <slot name="last-3-months" />
    </div>
</template>

<style>
.p-text-input {
    width: 28.5rem;
}

@screen mobile {
    .p-text-input {
        width: 100%;
    }
}
</style>
