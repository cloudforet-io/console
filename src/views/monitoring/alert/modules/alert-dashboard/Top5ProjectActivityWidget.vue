<template>
    <div class="top-project-activity-widget">
        <span class="title">
            {{ $t('MONITORING.ALERT.DASHBOARD.TOP_5_PROJECT_ACTIVITY') }}
        </span>
    </div>
</template>

<script lang="ts">

export default {
    name: 'Top5ProjectActivityWidget',
    components: { },
};
</script>

<style lang="postcss" scoped>
.top-project-activity-widget {
    @apply bg-white border border-gray-200 rounded-md;
    padding: 1rem;

    .title {
        @apply text-gray-900;
        font-size: 1rem;
        line-height: 1.6;
        font-weight: bold;
    }
}
</style>
