<script setup lang="ts">
import {
    computed, defineEmits, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PPaneLayout, PHeading, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import type { BudgetModel } from '@/services/cost-explorer/budget/model';
import BudgetCostTypeSelect from '@/services/cost-explorer/budget/shared/BudgetCostTypeSelect.vue';
import BudgetDataSourceSelect from '@/services/cost-explorer/budget/shared/BudgetDataSourceSelect.vue';
import BudgetTargetSelect from '@/services/cost-explorer/budget/shared/BudgetTargetSelect.vue';

export type BudgetBaseInfo = Pick<BudgetModel, 'name'|'provider_filter'|'project_group_id'|'project_id'|'data_source_id'>;

type ProviderFilter = BudgetModel['provider_filter'];

const emit = defineEmits<{(e: 'update', budgetInfo:BudgetBaseInfo, isAllvalid: boolean): void; }>();

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
    name(value: string) { return value.trim().length ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REQUIRED_NAME'); },
});

const state = reactive({
    target: undefined as string|undefined,
    isTargetValid: false,
    providerFilter: undefined as ProviderFilter|undefined,
    dataSourceId: undefined as string|undefined,
    isCostTypesValid: false,
    budgetInfo: computed<BudgetBaseInfo>(() => {
        const isProjectGroup = state.target?.startsWith('pg-');

        const budgetInfo: BudgetBaseInfo = {
            name: name.value,
            [isProjectGroup ? 'project_group_id' : 'project_id']: state.target,
            provider_filter: state.providerFilter,
            data_source_id: state.dataSourceId,
        };

        return budgetInfo;
    }),
    isAllValid: computed<boolean>(() => isNameValid.value && state.isCostTypesValid && state.isTargetValid),
});

const handleUpdateDataSource = (dataSourceId: string) => {
    state.dataSourceId = dataSourceId;
};
const handleUpdateTarget = (target: string|undefined, isValid: boolean) => {
    state.target = target;
    state.isTargetValid = isValid;
};

const handleUpdateProviderFilter = (providerFilter: ProviderFilter|undefined, isValid: boolean) => {
    state.providerFilter = providerFilter;
    state.isCostTypesValid = isValid;
};

watch([() => state.budgetInfo, () => state.isAllValid], ([budgetInfo, isAllValid]) => {
    emit('update', budgetInfo, isAllValid);
});

</script>

<template>
    <p-pane-layout>
        <p-heading heading-type="sub"
                   :title="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.BASE_INFORMATION')"
        />
        <div class="p-4">
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_NAME')"
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
            <budget-data-source-select @update="handleUpdateDataSource" />

            <budget-target-select @update="handleUpdateTarget" />

            <budget-cost-type-select @update="handleUpdateProviderFilter" />
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
