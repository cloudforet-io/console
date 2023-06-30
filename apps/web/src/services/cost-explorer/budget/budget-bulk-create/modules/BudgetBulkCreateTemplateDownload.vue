<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldGroup, PButton, PPaneLayout, PHeading, PRadio,
} from '@spaceone/design-system';
import {
    reactive,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetCostTypeSelect from '@/services/cost-explorer/budget/modules/BudgetCostTypeSelect.vue';
import BudgetPeriodSelect from '@/services/cost-explorer/budget/modules/BudgetPeriodSelect.vue';
import BudgetTargetSelect from '@/services/cost-explorer/budget/modules/BudgetTargetSelect.vue';
import type { BudgetData, BudgetTimeUnit } from '@/services/cost-explorer/budget/type';
import type { Period } from '@/services/cost-explorer/type';

type CostTypes = BudgetData['cost_types'];
interface BudgetBulkCreateTemplateSource {
    start?: string;
    end?: string;
    time_unit?: BudgetTimeUnit;
    cost_types?: CostTypes;
    projects?: string[];
}
const store = useStore();
const { t } = useI18n();

const state = reactive({
    period: {} as Period,
    budgetPlans: [
        { type: 'TOTAL', name: 'Total Amount', description: 'Create a budget that tracks against total amount' },
        { type: 'MONTHLY', name: 'Monthly Planning', description: 'Specific your budgeted amount for each budget period' },
    ],
    selectedPlan: 'TOTAL' as BudgetTimeUnit,
    costTypes: undefined as CostTypes|undefined,
    projects: [] as string[],
});

const handleUpdatePeriodSelect = (period: Period) => {
    state.period = period;
};

const handleUpdateTarget = (projects: string[]) => {
    state.projects = projects;
};

const handleUpdateCostTypes = (costTypes?: CostTypes) => {
    state.costTypes = costTypes;
};

const downloadTemplate = async (param) => {
    await store.dispatch('display/startLoading', { loadingMessage: t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD') });
    try {
        const blob = await SpaceConnector.client.costAnalysis.budget.create.template(param, { responseType: 'blob' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.target = '_self';
        link.download = 'budget_bulk_create_template';
        link.click();
        link.remove();
        setTimeout(() => {
            store.dispatch('display/finishLoading', { successMessage: 'Successfully Downloaded 1 Template' });
        }, 500);
    } catch (e) {
        setTimeout(() => {
            ErrorHandler.handleRequestError(e, t('COMMON.EXCEL.ALT_E_DOWNLOAD'));
        });
    } finally {
        store.dispatch('display/finishLoading', { errorMessage: t('COMMON.EXCEL.ALT_E_DOWNLOAD') });
    }
};

const handleClickTemplateDownload = async (includeValues: boolean) => {
    let source: BudgetBulkCreateTemplateSource|undefined;
    if (includeValues) {
        source = {
            start: state.period.start,
            end: state.period.end,
            time_unit: state.selectedPlan,
            cost_types: state.costTypes,
            projects: state.projects,
        };
    }
    await downloadTemplate({
        include_values: includeValues,
        source,
    });
};

</script>

<template>
    <p-pane-layout>
        <p-heading heading-type="sub"
                   title="Download Template"
        >
            <template #extra>
                (optional)
            </template>
        </p-heading>

        <p-button style-type="primary"
                  icon-left="ic_download"
                  @click="handleClickTemplateDownload(true)"
        >
            Template with the following values
        </p-button>
        OR
        <p-button icon-left="ic_download"
                  style-type="tertiary"
                  @click="handleClickTemplateDownload(false)"
        >
            Template with headers only
        </p-button>

        <budget-period-select disable-validation
                              @update="handleUpdatePeriodSelect"
        />

        <p-field-group label="How to budget"
                       required
        >
            <p-radio v-for="({type, name, description}) in state.budgetPlans"
                     :key="type"
                     v-model="state.selectedPlan"
                     :value="type"
                     class="plan"
            >
                <span class="name">{{ name }}</span>
                <span class="desc">{{ description }}</span>
            </p-radio>
        </p-field-group>

        <budget-target-select disable-validation
                              multi-selectable
                              @update="handleUpdateTarget"
        />

        <budget-cost-type-select disable-validation
                                 @update="handleUpdateCostTypes"
        />
    </p-pane-layout>
</template>
