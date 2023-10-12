<template>
    <div class="budget-notifications">
        <p-card
            style-type="gray100"
            size="lg"
        >
            <template #header>
                <section class="header">
                    <span class="title">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_NOTIFICATIONS') }}</span>
                    <p-icon-button v-if="hasBudgetAlert"
                                   name="ic_delete"
                                   :disabled="manageDisabled"
                                   @click="handleDelete"
                    />
                </section>
            </template>
            <template #default>
                <section class="card-body">
                    <p-spinner v-if="isBudgetLoading"
                               size="xl"
                    />
                    <template v-else-if="hasBudgetAlert">
                        <article class="noti-condition">
                            <span class="sub-title">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.CONDITION') }}</span>
                            <span class="desc">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_NOTI_HELP_TEXT_1') }}</span>
                            <ul class="condition-list">
                                <li v-for="item in notifications"
                                    :key="item.id"
                                >
                                    <span class="bullet">•</span>
                                    <p-badge :style-type="item.notification_type === BUDGET_NOTIFICATIONS_TYPE.WARNING ? 'gray500' : 'alert'"
                                             badge-type="solid-outline"
                                             class="icon"
                                    >
                                        {{ item.notification_type === 'WARNING' ? 'Warning' : 'Critical' }}
                                    </p-badge>
                                    <span v-if="item.unit !== BUDGET_NOTIFICATIONS_UNIT.PERCENT">
                                        {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.COST_TYPE') }} > ${{ commaFormatter(item.threshold) }}
                                    </span>
                                    <span v-else>% of budget > {{ item.threshold }}%</span>
                                </li>
                            </ul>
                            <p-button style-type="tertiary"
                                      icon-left="ic_settings-filled"
                                      :disabled="manageDisabled || !budgetTargetId"
                                      @click="handleSetNotifications"
                            >
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.SET') }}
                            </p-button>
                        </article>
                        <article class="noti-channel">
                            <span class="sub-title">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.NOTIFICATIONS_CHANNEL') }}</span>
                            <div class="desc-wrapper">
                                <span class="desc">{{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_NOTI_HELP_TEXT_2') }}</span>
                                <p-link v-if="budgetTargetId"
                                        class="link-text"
                                        :action-icon="ACTION_ICON.INTERNAL_LINK"
                                        new-tab
                                        size="md"
                                        :text="$t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.SET_NOTIFICATION_CHANNEL')"
                                        :to="{
                                            name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS._NAME,
                                            params: {
                                                id: budgetTargetId
                                            }
                                        }"
                                        highlight
                                />
                            </div>
                            <budget-notifications-channel :project-id="budgetTargetId" />
                        </article>
                    </template>
                    <template v-else>
                        <div class="noti-not-set">
                            <p class="desc">
                                {{ $t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.BUDGET_NOTIFICATIONS_DESC') }}
                            </p>
                            <p-button style-type="tertiary"
                                      icon-left="ic_settings-filled"
                                      :disabled="manageDisabled || !budgetTargetId"
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
        <budget-notifications-modal v-if="budgetNotificationsModalVisible"
                                    :visible.sync="budgetNotificationsModalVisible"
                                    :budget-target-id="budgetTargetId"
                                    @confirm="handleBudgetNotifications"
        />
    </div>
</template>

<script lang="ts">

import { computed, reactive, toRefs } from 'vue';

import {
    PLink, PBadge, PButton, PCard, PIconButton, PSpinner,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

import { commaFormatter } from '@cloudforet/core-lib';

import { i18n } from '@/translations';

import { getUUID } from '@/lib/component-util/getUUID';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import BudgetNotificationsChannel
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-notifications/BudgetNotificationsChannel.vue';
import BudgetNotificationsModal
    from '@/services/cost-explorer/budget/budget-detail/modules/budget-notifications/BudgetNotificationsModal.vue';
import { BUDGET_NOTIFICATIONS_TYPE, BUDGET_NOTIFICATIONS_UNIT } from '@/services/cost-explorer/budget/type';
import { useBudgetPageStore } from '@/services/cost-explorer/store/budget-page-store';
import { PROJECT_ROUTE } from '@/services/project/route-config';

export default {
    name: 'BudgetNotifications',
    components: {
        BudgetNotificationsModal,
        BudgetNotificationsChannel,
        PCard,
        PIconButton,
        PButton,
        PLink,
        PBadge,
        DeleteModal,
        PSpinner,
    },
    props: {
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const budgetPageStore = useBudgetPageStore();
        const budgetPageState = budgetPageStore.$state;

        const state = reactive({
            hasBudgetAlert: computed(() => {
                const notifications = budgetPageState.budgetData?.notifications;
                return notifications ? notifications.length > 0 : false;
            }),
            notifications: computed(() => {
                const notifications = budgetPageState.budgetData?.notifications;
                return notifications ? notifications.map((d) => ({ ...d, id: getUUID() })) : [];
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

        return {
            ...toRefs(state),
            checkDeleteState,
            handleDelete,
            handleDeleteForm,
            handleSetNotifications,
            handleBudgetNotifications,
            commaFormatter,
            BUDGET_NOTIFICATIONS_UNIT,
            BUDGET_NOTIFICATIONS_TYPE,
            PROJECT_ROUTE,
            ACTION_ICON,
        };
    },
};
</script>

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
        @apply flex-col;
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
