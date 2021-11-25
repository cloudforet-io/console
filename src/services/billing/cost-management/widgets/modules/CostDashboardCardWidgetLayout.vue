<template>
    <p-pane-layout class="cost-dashboard-card-widget-layout">
        <div class="card-header">
            <span class="title">{{ title }}</span>
            <p class="title-extra">
                <span class="show-top-text">Showing Top {{ dataRange }}
                    <p-i name="ic_tooltip" width="1rem" height="1rem"
                         color="inherit transparent" class="tooltip-button"
                    />
                </span>
                <router-link :to="widgetLink" class="anchor-button">
                    Full data
                    <p-i name="ic_arrow_right" width="1rem" height="1rem"
                         color="inherit transparent"
                    />
                </router-link>
            </p>
        </div>
        <div class="card-body">
            <slot />
        </div>
    </p-pane-layout>
</template>

<script lang="ts">
import { PPaneLayout, PI } from '@spaceone/design-system';

export default {
    name: 'CostDashboardCardWidgetLayout',
    components: {
        PPaneLayout,
        PI,
    },
    props: {
        title: {
            type: String,
            default: 'Title',
        },
        dataRange: {
            type: Number,
            default: 15,
        },
        widgetLink: {
            type: [Object, String],
            default: () => ({}),
        },
    },
    setup() {
        return {};
    },
};
</script>

<style lang="postcss" scoped>
.cost-dashboard-card-widget-layout {
    @apply flex flex-col;
    .card-header {
        @apply bg-gray-100 items-center;
        display: inherit;
        justify-content: space-between;
        padding: 1rem;
        min-height: 4rem;
        font-size: 1.5rem;
        line-height: 135%;
        border: none;
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
    }
    .card-body {
        padding: 1rem;
    }
    .title-extra {
        @apply inline-flex items-center;
        .show-top-text {
            @apply text-gray-500;
            font-size: 0.875rem;
            line-height: 150%;
            .tooltip-button {
                @apply text-gray-300 ml-1 mr-2;
            }
        }
        .anchor-button {
            @apply flex-shrink-0 text-sm text-blue-600 font-normal cursor-pointer;
            font-size: 0.75rem;
            line-height: 120%;
            &:hover {
                @apply text-secondary underline;
            }
        }
    }
}
</style>
