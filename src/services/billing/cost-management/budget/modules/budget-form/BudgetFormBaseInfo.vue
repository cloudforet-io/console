<template>
    <p-pane-layout>
        <p-panel-top>
            {{ $t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.BASE_INFORMATION') }}
        </p-panel-top>
        <div class="p-4">
            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_NAME')"
                           required
            >
                <p-text-input v-model="name" />
            </p-field-group>

            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_TARGET')"
                           required
            >
                <project-select-dropdown :selected-project-ids="selectedTargets" />
            </p-field-group>

            <p-field-group :label="$t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.LABEL_COST_TYPE')"
                           required
            >
                <p-radio v-for="(costTypeLabel, costTypeKey) in costTypeItems" :key="costTypeKey"
                         v-model="selectedCostType" :value="costTypeKey"
                >
                    {{ costTypeLabel }}
                </p-radio>
            </p-field-group>
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import {
    computed,
    reactive, toRefs,
} from '@vue/composition-api';
import {
    PFieldGroup, PPaneLayout, PPanelTop, PRadio, PTextInput,
} from '@spaceone/design-system';

import { i18n } from '@/translations';
import { TranslateResult } from 'vue-i18n';
import { BudgetCostType, BudgetTarget } from '@/services/billing/cost-management/budget/type';
import ProjectSelectDropdown from '@/common/modules/project/ProjectSelectDropdown.vue';
import { store } from '@/store';


type BudgetTargetItems = Record<BudgetTarget, TranslateResult>
type BudgetCostTypes = Record<BudgetCostType, TranslateResult>


export default {
    name: 'BudgetFormBaseInfo',
    components: {
        ProjectSelectDropdown,
        PPanelTop,
        PPaneLayout,
        PFieldGroup,
        PTextInput,
        PRadio,
    },
    props: {
        budgetId: {
            type: String,
            default: undefined,
        },
    },
    setup() {
        const state = reactive({
            name: '',
            selectedTargets: [],
            selectedCostType: 'all' as BudgetCostType,
            targetItems: computed<BudgetTargetItems>(() => ({
                PROJECT: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.PROJECT'),
                PROJECT_GROUP: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.PROJECT_GROUP'),
            })),
            costTypeItems: computed<BudgetCostTypes>(() => ({
                all: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.ALL'),
                provider: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.PROVIDER'),
                region: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.REGION'),
                account: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.ACCOUNT'),
                product: i18n.t('BILLING.COST_MANAGEMENT.BUDGET.FORM.BASE_INFO.PRODUCT'),
            })),
        });

        /* Init */
        (async () => {
            await store.dispatch('resource/project/load');
        })();

        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
