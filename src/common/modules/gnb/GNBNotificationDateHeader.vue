<template>
    <p class="notification-date-header">
        {{ datetime }}
    </p>
</template>

<script lang="ts">
export default {
    name: 'GNBNotificationDateHeader',
    props: {
        datetime: {
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
    @apply text-gray-700;
    font-size: 0.75rem;
    line-height: 1.5;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    padding: 0 0.5rem;
}
</style>
