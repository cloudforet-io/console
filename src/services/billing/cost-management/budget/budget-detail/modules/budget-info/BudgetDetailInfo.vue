<template>
    <section class="budget-detail-summary">
        <p-pane-layout class="summary-card">
            <span class="summary-title">
                Total Budgeted Amount
                <span class="font-normal">(Period)</span>
            </span>
            <p class="summary-content">
                <b>${{ budgetData.total_usage_usd_cost }}</b> ({{ budgetData.start }} ~ {{ budgetData.end }})
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
                <span class="cost-type-content">{{ processedCostTypeValue }}</span>
                <span ref="buttonRef" class="view-all" @click="handleClickViewAll">View all</span>
                <budget-cost-type-balloon v-if="balloonVisible"
                                          class="cost-type-balloon"
                                          :balloon-width="balloonWidth"
                                          :balloon-visible.sync="balloonVisible"
                                          :cost-type-key="costTypeKey"
                                          :cost-type-value="costTypeValue"
                />
            </p>
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import { PPaneLayout, PAnchor } from '@spaceone/design-system';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { store } from '@/store';
import { BudgetData, CostType } from '@/services/billing/cost-management/budget/type';
import BudgetCostTypeBalloon
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-info/BudgetCostTypeBalloon.vue';

const getKeyOfCostType = (costType: Record<CostType, string[]|null>) => Object.keys(costType).filter(k => (costType[k] !== null))[0];
const getValueOfCostType = (costType: Record<CostType, string[]|null>, costTypeKey: string) => costType[costTypeKey];

export default {
    name: 'BudgetDetailSummary',
    components: {
        BudgetCostTypeBalloon,
        PPaneLayout,
        PAnchor,
    },
    setup() {
        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
            budgetData: computed<BudgetData>(() => store.state.service.budget.budgetData),
            costTypeKey: computed(() => getKeyOfCostType(state.budgetData.cost_types)),
            costTypeValue: computed(() => getValueOfCostType(state.budgetData.cost_types, state.costTypeKey)),
            processedCostTypeValue: computed(() => state.costTypeValue.join(', ')),
            buttonRef: null as HTMLElement | null,
            balloonWidth: 0,
            balloonVisible: false,
        });

        const handleClickViewAll = () => {
            const rect = state.buttonRef.getBoundingClientRect();
            const width = rect.width;
            state.balloonWidth = width;
            state.balloonVisible = true;
        };


        return {
            ...toRefs(state),
            referenceRouter,
            handleClickViewAll,
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
            position: relative;
            .cost-type-content {
                @apply truncate;
                font-size: 0.875rem;
                line-height: 130%;
            }
            .view-all {
                @apply text-blue-600 cursor-pointer;
                font-size: 0.875rem;
                margin-left: 0.5rem;
                flex-shrink: 0;
            }
        }
    }
}
</style>
