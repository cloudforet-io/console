<script lang="ts" setup>
import {
    PFieldGroup, PPaneLayout, PHeading, PTextInput,
} from '@spaceone/design-system';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import { useFormValidator } from '@/common/composables/form-validator';

import BudgetCostTypeSelect from '@/services/cost-explorer/budget/modules/BudgetCostTypeSelect.vue';
import BudgetTargetSelect from '@/services/cost-explorer/budget/modules/BudgetTargetSelect.vue';
import type { BudgetData, BudgetBaseInfo } from '@/services/cost-explorer/budget/type';


type CostTypes = BudgetData['cost_types'];

interface Props {
    budgetId?: string;
}

defineProps<Props>();
const emit = defineEmits<{(e: 'update', value: BudgetBaseInfo, valid: boolean): void}>();
const { t } = useI18n();

const {
    forms: {
        name,
    },
    setForm,
    invalidState,
    invalidTexts,
    isAllValid: isNameValid,
} = useFormValidator({
    name: '',
}, {
    name(value: string) { return value.trim().length ? '' : t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REQUIRED_NAME'); },
});

const state = reactive({
    target: undefined as string|undefined,
    isTargetValid: false,
    costTypes: undefined as CostTypes|undefined,
    isCostTypesValid: false,
    budgetInfo: computed<BudgetBaseInfo>(() => {
        const isProjectGroup = state.target?.startsWith('pg-');

        const budgetInfo: BudgetBaseInfo = {
            name: name.value,
            [isProjectGroup ? 'project_group_id' : 'project_id']: state.target,
            cost_types: state.costTypes,
        };

        return budgetInfo;
    }),
    isAllValid: computed<boolean>(() => isNameValid.value && state.isCostTypesValid && state.isTargetValid),
});

const handleUpdateTarget = (target: string|undefined, isValid: boolean) => {
    state.target = target;
    state.isTargetValid = isValid;
};

const handleUpdateCostTypes = (costTypes: CostTypes|undefined, isValid: boolean) => {
    state.costTypes = costTypes;
    state.isCostTypesValid = isValid;
};

watch([() => state.budgetInfo, () => state.isAllValid], ([budgetInfo, isAllValid]) => {
    emit('update', budgetInfo, isAllValid);
});

</script>

<template>
    <p-pane-layout>
        <p-heading heading-type="sub"
                   :title="t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.BASE_INFORMATION')"
        />
        <div class="p-4">
            <p-field-group :label="t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
                           class="base-info-field"
            >
                <p-text-input :value="name"
                              :invalid="invalidState.name"
                              @update:value="setForm('name', $event)"
                />
            </p-field-group>

            <budget-target-select @update="handleUpdateTarget" />

            <budget-cost-type-select @update="handleUpdateCostTypes" />
        </div>
    </p-pane-layout>
</template>

<style lang="postcss" scoped>
.p-heading {
    margin-bottom: 0.5rem;
}

.base-info-field {
    width: 30rem;
    .p-text-input {
        width: 100%;
    }
}

@screen mobile {
    .base-info-field {
        width: 100%;
    }
}
</style>
