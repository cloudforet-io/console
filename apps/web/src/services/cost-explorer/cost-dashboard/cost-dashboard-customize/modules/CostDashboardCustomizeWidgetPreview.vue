<template>
    <div class="cost-dashboard-customize-widget-preview">
        <slot name="description" />
        <slot name="chart" />
        <div class="layout-preview-area">
            <p-field-title>{{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.LAYOUT') }}</p-field-title>
            <div class="layout-preview">
                <span v-for="i in Math.round(100 / layout)"
                      :key="i"
                />
            </div>
            <p class="text">
                {{ $t('BILLING.COST_MANAGEMENT.DASHBOARD.CUSTOMIZE.ADD_WIDGET_MODAL.IN_RATIO', { ratio: layout }) }}
            </p>
        </div>
        <slot name="extra" />
    </div>
</template>

<script lang="ts">
import { PFieldTitle } from '@spaceone/design-system';

export default {
    name: 'CostDashboardCustomizeWidgetPreview',
    components: {
        PFieldTitle,
    },
    props: {
        layout: {
            type: Number,
            default: 100,
        },
    },

    setup() {
        return {};
    },
};
</script>
<style lang="postcss" scoped>
.cost-dashboard-customize-widget-preview {
    @apply flex flex-col row-gap-2 bg-gray-100 p-4;
    font-size: 0.875rem;
    margin-top: 1rem;

    .layout-preview-area {
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
        .text {
            @apply mt-2 text-gray-900;
            font-size: 0.875rem;
        }
    }
}
</style>
