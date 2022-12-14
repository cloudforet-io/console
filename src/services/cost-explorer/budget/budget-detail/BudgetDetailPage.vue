<template>
    <div>
        <p-breadcrumbs :routes="routeState.route" />
        <section class="page-title-wrapper">
            <p-page-title v-if="!loading" child :title="budgetData.name"
                          @goBack="$router.go(-1)"
            >
                <template #extra>
                    <div class="title-button-group">
                        <p-icon-button name="ic_trashcan" @click="handleClickDelete" />
                    </div>
                </template>
            </p-page-title>
        </section>
        <section class="content">
            <budget-detail-info class="summary" :currency="currency" :currency-rates="currencyRates" />
            <budget-summary :budget-loading="loading" :currency="currency" :currency-rates="currencyRates"
                            class="summary"
            />
            <budget-notifications class="alert" />
            <!--            <budget-billing-admin class="budget" />-->
        </section>
        <budget-delete-modal v-if="!loading"
                             :visible="checkDeleteState.visible"
                             :budget-id="budgetData.budget_id"
                             :budget-name="budgetData.name"
                             @update="handleUpdateDelete"
                             @confirm="handleConfirmDelete"
        />
    </div>
</template>

<script lang="ts">
import { PBreadcrumbs, PPageTitle, PIconButton } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import BudgetDetailInfo
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-info/BudgetDetailInfo.vue';
import BudgetSummary
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-summary/BudgetSummary.vue';
import BudgetNotifications
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-notifications/BudgetNotifications.vue';
import { registerServiceStore } from '@/common/composables/register-service-store';
import BudgetStoreModule from '@/services/cost-explorer/budget/store';
import { BudgetStoreState } from '@/services/cost-explorer/budget/store/type';
import { store } from '@/store';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import BudgetDeleteModal from '@/services/cost-explorer/budget/budget-detail/modules/BudgetDeleteModal.vue';
import { BudgetData } from '@/services/cost-explorer/budget/type';
import { SpaceRouter } from '@/router';

export default {
    name: 'BudgetDetailPage',
    components: {
        BudgetDeleteModal,
        PBreadcrumbs,
        PPageTitle,
        PIconButton,
        BudgetDetailInfo,
        BudgetSummary,
        BudgetNotifications,
    },
    props: {
        budgetId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        registerServiceStore<BudgetStoreState>('budget', BudgetStoreModule);

        const state = reactive({
            loading: true,
            budgetData: computed<BudgetData>(() => store.state.service.budget.budgetData),
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
        });
        const routeState = reactive({
            route: computed(() => ([
                { name: 'Cost Explorer', to: { name: COST_EXPLORER_ROUTE._NAME } },
                { name: 'Budget', to: { name: COST_EXPLORER_ROUTE.BUDGET._NAME } },
                { name: state.budgetData?.name, to: { name: '' } },
            ])),
        });

        const checkDeleteState = reactive({
            visible: false,
        });

        const handleClickDelete = () => {
            checkDeleteState.visible = true;
        };

        const handleUpdateDelete = (visible) => {
            checkDeleteState.visible = visible;
        };

        const handleConfirmDelete = () => {
            SpaceRouter.router.push({ name: COST_EXPLORER_ROUTE.BUDGET._NAME });
        };

        (async () => {
            state.loading = true;
            try {
                await Promise.allSettled([
                    store.dispatch('service/budget/getBudgetData', props.budgetId),
                    store.dispatch('service/budget/getBudgetUsageData', props.budgetId),
                ]);
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        })();

        return {
            ...toRefs(state),
            routeState,
            checkDeleteState,
            handleClickDelete,
            handleUpdateDelete,
            handleConfirmDelete,
        };
    },
};
</script>

<style lang="postcss" scoped>
.content {
    @apply flex flex-col;
    gap: 1rem;
    .summary {
        flex-grow: 1;
    }
    .summary-chart {
        flex-grow: 2;
    }
    .alert {
        flex-grow: 1;
    }
}
.title-button-group {
    display: flex;
    width: 100%;
    padding-left: 0.5rem;
}
</style>
