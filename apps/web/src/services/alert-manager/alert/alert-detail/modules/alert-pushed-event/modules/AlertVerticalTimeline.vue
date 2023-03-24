<template>
    <div class="timeline-wrapper">
        <ul class="timeline-list">
            <li class="timeline-item"
                :class="[eventType, {'no-border': isLastItem}]"
            >
                <div class="timestamp">
                    {{ item.created_at ? iso8601Formatter(item.created_at, timezone) : '' }}
                </div>
                <div class="item-detail">
                    <slot name="timeline-detail" />
                </div>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { iso8601Formatter } from '@cloudforet/core-lib';

export default {
    name: 'AlertVerticalTimeline',
    components: {

    },
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
        timezone: {
            type: String,
            default: undefined,
        },
        eventType: {
            type: String,
            default: undefined,
        },
        isLastItem: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        return {
            iso8601Formatter,
        };
    },
};

</script>

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
        display: inline-block;
    }
    .timeline-item {
        @apply border-l border-gray-200;
        margin-left: 7.5rem;
        position: relative;
        padding-left: 1rem;
        padding-bottom: 1.5rem;
        min-height: 3.25rem;
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
}
</style>
