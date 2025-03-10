<script setup lang="ts">
import { computed } from 'vue';

import { PCollapsiblePanel, PDivider } from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

type StyleType = 'yellow' | 'gray' | 'violet' | 'green' | 'red';
const props = withDefaults(defineProps<{
    styleType?: StyleType;
    title: string;
    description?: string;
    datetime?: string;
    timezone?: string;
    isLastItem?: boolean;
}>(), {
    styleType: 'gray',
    title: '',
    description: '',
    datetime: '',
    timezone: 'UTC',
    isLastItem: false,
});
const emit = defineEmits<{(event: 'click'): void;
}>();

const timestamp = computed(() => (props.datetime ? iso8601Formatter(props.datetime, props.timezone) : ''));
const date = computed(() => {
    if (timestamp.value) {
        return timestamp.value.split(' ')[0];
    }
    return '';
});
const time = computed(() => {
    if (timestamp.value) {
        return timestamp.value.split(' ')[1];
    }
    return '';
});
</script>

<template>
    <div class="vertical-timeline-item"
         :class="props.styleType"
    >
        <div class="top-wrapper">
            <!-- TODO: Add icon case -->
            <p class="title">
                <slot name="title">
                    {{ props.title }}
                </slot>
            </p>
            <slot name="top-right" />
        </div>
        <div v-if="timestamp"
             class="timestamp"
        >
            <span> {{ date }}</span>
            <span> {{ time }}</span>
        </div>
        <div class="vertical-item-detail">
            <slot name="non-collapsible">
                <p-collapsible-panel :line-clamp="3">
                    <div @click="emit('click')">
                        <slot>
                            {{ props.description }}
                        </slot>
                    </div>
                </p-collapsible-panel>
            </slot>
        </div>
        <p-divider class="bottom-divider" />
    </div>
</template>

<style lang="postcss">
@define-mixin timeline-item-style $type, $color, $border-color, $bg-color {
    &.$(type) {
        >.top-wrapper {
            >.title {
                color: $color;
            }
        }
        &::before {
            border-color: $border-color;
            background-color: $bg-color;
        }
    }
}
.vertical-timeline-item {
    &:last-of-type {
        >.bottom-divider {
            display: none;
        }
    }
    position: relative;
    min-height: 3.25rem;
    margin-left: 0.575rem;
    padding-left: 1.875rem;
    padding-top: 0.75rem;
    width: calc(100% - 0.575rem);
    >.top-wrapper {
        display: flex;
        align-items: center;
        min-height: 1.315rem;
        >.title {
            @apply text-label-md;
        }
    }
    >.timestamp {
        @apply text-label-md;
        display: flex;
        gap: 0.75rem;
        text-align: right;
    }
    &::after {
        position: absolute;
        content: " ";
        left: 0;
        top: 0;
        height: 100%;
        width: 0.5rem;
        background-color: theme('colors.gray.150');
        z-index: 0;
    }
    &::before {
        position: absolute;
        border-radius: theme('borderRadius.full');
        left: -0.25rem;
        top: calc(50% - 0.5rem);
        content: " ";
        height: 1rem;
        width: 1rem;
        border-width: 4px;
        z-index: 1;
    }
    &.gray {
        @mixin timeline-item-style gray, theme('colors.gray.800'), theme('colors.gray.600'), theme('colors.gray.200');
    }
    &.violet {
        @mixin timeline-item-style violet, theme('colors.violet.600'), theme('colors.violet.500'), theme('colors.violet.200');
    }
    &.yellow {
        @mixin timeline-item-style yellow, theme('colors.yellow.700'), theme('colors.yellow.600'), theme('colors.yellow.200');
    }
    &.green {
        @mixin timeline-item-style green, theme('colors.green.700'), theme('colors.green.600'), theme('colors.green.200');
    }
    &.red {
        @mixin timeline-item-style red, theme('colors.red.500'), theme('colors.red.500'), theme('colors.red.200');
    }
    .vertical-item-detail {
        @apply text-paragraph-md;
        padding: 0.75rem 0.5rem;
        >.p-collapsible-panel {
            padding: 0;
        }
    }
    &:first-child {
        &::after {
            border-top-right-radius: 0.625rem;
            border-top-left-radius: 0.625rem;
        }
    }
    &:last-child {
        &::after {
            border-bottom-right-radius: 0.625rem;
            border-bottom-left-radius: 0.625rem;
        }
    }
}
</style>
