<template>
    <p-pane-layout>
        <p-panel-top>
            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.BASE_INFORMATION') }}
        </p-panel-top>
        <div class="p-4">
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_NAME')"
                           :invalid="invalidState.name"
                           :invalid-text="invalidTexts.name"
                           required
            >
                <p-text-input :value="name" :invalid="invalidState.name" @input="setForm('name', $event)" />
            </p-field-group>

            <budget-target-select :is-invalid="invalidState.selectedTargets"
                                  :invalid-text="invalidTexts.selectedTargets"
                                  :selected-targets="selectedTargets"
                                  @update="setForm('selectedTargets', $event)"
                                  @close="validate('selectedTargets')"
            />

            <budget-cost-type-select @update="handleUpdateCostTypes" />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PFieldGroup, PPaneLayout, PPanelTop, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useFormValidator } from '@/common/composables/form-validator';

import { BudgetData } from '@/services/billing/cost-management/budget/type';
import BudgetTargetSelect from '@/services/billing/cost-management/budget/modules/BudgetTargetSelect.vue';
import BudgetCostTypeSelect from '@/services/billing/cost-management/budget/modules/BudgetCostTypeSelect.vue';


export type BudgetBaseInfo = Pick<BudgetData, 'name'|'cost_types'|'project_group_id'|'project_id'>

type CostTypes = BudgetData['cost_types']

export default {
    name: 'BudgetFormBaseInfo',
    components: {
        BudgetCostTypeSelect,
        BudgetTargetSelect,
        PPanelTop,
        PPaneLayout,
        PFieldGroup,
        PTextInput,
    },
    props: {
        budgetId: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { emit }) {
        const {
            forms: {
                name, selectedTargets,
            },
            setForm,
            invalidState,
            invalidTexts,
            isAllValid: isNameAndTargetValid,
            validate,
        } = useFormValidator({
            name: '',
            selectedTargets: [] as string[],
        }, {
            name(value: string) { return value.trim().length ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REQUIRED_NAME'); },
            selectedTargets(value: string[]) { return value.length ? '' : i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REQUIRED_TARGET'); },
        });

        const state = reactive({
            costTypes: undefined as CostTypes|undefined,
            isCostTypesValid: false,
            budgetInfo: computed<BudgetBaseInfo>(() => {
                const target = selectedTargets.value[0];
                const isProjectGroup = target?.startsWith('pg-');

                const budgetInfo: BudgetBaseInfo = {
                    name: name.value,
                    [isProjectGroup ? 'project_group_id' : 'project_id']: target,
                    cost_types: state.costTypes,
                };

                return budgetInfo;
            }),
            isAllValid: computed<boolean>(() => isNameAndTargetValid.value && state.isCostTypesValid),
        });

        const handleUpdateCostTypes = (costTypes: CostTypes|undefined, isValid: boolean) => {
            state.costTypes = costTypes;
            state.isCostTypesValid = isValid;
        };


        watch([() => state.budgetInfo, () => state.isAllValid], ([budgetInfo, isAllValid]) => {
            emit('update', budgetInfo, isAllValid);
        });


        return {
            name,
            selectedTargets,
            invalidState,
            invalidTexts,
            ...toRefs(state),
            setForm,
            validate,
            handleUpdateCostTypes,
        };
    },
};
</script>
<style lang="postcss" scoped>
.p-panel-top {
    margin-bottom: 0.5rem;
}
.p-field-group {
    width: 30rem;
    .p-text-input {
        width: 100%;
    }
    .p-radio {
        margin-right: 1rem;
    }
}
.cost-type {
    .p-search-dropdown {
        margin-top: 0.5rem;
    }
}

@screen mobile {
    .p-field-group {
        width: 100%;
    }
    .cost-type::v-deep {
        display: flex;
        flex-wrap: wrap;
        .label-box {
            width: 100%;
        }
        .p-radio {
            margin-bottom: 0.25rem;
        }
    }
}
</style>
