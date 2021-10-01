<template>
    <div class="notification-item">
        <g-n-b-notification-date-header v-if="dateHeader" :value="dateHeader" />
        <slot name="relative-time" />
        <div class="item-wrapper" :class="{'link-hover': isLinkMouseEntered}">
            <new-mark v-if="isNew" class="new-mark" />
            <div class="contents-wrapper">
                <p class="title">
                    <p-i v-if="icon" :name="icon" width="1rem"
                         height="1rem"
                         class="mr-1"
                    />
                    <span>{{ title }}</span>
                </p>
                <p-collapsible-panel v-model="isCollapsed" :line-clamp="3">
                    <component :is="link ? 'a' : 'span'" :class="{collapsed: isCollapsed, 'link': link}"
                               :href="link" target="_self"
                               class="contents"
                               @mouseenter="link ? changeLinkMouseEnterState(true) : undefined"
                               @mouseleave="link ? changeLinkMouseEnterState(false) : undefined"
                    >
                        <span>{{ contents }}</span>
                    </component>
                </p-collapsible-panel>
                <div class="datetime">
                    {{ occurred }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import dayjs, { Dayjs } from 'dayjs';

import {
    PCollapsiblePanel, PI, PAnchor,
} from '@spaceone/design-system';
import { iso8601Formatter } from '@spaceone/console-core-lib';

import { store } from '@/store';
import { i18n } from '@/translations';

import NewMark from '@/common/components/marks/NewMark.vue';
import GNBNotificationDateHeader from '@/common/modules/navigations/gnb/modules/gnb-notification/modules/GNBNotificationDateHeader.vue';

const NOTIFICATION_TYPE_ICONS = {
    INFO: '',
    ERROR: 'ic_alert',
    SUCCESS: 'ic_state_active',
    WARNING: 'ic_state_duplicated',
};

export default {
    name: 'GNBNotificationItem',
    components: {
        GNBNotificationDateHeader,
        NewMark,
        PI,
        PAnchor,
        PCollapsiblePanel,
    },
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
        beforeData: {
            type: Object,
            default: null,
        },
    },
    setup(props) {
        const dataHeaderFormatter = (time: string, timezone: string) => {
            if (!time) return '';

            const occurredTime: Dayjs = dayjs.tz(dayjs(time), timezone);
            const now: Dayjs = dayjs.tz(dayjs(), timezone);

            // const diff = Math.ceil(now.diff(occurredTime, 'day', true));
            // if (diff > 7) return '';

            if (occurredTime.isSame(now, 'day')) {
                return i18n.t('COMMON.GNB.NOTIFICATION.TODAY');
            }
            if (now.subtract(1, 'day').isSame(occurredTime, 'day')) {
                return i18n.t('COMMON.GNB.NOTIFICATION.YESTERDAY');
            }
            return occurredTime.from(now);
        };

        const state = reactive({
            timezone: computed(() => store.state.user.timezone),
            beforeDataHeader: computed(() => dataHeaderFormatter(props.beforeData?.created_at || '', state.timezone)),
            dateHeader: computed(() => {
                const dateHeader = dataHeaderFormatter(props.data.created_at || '', state.timezone);
                if (state.beforeDataHeader && state.beforeDataHeader === dateHeader) return '';
                return dateHeader;
            }),
            isNew: computed(() => !props.data.is_read),
            icon: computed(() => NOTIFICATION_TYPE_ICONS[props.data.notification_type]),
            title: computed(() => props.data.message?.title),
            link: computed(() => props.data.message?.link),
            contents: computed(() => props.data.message?.description),
            occurred: computed(() => {
                if (!props.data.created_at) return '';

                return iso8601Formatter(props.data.created_at, state.timezone);
            }),
            isLinkMouseEntered: false,
            isCollapsed: true,
        });
        const changeLinkMouseEnterState = (value: boolean) => {
            if (state.isLinkMouseEntered !== value) state.isLinkMouseEntered = value;
        };
        return {
            ...toRefs(state),
            changeLinkMouseEnterState,
        };
    },
};
</script>

<style lang="postcss" scoped>
.notification-item {
    .item-wrapper {
        @apply rounded-lg;
        display: flex;
        padding: 0.5rem;
        align-items: baseline;
        &.link-hover {
            @apply bg-violet-100;
        }
        .new-mark {
            flex-shrink: 0;
            margin-right: 0.25rem;
            margin-left: 0;
            line-height: 1.2;
        }
        .contents-wrapper {
            flex-grow: 1;
        }
        .p-collapsible-panel {
            display: block;
            font-size: 0.875rem;
            margin-bottom: 0.125rem;
            padding: 0;
        }
        .contents {
            opacity: 0.8;

            &.link {
                @apply text-blue-800;
            }

            @media (hover: hover) {
                &.link:hover {
                    opacity: 1;
                    text-decoration: underline;
                }
            }
        }
        .title {
            font-size: 0.875rem;
            line-height: 1.5;
            font-weight: bold;
            text-transform: capitalize;
            vertical-align: middle;
            margin-bottom: 0.125rem;
        }
        .datetime {
            @apply text-gray-400;
            margin-top: 0.125rem;
            font-size: 0.75rem;
            line-height: 1.5;
        }
    }
}
</style>
