<script setup lang="ts">
import { PCollapsiblePanel } from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

const props = defineProps<{
    item?: Record<string, any>;
    timezone?: string;
    eventType?: string;
    isLastItem?: boolean;
}>();
</script>

<template>
    <div class="timeline-wrapper">
        <ul class="timeline-list">
            <li class="timeline-item"
                :class="[props.eventType, {'no-border': props.isLastItem}]"
            >
                <div class="timestamp">
                    {{ props.item.created_at ? iso8601Formatter(props.item.created_at, props.timezone) : '' }}
                </div>
                <p-collapsible-panel class="item-detail"
                                     :line-clamp="8"
                >
                    <slot name="timeline-detail" />
                </p-collapsible-panel>
            </li>
        </ul>
    </div>
</template>

<style lang="postcss" scoped>
@define-mixin circle-style {
    position: absolute;
    left: -0.4375rem;
    content: " ";
    border-radius: theme('borderRadius.full');
    height: 0.875rem;
    width: 0.875rem;
}
.timeline-wrapper {
    .timeline-list {
        padding: 0;
        display: flex;
    }
    .timeline-item {
        @apply border-l border-gray-200;
        margin-left: 7.5rem;
        position: relative;
        padding-left: 1rem;
        padding-bottom: 1.5rem;
        min-height: 3.25rem;
        width: calc(100% - 7.5rem);
        &::before {
            @mixin circle-style;

            @apply border-4 border-primary3 bg-primary;
        }
        &.ALERT {
            &::before {
                @mixin circle-style;

                @apply border-4 border-red-200 bg-red-400;
            }
        }
        &.ERROR {
            &::before {
                @mixin circle-style;

                @apply border-4 border-red-500 bg-red-200;
            }
        }
        &.RECOVERY {
            &::before {
                @mixin circle-style;

                @apply border-4 border-green-300 bg-green-600;
            }
        }
        &.no-border {
            @apply border-white;
        }
    }
}
.timestamp {
    position: absolute;
    width: 6.25rem;
    left: -7.5rem;
    text-align: right;
    font-size: 0.875rem;
    line-height: 140%;
}
.item-detail {
    font-size: 0.875rem;
    line-height: 150%;
    padding: 0;
}
</style>
