<template>
    <p-widget-layout title="Collectors" :help="$t('DASHBOARD.ACTION.COLLECTORS')">
        <div class="grid gap-8 grid-cols-1 lg:grid-cols-2">
            <collector-history class="widget" />
            <collector-runs class="widget" />
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import CollectorHistory from '@/views/common/widgets/collector-history/CollectorHistory.vue';
import CollectorRuns from '@/views/common/widgets/collector-runs/CollectorRuns.vue';

export default {
    name: 'Collectors',
    components: { PWidgetLayout, CollectorHistory, CollectorRuns },
    setup() {
        return {};
    },
};
</script>

<style lang="postcss" scoped>
    .widget::v-deep {
        &.widget-layout {
            @apply border-0 border-transparent;
            .top {
                @apply mt-0 mb-4 mx-0;
            }
            .title {
                @apply text-base;
            }
            .widget-contents {
                @apply p-0;
            }
        }

    }
</style>
