<template>
    <p class="notification-date-header">
        {{ value }}
    </p>
</template>

<script lang="ts">
export default {
    name: 'GNBNotificationDateHeader',
    props: {
        value: {
            type: String,
            default: '',
        },
    },
    setup() {
        return {};
    },
};
</script>

<style lang="postcss" scoped>
.notification-date-header {
    @apply text-gray-500;
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1.5;
    margin-top: 0.75rem;
    margin-bottom: 0.25rem;
    padding: 0 0.75rem;
}
</style>
