<template>
    <div class="budget-notifications">
        <p-card
            style-type="gray100"
            size="lg"
        >
            <template #header>
                <section class="header">
                    <span class="title">Budget Notifications</span>
                    <p-icon-button v-if="hasBudgetAlert" name="ic_trashcan" @click="handleDelete" />
                </section>
            </template>
            <template #default>
                <section class="card-body">
                    <template v-if="$store.getters['service/budget/isBudgetLoading']">
                        <p-lottie name="thin-spinner" :size="2.5"
                                  auto class="spinner w-full flex justify-center"
                        />
                    </template>
                    <template v-else-if="hasBudgetAlert">
                        <article class="noti-condition">
                            <span class="sub-title">Condition</span>
                            <span class="desc">Any of the following are met, <br>a notification will be sent immediately.</span>
                            <ul class="condition-list">
                                <li v-for="item in notifications" :key="item.id">
                                    <span class="bullet">•</span>
                                    <p-badge :style-type="item.notification_type === BUDGET_NOTIFICATIONS_TYPE.WARNING ? 'gray'
                                        : 'alert'" outline class="icon"
                                    >
                                        {{ item.notification_type === 'WARNING' ? 'Warning' : 'Critical' }}
                                    </p-badge>
                                    <span v-if="item.unit !== BUDGET_NOTIFICATIONS_UNIT.PERCENT">Actual Cost > ${{ commaFormatter(item.threshold) }}</span>
                                    <span v-else>% of budget > {{ item.threshold }}%</span>
                                </li>
                            </ul>
                            <p-icon-text-button name="ic_setting" style-type="gray900" outline
                                                @click="handleSetNotifications"
                            >
                                Set
                            </p-icon-text-button>
                        </article>
                        <article class="noti-channel">
                            <span class="sub-title">Notifications Channel</span>
                            <div class="desc-wrapper">
                                <span class="desc">Budget Notifications Message will be sent to the notifications channels below.</span>
                                <p-anchor v-if="budgetTargetId"
                                          class="link-text"
                                          :text="'Set Notifications'"
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
                                Set budget notifications if you want to send notifications when the cost exceeds the budget
                            </p>
                            <p-icon-text-button name="ic_setting" style-type="gray900" outline
                                                @click="handleSetNotifications"
                            >
                                Set
                            </p-icon-text-button>
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
import {
    PCard, PIconButton, PAnchor, PIconTextButton, PBadge, PLottie,
} from '@spaceone/design-system';
import BudgetNotificationsChannel
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-notifications/BudgetNotificationsChannel.vue';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';
import BudgetNotificationsModal
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-notifications/BudgetNotificationsModal.vue';
import { BUDGET_NOTIFICATIONS_TYPE, BUDGET_NOTIFICATIONS_UNIT } from '@/services/billing/cost-management/budget/type';
import { store } from '@/store';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { getUUID } from '@/lib/component-util/getUUID';
import { commaFormatter } from '@spaceone/console-core-lib';
import { PROJECT_ROUTE } from '@/services/project/routes';

export default {
    name: 'BudgetNotifications',
    components: {
        BudgetNotificationsModal,
        BudgetNotificationsChannel,
        PLottie,
        PCard,
        PIconButton,
        PIconTextButton,
        PAnchor,
        PBadge,
        DeleteModal,
    },
    setup() {
        const state = reactive({
            hasBudgetAlert: computed(() => (store.state.service.budget.budgetData?.notifications.length > 0)),
            notifications: computed(() => store.state.service.budget.budgetData?.notifications.map(d => ({ ...d, id: getUUID() }))),
            budgetNotificationsModalVisible: false,
            budgetId: computed(() => store.state.service.budget.budgetData?.budget_id),
            budgetTargetId: computed(() => store.state.service.budget.budgetData?.project_id) || undefined,
        });

        const checkDeleteState = reactive({
            visible: false,
            headerTitle: 'Are you sure you want to delete the budget notifications?',
            loading: true,
        });
        const handleDelete = () => {
            checkDeleteState.visible = true;
        };
        const handleDeleteForm = async () => {
            try {
                checkDeleteState.loading = true;
                await store.dispatch('service/budget/updateBudgetNotifications', {
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
        };
    },
};
</script>

<style lang="postcss" scoped>
.budget-notifications::v-deep .body {
    padding: 0;
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
        .desc-wrapper {
            @apply inline-flex flex-wrap items-center;
            .desc {
                margin-right: 0.5rem;
            }
            .link-text {
                font-size: 0.875rem;
                line-height: 160%;
            }
        }
        .budget-notifications-channel {
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
    .spinner {
        @apply flex w-full justify-center;
    }

    @screen tablet {
        @apply flex-col;
        row-gap: 1.5em;

        .noti-condition {
            width: 100%;
        }
        .noti-channel {
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
