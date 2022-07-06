<template>
    <div class="vertical-timeline" :class="{selected: selected}" @click="handleClickTimeline">
        <div class="timeline-item" :class="[{'last-item': isLastItem}]">
            <div class="timestamp">
                {{ getTimezoneDate(item.date) }}
            </div>
            <div class="vertical-line">
                <div class="line" />
                <div class="circle" :class="item.color" />
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
import dayjs from 'dayjs';

import { CloudServiceTimelineItem } from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';


interface Props {
    item: CloudServiceTimelineItem;
    timezone: string;
    selected: boolean;
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
            default: () => ({}) as PropType<CloudServiceTimelineItem>,
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        selected: {
            type: Boolean,
            default: false,
        },
        isLastItem: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        /* Util */
        const getBadgeStyleType = (itemColor: string): string => {
            if (itemColor === 'GREEN') return 'green200';
            if (itemColor === 'BLUE') return 'blue200';
            return 'gray200';
        };
        const getTimezoneDate = (date: string): string => dayjs.utc(date).tz(props.timezone).format('YYYY/MM/DD HH:mm:ss');

        /* Event */
        const handleClickTimeline = () => {
            emit('click-timeline', props.item);
        };

        return {
            iso8601Formatter,
            getBadgeStyleType,
            getTimezoneDate,
            handleClickTimeline,
        };
    },
});

</script>

<style lang="postcss" scoped>
.vertical-timeline {
    @apply rounded-md;
    cursor: pointer;

    &:hover {
        @apply bg-blue-100;
    }
    &.selected {
        @apply bg-blue-200;
    }

    .timeline-list {
        padding: 0;
        display: inline-block;
    }
    .timeline-item {
        display: inline-flex;
        min-height: 3.25rem;
        position: relative;

        &::before {
            @apply border-4 border-primary3 bg-primary;
        }

        .vertical-line {
            position: relative;
            margin-left: 1rem;
            margin-right: 0.75rem;
            .line {
                @apply border-l border-gray-200;
                position: absolute;
                height: 100%;
                top: 1rem;
            }
            .circle {
                position: absolute;
                width: 1rem;
                height: 1rem;
                border-radius: theme('borderRadius.full');
                left: -0.5rem;
                top: 1rem;
                &.RED {
                    @apply border-4 border-red-200 bg-red-400;
                }
                &.GREEN {
                    @apply border-4 border-green-300 bg-green-600;
                }
                &.BLUE {
                    @apply border-4 border-blue-300 bg-blue-600;
                }
            }
        }
        &.last-item {
            .line {
                height: 1rem;
            }
        }
        .timestamp {
            flex-shrink: 0;
            width: 6.25rem;
            text-align: right;
            font-size: 0.875rem;
            line-height: 1.25;
            padding: 1rem 0;
        }
        .item-detail {
            font-size: 0.875rem;
            line-height: 150%;
            padding: 1rem 0;
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
