<template>
    <div class="gnb-notifications-tab">
        <p-data-loader :data="items"
                       :loading="loading"
                       :class="{ loading: loading && !items.length }"
        >
            <div ref="notificationItemsRef" class="content-wrapper">
                <g-n-b-noti-item v-for="(item, idx) in items" :key="`${item.title}-${idx}`"
                                 :is-read="item.isRead"
                                 :title="item.title"
                                 :icon="item.icon"
                                 :created-at="item.createdAt"
                                 :date-header="item.dateHeader"
                                 :deletable="true"
                                 @select="handleSelectNotification"
                                 @delete="handleDeleteNotification"
                />
            </div>
            <template #no-data>
                <div class="no-data">
                    <img class="img" src="@/assets/images/illust_astronaut_radio.svg">
                    <p class="title">
                        {{ $t('COMMON.GNB.NOTIFICATION.NO_NOTIFICATION') }}
                    </p>
                    <p class="desc">
                        <span>{{ $t('COMMON.GNB.NOTIFICATION.NO_NOTIFICATION_DESC') }}</span>
                    </p>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">
import {
    computed,
    onMounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    PDataLoader,
} from '@spaceone/design-system';
import { useInfiniteScroll } from '@vueuse/core';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { TranslateResult } from 'vue-i18n';

import { store } from '@/store';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import { useProxyValue } from '@/common/composables/proxy-state';
import GNBNotiItem from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNotiItem.vue';

import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';


interface NotificationItem {
    createdAt: string;
    dateHeader?: TranslateResult | string;
    isRead: boolean;
    title?: string;
    icon: string;
    message: any;
}

const NOTIFICATION_TYPE_ICONS = {
    INFO: '',
    ERROR: 'ic_alert',
    SUCCESS: 'ic_state_active',
    WARNING: 'ic_state_duplicated',
} as const;
const NOTIFICATIONS_ITEM_LIMIT = 15;

export default {
    name: 'GNBNotificationsTab',
    components: {
        GNBNotiItem,
        PDataLoader,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    setup(props, { emit }) {
        const { i18nDayjs } = useI18nDayjs();
        const state = reactive({
            loading: true,
            timezone: computed(() => store.state.user.timezone),
            notificationItemsRef: null as HTMLElement|null,
            items: [] as NotificationItem[],
            proxyCount: useProxyValue('count', props, emit),
            pageStart: 1,
        });

        /* Util */
        const dataHeaderFormatter = (time: string, timezone: string): TranslateResult => {
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
        const getDateHeader = (createdAt: string, previousCreatedAt?: string): TranslateResult | string => {
            let beforeDataHeader;
            if (previousCreatedAt) beforeDataHeader = dataHeaderFormatter(previousCreatedAt, state.timezone);
            let dateHeader = dataHeaderFormatter(createdAt, state.timezone);
            if (beforeDataHeader && beforeDataHeader === dateHeader) dateHeader = '';
            return dateHeader;
        };
        const convertNotificationItem = (rawData: any[]) => {
            const results: NotificationItem[] = [];
            rawData.forEach((d, idx) => {
                const result: NotificationItem = {
                    dateHeader: getDateHeader(d.created_at, rawData[idx - 1]?.created_at),
                    createdAt: d.created_at,
                    isRead: d.is_read,
                    title: d.message?.title,
                    icon: NOTIFICATION_TYPE_ICONS[d.notification_type],
                    message: d.message,
                };
                results.push(result);
            });
            return results;
        };

        /* Api */
        const initApiHelper = (apiHelper: ApiQueryHelper) => {
            apiHelper
                .setPage(1, NOTIFICATIONS_ITEM_LIMIT)
                .setSort('created_at', true)
                .setFilters([
                    { k: 'created_at', v: dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'), o: '>=t' },
                    { k: 'created_at', v: dayjs().format('YYYY-MM-DD HH:mm:ss'), o: '<t' },
                    { k: 'user_id', v: store.state.user.userId, o: '=' },
                ]);
        };
        const notificationApiHelper = new ApiQueryHelper();
        initApiHelper(notificationApiHelper);
        const listNotifications = async () => {
            state.loading = true;
            try {
                const { results, total_count } = await SpaceConnector.client.notification.notification.list({
                    query: notificationApiHelper.data,
                });
                state.proxyCount = total_count;
                state.items = state.items.concat(convertNotificationItem(results));
                await setReadNotifications(results);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('COMMON.GNB.NOTIFICATION.ALT_E_LIST_NOTIFICATION'));
            } finally {
                state.loading = false;
            }
        };
        const setReadNotifications = async (notifications: any[]) => {
            const ids = notifications.filter(d => !d.is_read).map(d => d.notification_id);
            if (ids.length === 0) return;

            try {
                await SpaceConnector.client.notification.notification.setRead({
                    notifications: ids,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        /* Event */
        const loadMoreNotifications = () => {
            if (state.loading) return;
            if (state.items.length >= state.proxyCount) return;

            state.pageStart += NOTIFICATIONS_ITEM_LIMIT;
            notificationApiHelper.setPageStart(state.pageStart);
            listNotifications();
        };
        const handleSelectNotification = (notificationId: string) => {
            console.log('select!', notificationId);
        };
        const handleDeleteNotification = (notificationId: string) => {
            console.log('delete!', notificationId);
        };

        /* Init */
        const init = async () => {
            if (state.notificationItemsRef) state.notificationItemsRef.scrollTop = 0;
            state.items = [];
            state.pageStart = 1;
            initApiHelper(notificationApiHelper);
            await listNotifications();
        };

        /* Watcher */
        watch(() => props.visible, (visible) => {
            if (visible) init();
        });

        onMounted(() => {
            useInfiniteScroll(state.notificationItemsRef, () => {
                loadMoreNotifications();
            });
        });

        return {
            ...toRefs(state),
            ADMINISTRATION_ROUTE,
            handleSelectNotification,
            handleDeleteNotification,
        };
    },
};
</script>

<style lang="postcss" scoped>
.gnb-notifications-tab {
    @apply bg-white;
    display: flex;
    flex-direction: column;

    .p-data-loader::v-deep {
        &.loading {
            height: 13rem;
        }
        .data-loader-container {
            .no-data-wrapper {
                max-height: inherit;
            }
        }
    }
    .content-wrapper {
        max-height: calc(100vh - $gnb-height - 1.5rem - 2.75rem);
        overflow-y: scroll;
        padding: 0.25rem 0.5rem 0.5rem 0.5rem;
    }
    .no-data {
        text-align: center;
        padding: 4rem 3.25rem;
        .img {
            margin: auto;
            padding-bottom: 1.5rem;
        }
        .title {
            @apply text-violet-300;
            font-size: 1.125rem;
            font-weight: 700;
            opacity: 0.8;
            line-height: 1.25;
            margin-bottom: 0.25rem;
        }
        .desc {
            @apply text-gray-400;
            font-size: 0.875rem;
            line-height: 1.5;
        }
    }

    @screen mobile {
        .no-data-wrapper {
            img {
                margin-top: 2.5rem;
                max-height: 8.75rem;
            }
            .title {
                font-weight: normal;
            }
            .desc {
                span:first-of-type {
                    display: block;
                }
            }
        }
    }
}
</style>
