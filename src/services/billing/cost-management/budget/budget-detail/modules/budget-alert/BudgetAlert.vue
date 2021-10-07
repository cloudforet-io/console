<template>
    <p-pane-layout class="budget-alert-wrapper">
        <section class="card-header">
            <span class="title">Budget Alert</span>
            <p-icon-button name="ic_trashcan" />
            <p-icon-button name="ic_setting" />
        </section>
        <section class="card-body">
            <article class="alert-condition">
                <span class="sub-title">Alert Condition</span>
                <ul class="content">
                    Any of the following are met <br>
                    <li>
                        <span class="bullet">•</span>
                        <p-i name="ic_urgency_low" width="0.875em" height="0.875em"
                             class="icon"
                        />
                        <span>Actual cost > $1,000</span>
                    </li>
                    <li>
                        <span class="bullet">•</span>
                        <p-i name="ic_alert" width="0.875em" height="0.875em"
                             class="icon"
                        />
                        <span>Actual cost > $2,000</span>
                    </li>
                    <li>
                        <span class="bullet">•</span>
                        <p-i name="ic_alert" width="0.875em" height="0.875em"
                             class="icon"
                        />
                        <span>% of budget > 90%</span>
                    </li>
                </ul>
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
                    <budget-alert-noti-channel class="mt-2" />
                </p>
            </article>
        </section>
    </p-pane-layout>
</template>

<script>
import {
    PPaneLayout, PIconButton, PI, PAnchor,
} from '@spaceone/design-system';
import BudgetAlertNotiChannel
    from '@/services/billing/cost-management/budget/budget-detail/modules/budget-alert/BudgetAlertNotiChannel.vue';

export default {
    name: 'BudgetDetailAlert',
    components: {
        BudgetAlertNotiChannel,
        PPaneLayout,
        PIconButton,
        PI,
        PAnchor,
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
        font-size: 0.875rem;
        line-height: 150%;
        li {
            @apply inline-block items-center;
            height: 1.5rem;
            vertical-align: middle;
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

    .alert-condition {
        grid-column-start: 1;
        grid-column-end: 3;
    }
    .noti-channel {
        grid-column-start: 4;
        grid-column-end: 12;
        .content-desc {
            display: inline-flex;
            align-items: center;
        }
    }
}
</style>
