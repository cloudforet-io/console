<script setup lang="ts">
import { PTextButton } from '@cloudforet/mirinae';

const emit = defineEmits<{(e: 'click-dismiss'): void;
    (e: 'click-learn-more'): void;
}>();

const handleLearnMore = () => {
    emit('click-learn-more');
};
const handleMenuDismiss = () => {
    emit('click-dismiss');
};

</script>

<template>
    <div class="cost-explorer-l-s-b-relocate-dashboard-notification">
        <div class="relocate-notification-wrapper">
            <p class="notification-title">
                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.RELOCATE_DASHBOARD_NOTI_TITLE') }}
            </p>
            <span class="notification-description">
                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.RELOCATE_DASHBOARD_NOTI_DESCRIPTION') }}
            </span>
            <p-text-button style-type="highlight"
                           class="notification-text-button"
                           @click="handleLearnMore"
            >
                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.RELOCATE_DASHBOARD_NOTI_LEARN_MORE') }}
            </p-text-button>
            <p-text-button style-type="highlight"
                           class="notification-text-button"
                           @click="handleMenuDismiss"
            >
                {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.RELOCATE_DASHBOARD_NOTI_DISMISS') }}
            </p-text-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.cost-explorer-l-s-b-relocate-dashboard-notification {
    padding: 0 0.5rem;

    .relocate-notification-wrapper {
        @apply w-full rounded-lg bg-violet-200;
        padding: 1rem;

        .notification-title {
            @apply text-paragraph-lg;
        }
        .notification-description {
            @apply text-paragraph-sm;
            margin-top: 0.25rem;
        }

        .notification-text-button {
            margin-top: 0.5rem;
        }
    }
}
</style>
