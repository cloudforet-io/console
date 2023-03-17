<template>
    <div>
        <section class="page-title-wrapper">
            <p-heading :show-back-button="!loading"
                       :title="loading ? '' : budgetPageState.budgetData?.name"
                       @click-back-button="$router.go(-1)"
            >
                <template v-if="!loading"
                          #title-right-extra
                >
                    <div class="title-button-group">
                        <p-icon-button name="ic_delete"
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
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/route-config';
import { useBudgetPageStore } from '@/services/cost-explorer/store/budget-page-store';


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
        const budgetPageStore = useBudgetPageStore();
        const budgetPageState = budgetPageStore.$state;

        const state = reactive({
            loading: true,
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
                    budgetPageStore.getBudgetData(props.budgetId),
                    budgetPageStore.getBudgetUsageData(props.budgetId),
                ]);
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        })();

        return {
            ...toRefs(state),
            budgetPageState,
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
