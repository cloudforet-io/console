<template>
    <p-card class="cost-dashboard-card-widget-layout"
            style-type="white"
            size="lg"
    >
        <template #header>
            <div class="header">
                {{ title }}
                <p class="title-extra">
                    <span v-if="showTopText" class="show-top-text">Showing Top {{ dataRange }}
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
        </template>
        <div v-if="noData" class="no-data">
            No Item
        </div>
        <slot />
    </p-card>
</template>

<script lang="ts">
import { PI, PCard } from '@spaceone/design-system';

export default {
    name: 'CostDashboardCardWidgetLayout',
    components: {
        PI,
        PCard,
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
        noData: {
            type: Boolean,
            default: false,
        },
        showTopText: {
            type: Boolean,
            default: true,
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
    min-height: 100%;
    .header {
        @apply flex items-center justify-between;
    }
    .title-extra {
        @apply inline-flex;
        flex-shrink: 0;
        .show-top-text {
            @apply flex items-center text-gray-500;
            font-size: 0.875rem;
            line-height: 150%;
            .tooltip-button {
                @apply text-gray-300 ml-1 mr-2;
            }
        }
        .anchor-button {
            @apply flex items-center flex-shrink-0 text-sm text-blue-600 font-normal cursor-pointer;
            font-size: 0.75rem;
            line-height: 120%;
            &:hover {
                @apply text-secondary underline;
            }
        }
    }
    &::v-deep .body {
        @apply bg-white;
        flex-grow: 1;
        padding: 1rem;
        .no-data {
            @apply flex text-center justify-center items-center text-violet-300 font-bold;
            height: 100%;
            font-size: 0.875rem;
            line-height: 160%;
            z-index: 1;
        }
    }

    @screen mobile {
        .title-extra {
            .show-top-text {
                @apply hidden;
            }
        }
    }
}
</style>
