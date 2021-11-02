<template>
    <p-pane-layout class="budget-alert-wrapper">
        <section class="card-header">
            <span class="title">Budget Alert</span>
            <p-icon-button name="ic_trashcan" @click="handleDelete" />
        </section>
        <section v-if="hasBudgetAlert" class="card-body">
            <article class="alert-condition">
                <span class="sub-title">Alert Condition</span>
                <span class="content-desc">
                    Any of the following are met, <br>
                    a notification will be sent immediately.
                </span>
                <ul class="content">
                    <li>
                        <span class="bullet">•</span>
                        <p-badge style-type="gray" outline
                                 class="icon"
                        >
                            Warning
                        </p-badge>
                        <span>Actual cost > $1,000</span>
                    </li>
                    <li>
                        <span class="bullet">•</span>
                        <p-badge style-type="gray" outline
                                 class="icon"
                        >
                            Warning
                        </p-badge>
                        <span>Actual cost > $2,000</span>
                    </li>
                    <li>
                        <span class="bullet">•</span>
                        <p-badge style-type="alert" outline
                                 class="icon"
                        >
                            Critical
                        </p-badge>
                        <span>% of budget > 90%</span>
                    </li>
                </ul>
                <p-icon-text-button name="ic_setting" style-type="gray900" outline
                                    class="mt-4"
                                    @click="handleSetAlert"
                >
                    Set
                </p-icon-text-button>
            </article>
            <article class="noti-channel">
                <span class="sub-title">Notifications Channel</span>
                <p class="content">
                    <span class="content-desc">Budget alert Message will be sent to the notifications channels below.
                        <p-anchor class="link-text ml-2"
                                  :text="'Set Notifications'"
                                  :href="'/'"
                                  highlight
                        />
                    </span>
                    <budget-notifications-channel class="mt-2" />
                </p>
            </article>
        </section>
        <section v-else class="card-body no-alert">
            <p class="content no-alert">
                <span class="content-desc no-alert">
                    Set budget alert if you want to send notifications when the cost exceeds the budget
                </span> <br>
                <p-icon-text-button name="ic_setting" style-type="gray900" outline
                                    class="mt-4"
                                    @click="handleSetAlert"
                >
                    Set
                </p-icon-text-button>
            </p>
        </section>
        <delete-modal :header-title="checkDeleteState.headerTitle"
                      :visible.sync="checkDeleteState.visible"
                      @confirm="handleDeleteForm"
        />
        <budget-alert-modal v-if="budgetAlertModalVisible"
                            :visible.sync="budgetAlertModalVisible"
                            @confirm="handleBudgetAlert"
        />
    </p-pane-layout>
</template>

<script>
import {
    PPaneLayout, PIconButton, PI, PAnchor, PIconTextButton, PBadge,
} from '@spaceone/design-system';
import BudgetNotificationsChannel
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-notifications/BudgetNotificationsChannel.vue';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import { reactive, toRefs } from '@vue/composition-api';
import BudgetAlertModal
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-notifications/BudgetNotificationsModal.vue';

export default {
    name: 'BudgetNotifications',
    components: {
        BudgetAlertModal,
        BudgetNotificationsChannel,
        PPaneLayout,
        PIconButton,
        PIconTextButton,
        PAnchor,
        PBadge,
        DeleteModal,
    },
    setup() {
        const state = reactive({
            hasBudgetAlert: true,
            budgetAlertModalVisible: false,
        });

        const checkDeleteState = reactive({
            visible: false,
            headerTitle: 'Are you sure you want to delete the budget alert?',
            // loading: true,
        });
        const handleDelete = () => {
            checkDeleteState.visible = true;
        };
        const handleDeleteForm = async () => {
            try {
                // TODO: Delete Budget Alert API
                console.log('Successfully deleted budget alert');
            } catch (e) {
                console.error(e);
            } finally {
                checkDeleteState.visible = false;
            }
        };

        const handleSetAlert = () => {
            state.budgetAlertModalVisible = true;
        };

        const handleBudgetAlert = () => {
            state.budgetAlertModalVisible = false;
        };

        return {
            ...toRefs(state),
            checkDeleteState,
            handleDelete,
            handleDeleteForm,
            handleSetAlert,
            handleBudgetAlert,
        };
    },
};
</script>

<style lang="postcss" scoped>
.budget-alert-wrapper {
    @apply flex flex-col;
    min-width: 100%;
    min-height: 100%;
}
.card-header {
    @apply bg-gray-100 items-center;
    display: inherit;
    padding: 1rem 1rem;
    min-height: 4rem;
    font-size: 1.5rem;
    line-height: 135%;
    .title {
        margin-right: 0.5rem;
    }
}
.card-body {
    @apply px-4;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1rem;
    padding: 1.5rem 1rem 2.5rem;
    .sub-title {
        @apply font-bold block;
        font-size: 1rem;
        line-height: 160%;
        margin-bottom: 0.5rem;
    }
    .content {
        li {
            @apply inline-block items-center;
            height: 1.625rem;
            vertical-align: middle;
            font-size: 0.875rem;
            line-height: 150%;
        }
        .bullet {
            @apply text-center;
            display: inherit;
            width: 1.5rem;
            margin-right: 0.25rem;
        }
        .icon {
            margin-right: 0.25rem;
        }
    }
    .content-desc {
        display: inline-flex;
        align-items: center;
        font-size: 0.875rem;
        line-height: 160%;
        margin-bottom: 0.5rem;
        white-space: nowrap;
    }
    .alert-condition {
        grid-column: 1 / 4;
    }
    .noti-channel {
        grid-column: 5 / 12;
    }
    &.no-alert {
        display: flex;
        flex-direction: column;
        .content-desc {
            @apply text-gray-500;
            font-size: 0.875rem;
            line-height: 135%;
            margin-bottom: 1rem;
        }
    }
}
</style>
