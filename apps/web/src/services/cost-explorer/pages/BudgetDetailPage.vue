<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PLink } from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

import type { BudgetModel } from '@/schema/cost-analysis/budget/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import ScopedNotification from '@/common/components/scoped-notification/ScopedNotification.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import BudgetDetailHeading from '@/services/cost-explorer/components/BudgetDetailHeading.vue';
import BudgetDetailInfo from '@/services/cost-explorer/components/BudgetDetailInfo.vue';
import BudgetDetailNotifications
    from '@/services/cost-explorer/components/BudgetDetailNotifications.vue';
import BudgetDetailSummary
    from '@/services/cost-explorer/components/BudgetDetailSummary.vue';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';


interface Props {
    budgetId: string;
}
const props = withDefaults(defineProps<Props>(), {
    budgetId: '',
});

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;
const state = reactive({
    loading: true,
    hasManagePermission: useManagePermissionState(),
    budgetData: computed<BudgetModel|null>(() => budgetPageState.budgetData),
    showNotification: computed<boolean>(() => !!(state.budgetData?.resource_group === 'WORKSPACE' && store.getters['user/isDomainAdmin'])),
});

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
        <portal to="page-top-notification">
            <scoped-notification v-if="state.showNotification"
                                 :title="i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.PAGE_NOTIFICATION')"
                                 title-icon="ic_info-circle"
                                 type="info"
                                 hide-header-close-button
            >
                <template #right>
                    <p-link class="notification-link"
                            :action-icon="ACTION_ICON.INTERNAL_LINK"
                            highlight
                            new-tab
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.VIEW_IN_ADMIN_MODE') }}
                    </p-link>
                </template>
            </scoped-notification>
        </portal>
        <budget-detail-heading :loading="state.loading" />
        <section class="content">
            <budget-detail-info class="summary" />
            <budget-detail-summary
                :budget-loading="state.loading"
                class="summary"
            />
            <budget-detail-notifications class="alert"
                                         :manage-disabled="!state.hasManagePermission"
                                         :currency="state.budgetData?.currency"
            />
        </section>
    </div>
</template>


<style lang="postcss" scoped>
.content {
    @apply flex flex-col;
    gap: 1rem;
    .summary {
        flex-grow: 1;
    }
    .alert {
        flex-grow: 1;
    }
}
.notification-link {
    @apply text-label-md;
}
</style>
