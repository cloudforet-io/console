<template>
    <div>
        <section class="page-title-wrapper">
            <p-heading :show-back-button="!loading"
                       :title="loading ? '' : budgetData.name"
                       @click-back-button="$router.go(-1)"
            >
                <template v-if="!loading"
                          #title-right-extra
                >
                    <div class="title-button-group">
                        <p-icon-button name="ic_trashcan"
                                       :disabled="!hasManagePermission"
                                       @click="handleClickDelete"
                        />
                    </div>
                </template>
            </p-heading>
        </section>
        <section class="content">
            <budget-detail-info class="summary"
                                :currency="currency"
                                :currency-rates="currencyRates"
            />
            <budget-summary :budget-loading="loading"
                            :currency="currency"
                            :currency-rates="currencyRates"
                            class="summary"
            />
            <budget-notifications class="alert"
                                  :manage-disabled="!hasManagePermission"
            />
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
import { computed, reactive, toRefs } from 'vue';

import { PHeading, PIconButton } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import BudgetDetailInfo
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-info/BudgetDetailInfo.vue';
import BudgetNotifications
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-notifications/BudgetNotifications.vue';
import BudgetSummary
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-summary/BudgetSummary.vue';
import BudgetDeleteModal from '@/services/cost-explorer/budget/budget-detail/modules/BudgetDeleteModal.vue';
import type { BudgetData } from '@/services/cost-explorer/budget/type';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { costExplorerStore } from '@/services/cost-explorer/store';

export default {
    name: 'BudgetDetailPage',
    components: {
        BudgetDeleteModal,
        PHeading,
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
        const state = reactive({
            loading: true,
            budgetData: computed<Partial<BudgetData>|null>(() => costExplorerStore.state.budget.budgetData),
            currency: computed(() => store.state.display.currency),
            currencyRates: computed(() => store.state.display.currencyRates),
            hasManagePermission: useManagePermissionState(),
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
                    costExplorerStore.dispatch('budget/getBudgetData', props.budgetId),
                    costExplorerStore.dispatch('budget/getBudgetUsageData', props.budgetId),
                ]);
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        })();

        return {
            ...toRefs(state),
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
    display: inline-flex;
}
</style>
