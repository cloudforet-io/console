<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { PHeading, PIconButton } from '@spaceone/design-system';

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

interface Props {
    budgetId: string;
}
const props = withDefaults(defineProps<Props>(), {
    budgetId: '',
});

const router = useRouter();

const budgetPageStore = useBudgetPageStore();
const budgetPageState = budgetPageStore.$state;

const state = reactive({
    loading: true,
    currency: computed(() => store.state.settings.currency),
    currencyRates: computed(() => store.state.settings.currencyRates),
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
    router.push({ name: COST_EXPLORER_ROUTE.BUDGET._NAME });
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

</script>

<template>
    <div>
        <section class="page-title-wrapper">
            <p-heading :show-back-button="!state.loading"
                       :title="state.loading ? '' : budgetPageState.budgetData?.name"
                       @click-back-button="$router.go(-1)"
            >
                <template v-if="!state.loading"
                          #title-right-extra
                >
                    <div class="title-button-group">
                        <p-icon-button name="ic_delete"
                                       :disabled="!state.hasManagePermission"
                                       @click="handleClickDelete"
                        />
                    </div>
                </template>
            </p-heading>
        </section>
        <section class="content">
            <budget-detail-info class="summary"
                                :currency="state.currency"
                                :currency-rates="state.currencyRates"
            />
            <budget-summary :budget-loading="state.loading"
                            :currency="state.currency"
                            :currency-rates="state.currencyRates"
                            class="summary"
            />
            <budget-notifications class="alert"
                                  :manage-disabled="!state.hasManagePermission"
            />
            <!--            <budget-billing-admin class="budget" />-->
        </section>
        <budget-delete-modal v-if="!state.loading"
                             :visible="checkDeleteState.visible"
                             @update="handleUpdateDelete"
                             @confirm="handleConfirmDelete"
        />
    </div>
</template>


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
