<template>
    <section class="budget-detail-summary">
        <p-pane-layout class="summary-card">
            <span v-if="!loading" class="summary-title">
                {{ budgetData.time_unit === BUDGET_TIME_UNIT.TOTAL ? 'Total Budgeted Amount' : 'Start ~ End Months' }}
                <span v-if="budgetData.time_unit === BUDGET_TIME_UNIT.TOTAL" class="font-normal">(Period)</span>
            </span>
            <div v-if="!loading">
                <p v-if="budgetData.time_unit === BUDGET_TIME_UNIT.TOTAL" class="summary-content">
                    <b>{{ currencyMoneyFormatter(budgetData.limit, currency, currencyRates) }}</b>
                    ({{ budgetData.start }} ~ {{ budgetData.end }})
                </p>
                <p v-else class="summary-content">
                    {{ budgetData.start }} ~ {{ budgetData.end }}
                </p>
            </div>
        </p-pane-layout>
        <p-pane-layout class="summary-card">
            <span class="summary-title">
                Target
            </span>
            <p v-if="!loading" class="summary-content">
                <p-anchor v-if="budgetData.project_group_id || budgetData.project_id"
                          :to="referenceRouter(
                              (budgetData.project_id || budgetData.project_group_id),
                              { resource_type: budgetData.project_id ? 'identity.Project' : 'identity.ProjectGroup' })"
                >
                    {{ getTargetLabel() }}
                </p-anchor>
            </p>
        </p-pane-layout>
        <p-pane-layout class="summary-card">
            <span class="summary-title">
                Cost Type
                <span v-if="!loading" class="text-gray-900 font-normal">{{ costTypeMap[costTypeKey] || 'All' }}</span>
            </span>
            <p v-if="!loading" class="summary-content cost-type">
                <span class="cost-type-content">{{ processedCostTypeValue }}</span>
                <span ref="buttonRef" class="view-all" @click="handleClickViewAll">View all</span>
                <budget-cost-type-balloon v-if="balloonVisible"
                                          class="cost-type-balloon"
                                          :balloon-width="balloonWidth"
                                          :balloon-visible.sync="balloonVisible"
                                          :cost-type-key="costTypeKey"
                                          :cost-type-value="processedCostTypeValue"
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
import { BUDGET_TIME_UNIT, BudgetData, CostType } from '@/services/billing/cost-management/budget/type';
import BudgetCostTypeBalloon
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-info/BudgetCostTypeBalloon.vue';
import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import { CURRENCY } from '@/store/modules/display/config';

const getKeyOfCostType = (costType: Record<CostType, string[]|null>) => Object.keys(costType).filter(k => (costType[k] !== null))[0];
const getValueOfCostType = (costType: Record<CostType, string[]|null>, costTypeKey: string) => costType[costTypeKey];

const costTypeMap = {
    region_code: 'Region',
    service_account_id: 'Service Account',
    provider: 'Provider',
    product: 'Product',
};

export default {
    name: 'BudgetDetailInfo',
    components: {
        BudgetCostTypeBalloon,
        PPaneLayout,
        PAnchor,
    },
    props: {
        currency: {
            type: String,
            default: CURRENCY.USD,
        },
        currencyRates: {
            type: Object,
            default: () => ({}),
        },
    },
    setup() {
        const state = reactive({
            projects: computed(() => store.state.resource.project.items),
            projectGroups: computed(() => store.state.resource.projectGroup.items),
            budgetData: computed<BudgetData>(() => store.state.service.budget.budgetData),
            costTypeKey: computed(() => (state.budgetData ? getKeyOfCostType(state.budgetData?.cost_types) : '')),
            costTypeValue: computed(() => (state.budgetData ? getValueOfCostType(state.budgetData?.cost_types, state.costTypeKey) : [])),
            processedCostTypeValue: computed(() => state.costTypeValue?.join(', ') || 'All'),
            buttonRef: null as HTMLElement | null,
            balloonWidth: 0,
            balloonVisible: false,
            loading: computed(() => store.getters['service/budget/isBudgetLoading']),
        });

        const handleClickViewAll = () => {
            const rect = state.buttonRef.getBoundingClientRect();
            const width = rect.width;
            state.balloonWidth = width;
            state.balloonVisible = true;
        };

        const getTargetLabel = () => {
            if (state.budgetData?.project_id) return state.projects[state.budgetData.project_id]?.label ?? '';
            if (state.budgetData?.project_group_id) return state.projectGroups[state.budgetData.project_group_id]?.label ?? '';
            return 'No Item';
        };


        return {
            ...toRefs(state),
            referenceRouter,
            handleClickViewAll,
            currencyMoneyFormatter,
            getTargetLabel,
            costTypeMap,
            BUDGET_TIME_UNIT,
        };
    },
};
</script>

<style lang="postcss" scoped>
.budget-detail-summary {
    @apply flex;
    column-gap: 1rem;
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

    @screen tablet {
        @apply flex-col;
        row-gap: 0.5rem;
        .summary-card {
            width: auto;
        }
    }
}
</style>
