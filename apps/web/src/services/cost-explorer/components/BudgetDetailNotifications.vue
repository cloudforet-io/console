<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PLink, PBadge, PButton, PCard, PIconButton, PSpinner,
} from '@cloudforet/mirinae';


import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { CURRENCY } from '@/store/display/constant';
import type { Currency } from '@/store/display/type';

import { currencyMoneyFormatter } from '@/lib/helper/currency-helper';
import getRandomId from '@/lib/random-id-generator';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetDetailNotificationsChannelTable
    from '@/services/cost-explorer/components/BudgetDetailNotificationsChannelTable.vue';
import BudgetDetailNotificationsConditionSettingModal
    from '@/services/cost-explorer/components/BudgetDetailNotificationsConditionSettingModal.vue';
import { useBudgetDetailPageStore } from '@/services/cost-explorer/stores/budget-detail-page-store';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';


interface Props {
    manageDisabled?: boolean;
    currency?: Currency;
}

const props = withDefaults(defineProps<Props>(), {
    manageDisabled: false,
    currency: CURRENCY.USD,
});

const budgetPageStore = useBudgetDetailPageStore();
const budgetPageState = budgetPageStore.$state;
const userWorkspaceStore = useUserWorkspaceStore();

const state = reactive({
    hasBudgetAlert: computed(() => {
        const notifications = budgetPageState.budgetData?.notifications;
        return notifications ? notifications.length > 0 : false;
    }),
    notifications: computed(() => {
        const notifications = budgetPageState.budgetData?.notifications;
        return notifications ? notifications.map((d) => ({ ...d, id: getRandomId() })) : [];
    }),
    budgetNotificationsModalVisible: false,
    budgetId: computed(() => budgetPageState.budgetData?.budget_id ?? ''),
    budgetTargetId: computed(() => budgetPageState.budgetData?.project_id || undefined),
    isBudgetLoading: computed(() => budgetPageState.loading),
});

