<template>
    <div class="vertical-timeline">
        <div class="timeline-item" :class="[item.color, {'no-border': isLastItem}]">
            <div class="timestamp">
                {{ item.date }}
            </div>
            <div class="item-detail">
                <div class="title-wrapper">
                    <span class="title">{{ item.title }}</span>
                    <p-badge v-if="item.count" :style-type="getBadgeStyleType(item.color)">
                        {{ item.count }}
                    </p-badge>
                    <slot name="title-right" />
                </div>
                <slot name="timeline-detail" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';

import { iso8601Formatter } from '@spaceone/console-core-lib';
import {
    PBadge,
} from '@spaceone/design-system';


interface TimelineItem {
    date: string;
    color: string;
    title: string;
    count?: number;
}
interface Props {
    item: TimelineItem;
    timezone: string;
    isLastItem: boolean;
}

export default defineComponent<Props>({
    name: 'VerticalTimeline',
    components: {
        PBadge,
    },
    props: {
        item: {
            type: Object,
            default: () => ({}) as PropType<TimelineItem>,
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        isLastItem: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        /* Util */
        const getBadgeStyleType = (itemColor: string): string => {
            if (itemColor === 'GREEN') return 'green200';
            if (itemColor === 'BLUE') return 'blue200';
            return 'gray200';
        };

        return {
            iso8601Formatter,
            getBadgeStyleType,
        };
    },
});

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
.vertical-timeline {
    .timeline-list {
        padding: 0;
        display: inline-block;
    }
    .timeline-item {
        @apply border-l border-gray-200;
        min-height: 3.25rem;
        position: relative;
        padding-left: 1rem;
        padding-bottom: 1.5rem;
        margin-left: 7.5rem;
        &::before {
            @mixin circle-style;

            @apply border-4 border-primary3 bg-primary;
        }
        &.RED {
            &::before {
                @mixin circle-style;

                @apply border-4 border-red-200 bg-red-400;
            }
        }
        &.GREEN {
            &::before {
                @mixin circle-style;

                @apply border-4 border-green-300 bg-green-600;
            }
        }
        &.BLUE {
            &::before {
                @mixin circle-style;

                @apply border-4 border-blue-300 bg-blue-600;
            }
        }
        &.no-border {
            @apply border-white;
        }

        .timestamp {
            position: absolute;
            width: 6.25rem;
            left: -7.5rem;
            text-align: right;
            font-size: 0.875rem;
            line-height: 1.25;
        }
        .item-detail {
            font-size: 0.875rem;
            line-height: 150%;
            .title-wrapper {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                line-height: 1;
                .title {
                    font-weight: bold;
                }
            }
        }
    }
}
</style>
