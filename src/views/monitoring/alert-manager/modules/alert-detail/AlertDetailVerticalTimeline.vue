<template>
    <div class="timeline-wrapper">
        <ul class="timeline-list">
            <li class="timeline-item">
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
import { iso8601Formatter } from '@spaceone/console-core-lib';

export default {
    name: 'AlertDetailVerticalTimeline',
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
    },
    setup() {
        return {
            iso8601Formatter,
        };
    },
};

</script>

<style lang="postcss" scoped>
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

        &:before {
            @apply border-4 border-primary3 bg-primary;
            position: absolute;
            left: -0.4375rem;
            content: " ";
            border-radius: 500%;
            height: 0.875rem;
            width: 0.875rem;
            transition: all 500ms ease-in-out;
        }
        //&:last-child {
        //    border-left: 0;
        //}
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
