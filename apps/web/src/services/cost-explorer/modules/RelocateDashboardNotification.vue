<script setup lang="ts">
import { PTextButton } from '@spaceone/design-system';

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
    <div class="relocate-dashboard-notification">
        <div class="relocate-notification-wrapper">
            <p class="notification-title">
                <!--TODO: translation-->
                {{ $t('Reloate dashboard') }}
            </p>
            <span class="notification-description">
                <!--TODO: translation-->
                {{ $t('Your whole Cost Explorer dashboard has been securely transferred to the Dashboard menu for improved usabillity.') }}
            </span>
            <p-text-button style-type="highlight"
                           class="notification-text-button"
                           @click="handleLearnMore"
            >
                <!--TODO: translation-->
                {{ $t('Learn more') }}
            </p-text-button>
            <p-text-button style-type="highlight"
                           class="notification-text-button"
                           @click="handleMenuDismiss"
            >
                <!--TODO: translation-->
                {{ $t('Dismiss') }}
            </p-text-button>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.relocate-dashboard-notification {
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
