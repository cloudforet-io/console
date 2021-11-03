<template>
    <section class="budget-detail-summary">
        <p-pane-layout class="summary-card">
            <span class="summary-title">
                Total Budgeted Amount
                <span class="font-normal">(Period)</span>
            </span>
            <p class="summary-content">
                <b>${{ budgetData.total_usd_cost }}</b> ({{ budgetData.start }} ~ {{ budgetData.end }})
            </p>
        </p-pane-layout>
        <p-pane-layout class="summary-card">
            <span class="summary-title">
                Target
            </span>
            <p class="summary-content">
                <p-anchor :to="referenceRouter(
                    budgetData.project_id,
                    { resource_type: 'identity.Project' })"
                >
                    {{ projects[budgetData.project_id] ? projects[budgetData.project_id].label : budgetData.project_id }}
                </p-anchor>
            </p>
        </p-pane-layout>
        <p-pane-layout class="summary-card">
            <span class="summary-title">
                Cost Type
                <span class="text-gray-900 font-normal">{{ costTypeKey }}</span>
            </span>
            <p class="summary-content cost-type">
                <span v-for="item in costTypeValue" :key="item" class="cost-type-content">{{ item }}</span>
                <span class="view-all">View all</span>
            </p>
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import cloneDeep from 'lodash/cloneDeep';
import { PPaneLayout, PAnchor } from '@spaceone/design-system';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';
import { BudgetData, CostType } from '@/services/billing/cost-management/budget/type';

export default {
    name: 'BudgetDetailSummary',
    components: {
        PPaneLayout,
        PAnchor,
    },
    setup() {
        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
            budgetData: computed<BudgetData>(() => store.state.service.budget.budgetData),
            costTypeKey: '',
            costTypeValue: [],
        });

        const getKeyOfCostType = (costType: Record<CostType, string[]>) => Object.keys(costType).filter(k => (costType[k] !== null))[0];

        const getCostTypeData = () => {
            const costType = cloneDeep(state.budgetData.cost_types);
            state.costTypeKey = getKeyOfCostType(costType);
            state.costTypeValue = costType[state.costTypeKey];
        };

        (() => {
            getCostTypeData();
        })();
        return {
            ...toRefs(state),
            referenceRouter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.budget-detail-summary {
    @apply flex justify-between;
    .summary-card {
        width: 33%;
        min-height: 4.875rem;
        padding: 1rem 1rem;
    }
    .summary-title {
        @apply text-gray-500 font-bold;
        font-size: 0.875rem;
        line-height: 130%;
    }
    .summary-content {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        line-height: 120%;
        &.cost-type {
            @apply flex justify-between;
            .cost-type-content {
                @apply truncate;
                font-size: 0.875rem;
                line-height: 130%;
            }
            .view-all {
                @apply text-blue-600;
                font-size: 0.875rem;
                margin-left: 0.5rem;
                flex-shrink: 0;
            }
        }
    }
}
</style>
