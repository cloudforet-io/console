<template>
    <div class="vertical-timeline"
         :class="{selected: selected}"
         @click="handleClickTimeline"
    >
        <div class="timeline-item"
             :class="[{'last-item': isLastItem}]"
        >
            <div class="date">
                {{ getTimezoneDate(date, timezone) }}
            </div>
            <div class="vertical-line">
                <div class="line" />
                <div class="circle"
                     :class="color"
                />
            </div>
            <div class="item-detail">
                <div class="title-wrapper">
                    <div class="title-left"
                         :class="{ vertical: isTitleVertical }"
                    >
                        <div>
                            <span class="title">{{ title }}</span>
                            <p-badge v-if="count"
                                     badge-type="subtle"
                                     :style-type="getBadgeStyleType(color)"
                            >
                                {{ count }}
                            </p-badge>
                        </div>
                        <slot name="additional-title" />
                    </div>
                    <slot name="title-right" />
                </div>
                <slot name="timeline-detail" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import type { SetupContext } from 'vue';
import { defineComponent } from 'vue';

import {
    PBadge,
} from '@spaceone/design-system';
import dayjs from 'dayjs';

import { iso8601Formatter } from '@cloudforet/core-lib';

interface Props {
    date: string;
    title: string;
    count?: number;
    color: string;
    timezone: string;
    selected: boolean;
    isLastItem: boolean;
    isTitleVertical: boolean;
}

export default defineComponent<Props>({
    name: 'VerticalTimeline',
    components: {
        PBadge,
    },
    props: {
        date: {
            type: String,
            default: '',
        },
        title: {
            type: String,
            default: '',
        },
        count: {
            type: Number,
            default: 0,
        },
        color: {
            type: String,
            default: 'GRAY',
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
        isTitleVertical: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }: SetupContext) {
        /* Util */
        const getBadgeStyleType = (itemColor: string): string => {
            if (itemColor === 'GREEN') return 'green200';
            if (itemColor === 'BLUE') return 'blue200';
            return 'gray200';
        };
        const getTimezoneDate = (date: string, timezone: string): string => dayjs.utc(date).tz(timezone).format('YYYY/MM/DD HH:mm:ss');

        /* Event */
        const handleClickTimeline = () => {
            emit('click-timeline');
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
        width: 100%;
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
        .date {
            flex-shrink: 0;
            width: 6.25rem;
            text-align: right;
            font-size: 0.875rem;
            line-height: 1.25;
            padding: 1rem 0;
        }
        .item-detail {
            width: 100%;
            overflow: hidden;
            font-size: 0.875rem;
            line-height: 150%;
            padding: 1rem 0;
            .title-wrapper {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                line-height: 1;
                .title-left {
                    @apply flex gap-4;
                    & > div {
                        white-space: nowrap;
                    }
                }
                .vertical {
                    @apply flex-col gap-2;
                }
                .title {
                    font-weight: bold;
                    margin-right: 0.25rem;
                }
            }
        }
    }
}
</style>
