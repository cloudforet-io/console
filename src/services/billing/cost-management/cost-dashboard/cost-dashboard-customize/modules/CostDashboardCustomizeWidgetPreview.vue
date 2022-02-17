<template>
    <div class="cost-dashboard-customize-widget-preview">
        <slot name="description" />
        <slot name="chart" />
        <section class="layout">
            <p-label>Layout</p-label>
            <div class="layout-preview">
                <span v-for="i in Math.round(100 / selectedWidget.options.layout)" :key="i" />
            </div>
            In ratio {{ selectedWidget.options.layout }}%
        </section>
        <slot name="extra" />
    </div>
</template>

<script lang="ts">
import { WidgetInfo } from '@/services/billing/cost-management/cost-dashboard/type';
import { PLabel } from '@spaceone/design-system';

export default {
    name: 'CostDashboardCustomizeWidgetPreview',
    components: {
        PLabel,
    },
    props: {
        selectedWidget: {
            type: Object as () => WidgetInfo,
            default: () => ({}),
        },
    },

    setup() {
        return {};
    },
};
</script>
<style lang="postcss" scoped>
.cost-dashboard-customize-widget-preview {
    @apply flex flex-col bg-gray-100 p-4;
    width: 16.5rem;
    height: 17.25rem;

    .layout-preview {
        @apply flex col-gap-2;
        width: 14.375rem;
        height: 2.5rem;
        > span {
            @apply flex-grow bg-white rounded-md;
            &:first-child {
                @apply bg-gray-400;
            }
        }
    }
}
</style>
