<script setup lang="ts">
import {
    computed, defineEmits, reactive, watch,
} from 'vue';

import {
    PFieldGroup, PPaneLayout, PHeading, PTextInput,
} from '@spaceone/design-system';

import type { BudgetModel } from '@/schema/cost-analysis/budget/model';
import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import BudgetCreateDataSourceSelect from '@/services/cost-explorer/components/BudgetCreateDataSourceSelect.vue';
import BudgetCreateProviderSelect from '@/services/cost-explorer/components/BudgetCreateProviderSelect.vue';
import BudgetCreateTargetSelect from '@/services/cost-explorer/components/BudgetCreateTargetSelect.vue';



type BudgetBaseInfo = Pick<BudgetModel, 'name'|'provider_filter'|'project_group_id'|'project_id'|'data_source_id'>;

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
            <budget-create-data-source-select @update="handleUpdateDataSource" />

            <budget-create-target-select @update="handleUpdateTarget" />

            <budget-create-provider-select @update="handleUpdateProviderFilter" />
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
