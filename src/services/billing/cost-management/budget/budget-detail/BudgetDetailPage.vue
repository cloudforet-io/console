<template>
    <general-page-layout>
        <p-breadcrumbs :routes="routeState.route" />
        <section class="page-title-wrapper">
            <p-page-title v-if="!loading" child :title="budgetData.name"
                          @goBack="$router.go(-1)"
            >
                <template #extra>
                    <div class="title-button-group">
                        <p-icon-button name="ic_trashcan" @click="handleDelete" />
                        <p-icon-button name="ic_setting" />
                    </div>
                </template>
            </p-page-title>
        </section>
        <section class="content">
            <budget-detail-info v-if="!loading" class="summary" />
            <budget-summary v-if="!loading" class="summary" />
            <budget-notifications v-if="!loading" class="alert" />
        </section>
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      @confirm="deleteBudget"
        />
    </general-page-layout>
</template>

<script lang="ts">
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import { PBreadcrumbs, PPageTitle, PIconButton } from '@spaceone/design-system';
import { computed, reactive, toRefs } from '@vue/composition-api';
import BudgetDetailInfo
    from '@/services/billing/cost-management/budget/budget-detail/modules/BudgetDetailInfo.vue';
import BudgetSummary
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-summary/BudgetSummary.vue';
import BudgetNotifications
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-notifications/BudgetNotifications.vue';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import { registerServiceStore } from '@/common/composables/register-service-store';
import BudgetStoreModule from '@/services/billing/cost-management/budget/store';
import { BudgetStoreState } from '@/services/billing/cost-management/budget/store/type';
import { store } from '@/store';
import ErrorHandler from '@/common/composables/error/errorHandler';

export default {
    name: 'BudgetDetailPage',
    components: {
        GeneralPageLayout,
        PBreadcrumbs,
        PPageTitle,
        PIconButton,
        BudgetDetailInfo,
        BudgetSummary,
        BudgetNotifications,
        DeleteModal,
    },
    setup() {
        registerServiceStore<BudgetStoreState>('budget', BudgetStoreModule);

        const state = reactive({
            loading: true,
            budgetData: computed(() => store.state.service.budget.budgetData),
        });
        const routeState = reactive({
            route: computed(() => ([
                { name: 'Billing', to: { name: '' } },
                { name: 'Cost Management', to: { name: '' } },
                { name: 'Budget', to: { name: '' } },
                { name: 'Budget Name', to: { name: '' } },
            ])),
        });

        const checkDeleteState = reactive({
            visible: false,
            headerTitle: 'Are you sure you want to delete the budget?',
            // loading: true,
        });
        const handleDelete = () => {
            checkDeleteState.visible = true;
        };
        const deleteBudget = async () => {
            try {
                console.log('Successfully deleted budget');
            } catch (e) {
                console.error(e);
            } finally {
                checkDeleteState.visible = false;
            }
        };

        (async () => {
            state.loading = true;
            try {
                await Promise.allSettled([
                    store.dispatch('service/budget/getBudgetData', 'budget-df7f905dbc8f'),
                    store.dispatch('resource/project/load'),
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
            handleDelete,
            deleteBudget,
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
