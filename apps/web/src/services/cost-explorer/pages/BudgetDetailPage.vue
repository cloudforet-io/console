<script setup lang="ts">
import { computed, reactive } from 'vue';
import type { Location } from 'vue-router';

import { PLink } from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

import type { BudgetModel } from '@/schema/cost-analysis/budget/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import ScopedNotification from '@/common/components/scoped-notification/ScopedNotification.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetDetailHeading from '@/services/cost-explorer/components/BudgetDetailHeading.vue';
import BudgetDetailInfo from '@/services/cost-explorer/components/BudgetDetailInfo.vue';
import BudgetDetailNotifications
    from '@/services/cost-explorer/components/BudgetDetailNotifications.vue';
import BudgetDetailSummary
    from '@/services/cost-explorer/components/BudgetDetailSummary.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
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
    budgetData: computed<BudgetModel|null>(() => budgetPageState.budgetData),
    isWorkspaceTarget: computed<boolean>(() => (state.budgetData?.resource_group === 'WORKSPACE')),
    adminModeLink: computed<Location>(() => ({
        name: makeAdminRouteName(COST_EXPLORER_ROUTE.BUDGET.DETAIL._NAME),
        params: {
            budgetId: state.budgetData?.budget_id,
        },
    })),
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
            <scoped-notification v-if="state.isWorkspaceTarget"
                                 :title="i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.PAGE_NOTIFICATION')"
                                 title-icon="ic_info-circle"
                                 type="info"
                                 hide-header-close-button
            >
                <template v-if="store.getters['user/isDomainAdmin']"
                          #right
                >
                    <p-link class="notification-link"
                            :action-icon="ACTION_ICON.INTERNAL_LINK"
                            highlight
                            new-tab
                            :to="state.adminModeLink"
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
            <budget-detail-notifications v-if="!state.isWorkspaceTarget"
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
