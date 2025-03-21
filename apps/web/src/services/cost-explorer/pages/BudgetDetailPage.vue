<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { Location } from 'vue-router';

import { PLink, PScopedNotification } from '@cloudforet/mirinae';


import type { BudgetModel } from '@/api-clients/cost-analysis/budget/schema/model';
import { i18n } from '@/translations';

import { useDomainStore } from '@/store/domain/domain-store';
import { useUserStore } from '@/store/user/user-store';

import config from '@/lib/config';

import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetDetailHeading from '@/services/cost-explorer/components/BudgetDetailHeading.vue';
import BudgetDetailInfo from '@/services/cost-explorer/components/BudgetDetailInfo.vue';
import BudgetDetailNotifications
    from '@/services/cost-explorer/components/BudgetDetailNotifications.vue';
import BudgetDetailSummary
    from '@/services/cost-explorer/components/BudgetDetailSummary.vue';
import { ADMIN_COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/admin/route-constant';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';


interface Props {
    budgetId: string;
}
const props = withDefaults(defineProps<Props>(), {
    budgetId: '',
});

const domainStore = useDomainStore();
const userStore = useUserStore();
const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;
const state = reactive({
    loading: true,
    budgetData: computed<BudgetModel|null>(() => budgetPageState.budgetData),
    isWorkspaceTarget: computed<boolean>(() => (state.budgetData?.resource_group === 'WORKSPACE')),
    adminModeLink: computed<Location>(() => ({
        name: ADMIN_COST_EXPLORER_ROUTE.BUDGET.DETAIL._NAME,
        params: {
            budgetId: state.budgetData?.budget_id,
        },
    })),
    isAlertManagerVersionV2: computed<boolean>(() => (config.get('ADVANCED_SERVICE')?.alert_manager_v2 ?? []).includes(domainStore.state.domainId)),
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
            <p-scoped-notification v-if="state.isWorkspaceTarget"
                                   type="information"
                                   :title="i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.PAGE_NOTIFICATION')"
                                   icon="ic_info-circle"
            >
                <template v-if="userStore.getters.isDomainAdmin"
                          #right
                >
                    <p-link class="notification-link"
                            action-icon="internal-link"
                            highlight
                            new-tab
                            :to="state.adminModeLink"
                    >
                        {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.VIEW_IN_ADMIN_MODE') }}
                    </p-link>
                </template>
            </p-scoped-notification>
        </portal>
        <budget-detail-heading :loading="state.loading" />
        <section class="content">
            <budget-detail-info class="summary" />
            <budget-detail-summary
                :budget-loading="state.loading"
                class="summary"
            />
            <budget-detail-notifications v-if="!state.isAlertManagerVersionV2 && !state.isWorkspaceTarget"
                                         class="alert"
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
