<template>
    <div class="notification-item">
        <g-n-b-notification-date-header v-if="dateHeader" :value="dateHeader" />
        <slot name="relative-time" />
        <div class="item-wrapper" @click="handleClickNotificationItem">
            <span v-if="isNew" class="new-circle" />
            <div class="contents-wrapper">
                <p class="title">
                    <p-i v-if="icon" :name="icon" width="1rem"
                         height="1rem"
                         class="mr-1"
                    />
                    <span>{{ title }}</span>
                </p>
                <div class="datetime">
                    {{ occurred }}
                </div>
            </div>
            <p-icon-button class="delete-button"
                           name="ic_delete"
                           size="sm"
                           @click="handleClickDeleteButton"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import {
    PI, PIconButton,
} from '@spaceone/design-system';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import GNBNotificationDateHeader from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNotificationDateHeader.vue';

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
        PI,
        PIconButton,
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
    setup(props, { emit }) {
        const { i18nDayjs } = useI18nDayjs();

        const dataHeaderFormatter = (time: string, timezone: string) => {
            if (!time) return '';

            const occurredTime: Dayjs = i18nDayjs.value.tz(i18nDayjs.value(time), timezone);
            const now: Dayjs = i18nDayjs.value.tz(i18nDayjs.value(), timezone);

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
            occurred: computed(() => {
                if (!props.data.created_at) return '';
                return dayjs.tz(dayjs.utc(props.data.created_at), state.timezone).format('YYYY-MM-DD HH:mm');
            }),
        });

        /* Event */
        const handleClickNotificationItem = () => {
            emit('select', props.data.notification_id);
        };
        const handleClickDeleteButton = () => {
            emit('delete', props.data.notification_id);
        };

        return {
            ...toRefs(state),
            handleClickNotificationItem,
            handleClickDeleteButton,
        };
    },
};
</script>

<style lang="postcss" scoped>
.notification-item {
    margin: 0.125rem 0;
    .item-wrapper {
        @apply rounded-lg;
        display: flex;
        position: relative;
        align-items: baseline;
        cursor: pointer;
        padding: 0.5rem 2rem 0.5rem 1rem;
        &:hover {
            @apply bg-blue-100;
            .delete-button {
                visibility: visible;
            }
        }
        .new-circle {
            @apply bg-blue-500;
            position: absolute;
            left: 0.375rem;
            top: 0.625rem;
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 50%;
            margin-right: 0.125rem;
        }
        .contents-wrapper {
            flex-grow: 1;
            .title {
                font-size: 0.875rem;
                line-height: 1.25;
                font-weight: bold;
                text-transform: capitalize;
                vertical-align: middle;
                margin-bottom: 0.125rem;
                &:hover {
                    text-decoration: underline;
                }
            }
            .datetime {
                @apply text-gray-400;
                margin-top: 0.125rem;
                font-size: 0.75rem;
                line-height: 1.5;
            }
        }
        .delete-button {
            visibility: hidden;
            position: absolute;
            top: 0.25rem;
            right: 0.5rem;
        }
    }
}
</style>
