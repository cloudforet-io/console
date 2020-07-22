<template>
    <p-widget-layout title="Collection" class="collection">
        <div class="grid gap-8 grid-cols-1 lg:grid-cols-2">
            <s-collection-history class="widget" />
            <s-collecting-runs class="widget" />
        </div>
    </p-widget-layout>
</template>

<script lang="ts">
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';
import SCollectionHistory from '@/views/common/widgets/collection-history/SCollectionHistory.vue';
import SCollectingRuns from '@/views/common/widgets/collecting-runs/SCollectingRuns.vue';

export default {
    name: 'Collection',
    components: { PWidgetLayout, SCollectionHistory, SCollectingRuns },
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