const checkDeleteState = reactive({
    visible: false,
    headerTitle: computed(() => i18n.t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.DELETE_MODAL_TITLE')),
    loading: false,
});
const handleDelete = () => {
    checkDeleteState.visible = true;
};
const handleDeleteForm = async () => {
    try {
        checkDeleteState.loading = true;
        await budgetPageStore.updateBudgetNotifications({
            budgetId: state.budgetId,
            notifications: [],
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        checkDeleteState.loading = false;
        checkDeleteState.visible = false;
    }
};

const handleSetNotifications = () => {
    state.budgetNotificationsModalVisible = true;
};

const handleBudgetNotifications = () => {
    state.budgetNotificationsModalVisible = false;
};

</script>

<template>
    <div class="budget-detail-notifications">
        <p-card
            style-type="gray100"
            size="lg"
        >
            <template #header>
                <section class="header">
                    <span class="title">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_NOTIFICATIONS') }}</span>
                    <p-icon-button v-if="state.hasBudgetAlert"
                                   name="ic_delete"
                                   :disabled="props.manageDisabled"
                                   @click="handleDelete"
                    />
                </section>
            </template>
            <template #default>
                <section class="card-body">
                    <p-spinner v-if="state.isBudgetLoading"
                               size="xl"
                    />
                    <template v-else-if="state.hasBudgetAlert">
                        <article class="noti-condition">
                            <span class="sub-title">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.CONDITION') }}</span>
                            <span class="desc">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_NOTI_HELP_TEXT_1') }}</span>
                            <ul class="condition-list">
                                <li v-for="item in state.notifications"
                                    :key="item.id"
                                >
                                    <span class="bullet">•</span>
                                    <p-badge :style-type="item.notification_type === 'WARNING' ? 'gray500' : 'alert'"
                                             badge-type="solid-outline"
                                             class="icon"
                                    >
                                        {{ item.notification_type === 'WARNING' ? 'Warning' : 'Critical' }}
                                    </p-badge>
                                    <span v-if="item.unit !== 'PERCENT'">
                                        {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.MODAL.ACTUAL_COST') }} >
                                        <span>{{ currencyMoneyFormatter(item.threshold, { currency: props.currency }) }}</span>
                                    </span>
                                    <span v-else>% of budget > {{ item.threshold }}%</span>
                                </li>
                            </ul>
                            <p-button style-type="tertiary"
                                      icon-left="ic_settings-filled"
                                      :disabled="props.manageDisabled || !state.budgetTargetId"
                                      @click="handleSetNotifications"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.SET') }}
                            </p-button>
                        </article>
                        <article class="noti-channel">
                            <span class="sub-title">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.NOTIFICATIONS_CHANNEL') }}</span>
                            <div class="desc-wrapper">
                                <span class="desc">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_NOTI_HELP_TEXT_2') }}</span>
                                <p-link v-if="state.budgetTargetId"
                                        class="link-text"
                                        action-icon="internal-link"
                                        new-tab
                                        size="md"
                                        :text="$t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.SET_NOTIFICATION_CHANNEL')"
                                        :to="{
                                            name: PROJECT_ROUTE_V1.DETAIL.TAB.NOTIFICATIONS._NAME,
                                            params: {
                                                workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
                                                id: state.budgetTargetId
                                            }
                                        }"
                                        highlight
                                />
                            </div>
                            <budget-detail-notifications-channel-table :project-id="state.budgetTargetId" />
                        </article>
                    </template>
                    <template v-else>
                        <div class="noti-not-set">
                            <p class="desc">
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_NOTIFICATIONS_DESC') }}
                            </p>
                            <p-button style-type="tertiary"
                                      icon-left="ic_settings-filled"
                                      :disabled="props.manageDisabled || !state.budgetTargetId"
                                      @click="handleSetNotifications"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_NOTIFICATIONS_SET') }}
                            </p-button>
                        </div>
                    </template>
                </section>
            </template>
        </p-card>
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      :loading="checkDeleteState.loading"
                      @confirm="handleDeleteForm"
        />
        <budget-detail-notifications-condition-setting-modal
            v-if="state.budgetNotificationsModalVisible"
            :visible.sync="state.budgetNotificationsModalVisible"
            :budget-target-id="state.budgetTargetId"
            @confirm="handleBudgetNotifications"
        />
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-card */
:deep(.p-card) {
    .body {
        padding: 0;
    }
}
.header {
    @apply flex justify-between items-center;
}
.card-body {
    @apply flex px-4;
    padding: 1.5rem 0 2.5rem;
    .sub-title {
        @apply font-bold block;
        font-size: 1rem;
        line-height: 160%;
        margin-bottom: 0.5rem;
    }
    .desc {
        font-size: 0.875rem;
        line-height: 150%;
    }
    .noti-condition {
        width: 22rem;
        padding: 0 1rem;
        .condition-list {
            margin-top: 0.75rem;
            margin-bottom: 1rem;
            li {
                @apply inline-flex items-center;
                height: 1.625rem;
                font-size: 0.875rem;
                line-height: 150%;
            }
            .bullet {
                @apply inline-block text-center;
                width: 1.5rem;
                margin-right: 0.25rem;
            }
            .p-badge {
                margin-right: 0.25rem;
            }
        }
    }
    .noti-channel {
        flex-grow: 1;
        max-width: calc(100% - 22rem);
        .desc-wrapper {
            @apply inline-flex flex-wrap items-center;
            .desc {
                margin-right: 0.5rem;
            }
            .link-text {
                line-height: 160%;
            }
        }
        .budget-notifications-channel {
            height: auto;
            margin-top: 0.5rem;
        }
    }
    .noti-not-set {
        flex-direction: column;
        padding-right: 1.5rem;
        padding-left: 1.5rem;
        .desc {
            @apply text-gray-500;
            font-size: 0.875rem;
            line-height: 135%;
            margin-bottom: 1rem;
        }
    }
    .p-spinner {
        @apply flex w-full justify-center;
    }

    @screen tablet {
        flex-direction: column;
        row-gap: 1.5em;

        .noti-condition {
            width: 100%;
        }
        .noti-channel {
            max-width: 100%;
            .sub-title {
                padding-left: 1rem;
            }
            .desc-wrapper {
                margin-left: 1rem;
            }
        }
    }
}
</style>
