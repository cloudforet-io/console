<template>
    <div class="gnb-notifications-tab">
        <p-data-loader :data="state.items"
                       :loading="state.loading"
                       :disable-empty-case="state.loading"
        >
            <div ref="notificationItemsRef"
                 class="content-wrapper"
                 :class="{ 'loading': state.loading }"
            >
                <p-button v-if="!state.loading"
                          style-type="transparent"
                          size="sm"
                          class="clear-all-button"
                          @click="handleClearAll"
                >
                    {{ t('COMMON.CUSTOM_FIELD_MODAL.CLEAR_ALL') }}
                </p-button>
                <g-n-b-noti-item v-for="(item, idx) in state.items"
                                 :key="`${item.notificationId}-${idx}`"
                                 :is-read="item.isRead"
                                 :title="item.title"
                                 :icon="item.icon"
                                 :created-at="item ? item.createdAt : undefined"
                                 :date-header="item.dateHeader"
                                 :deletable="true"
                                 @select="handleSelectNotification(item)"
                                 @delete="handleDeleteNotification(item.notificationId)"
                />
            </div>
            <template #no-data>
                <p-empty
                    show-image
                    :title="t('COMMON.GNB.NOTIFICATION.NO_NOTIFICATION')"
                >
                    <template #image>
                        <img alt="illust_astronaut_radio"
                             src="@/assets/images/illust_astronaut_radio.svg"
                        >
                    </template>
                    {{ t('COMMON.GNB.NOTIFICATION.NO_NOTIFICATION_DESC') }}
                </p-empty>
            </template>
        </p-data-loader>
        <p-button-modal v-model:visible="state.modalVisible"
                        class="notification-modal"
                        size="md"
                        hide-header-close-button
                        hide-footer-close-button
                        @confirm="handleCloseNotificationModal"
        >
            <template #header>
                <div class="header-wrapper">
                    <p-i v-if="state.selectedItem.icon"
                         :name="state.selectedItem.icon"
                         width="1.5rem"
                         class="icon"
                         :color="state.selectedItem.iconColor"
                    />
                    <span>{{ state.selectedItem.title }}</span>
                </div>
            </template>
            <template #body>
                <div class="meta-data-wrapper">
                    <div>
                        <b>{{ t('COMMON.GNB.NOTICE.OCCURED_TIME') }} </b>
                        <span>{{ iso8601Formatter(state.selectedItem.createdAt, state.timezone) }}</span>
                    </div>
                    <div v-if="state.selectedItem.message.link">
                        <b>{{ t('COMMON.GNB.NOTICE.DETAIL_LINK') }} </b>
                        <p-anchor :href="state.selectedItem.message.link">
                            {{ state.selectedItem.message.link }}
                        </p-anchor>
                    </div>
                </div>
                <div v-if="state.selectedItem.message.description"
                     class="description-wrapper"
                >
                    {{ state.selectedItem.message.description }}
                </div>
                <div v-if="state.definitionData">
                    <p-definition-table :fields="state.definitionFields"
                                        :data="state.definitionData"
                                        :skeleton-rows="4"
                                        block
                                        disable-copy
                    />
                </div>
            </template>
            <template #confirm-button>
                {{ t('APP.MAIN.CLOSE') }}
            </template>
        </p-button-modal>
    </div>
</template>

<script lang="ts" setup>
import { iso8601Formatter } from '@cloudforet/core-lib';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PDataLoader, PButtonModal, PI, PAnchor, PDefinitionTable, PButton, PEmpty,
} from '@spaceone/design-system';
import { useInfiniteScroll } from '@vueuse/core';
import type { CancelTokenSource } from 'axios';
import axios from 'axios';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import {
    computed,
    onMounted, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import { useProxyValue } from '@/common/composables/proxy-state';
import GNBNotiItem from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNotiItem.vue';
import { NOTIFICATION_TYPE_ICONS } from '@/common/modules/navigations/gnb/modules/gnb-noti/type';

import { safe } from '@/styles/colors';

interface NotificationItem {
    notificationId: string;
    createdAt: string;
    dateHeader?: string;
    isRead: boolean;
    title?: string;
    icon: string;
    iconColor?: string;
    message: any;
}

const NOTIFICATIONS_ITEM_LIMIT = 15;

interface Props {
    visible: boolean;
    count: number;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    count: 0,
});
const emit = defineEmits<{(e: 'update:count', value: number): void}>();
const store = useStore();
const { t } = useI18n();

const { i18nDayjs } = useI18nDayjs();
const state = reactive({
    loading: true,
    timezone: computed(() => store.state.user.timezone),
    notificationItemsRef: null as HTMLElement|null,
    items: [] as NotificationItem[],
    proxyCount: useProxyValue('count', props, emit),
    pageStart: 1,
    //
    modalVisible: false,
    selectedItem: {} as NotificationItem,
    definitionFields: computed(() => state.selectedItem?.message?.tags.map((d) => ({
        name: d.key, label: d.key,
    }))),
    definitionData: computed(() => {
        const result = {};
        if (Array.isArray(state.selectedItem?.message?.tags)) {
            state.selectedItem.message.tags.forEach((d) => {
                result[d.key] = d.value;
            });
        }
        return result;
    }),
});

/* Util */
const dataHeaderFormatter = (time: string, timezone: string): string => {
    if (!time) return '';

    const occurredTime: Dayjs = i18nDayjs.value.tz(i18nDayjs.value(time), timezone);
    const now: Dayjs = i18nDayjs.value.tz(i18nDayjs.value(), timezone);

    if (occurredTime.isSame(now, 'day')) {
        return t('COMMON.GNB.NOTIFICATION.TODAY');
    }
    if (now.subtract(1, 'day').isSame(occurredTime, 'day')) {
        return t('COMMON.GNB.NOTIFICATION.YESTERDAY');
    }
    return occurredTime.from(now);
};
const getDateHeader = (createdAt: string, previousCreatedAt?: string): string => {
    let beforeDataHeader;
    if (previousCreatedAt) beforeDataHeader = dataHeaderFormatter(previousCreatedAt, state.timezone);
    let dateHeader = dataHeaderFormatter(createdAt, state.timezone);
    if (beforeDataHeader && beforeDataHeader === dateHeader) dateHeader = '';
    return dateHeader;
};
const convertNotificationItem = (rawData: any[]) => {
    const results: NotificationItem[] = [];
    rawData.forEach((d, idx) => {
        let previousCreatedAt = rawData[idx - 1]?.created_at;
        if (idx === 0) previousCreatedAt = state.items[state.items.length - 1]?.createdAt;
        const result: NotificationItem = {
            notificationId: d.notification_id,
            dateHeader: getDateHeader(d.created_at, previousCreatedAt),
            createdAt: d.created_at,
            isRead: d.is_read,
            title: d.message?.title,
            icon: NOTIFICATION_TYPE_ICONS[d.notification_type],
            iconColor: d.notification_type === 'SUCCESS' ? safe : undefined,
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
let listNotificationApiToken: CancelTokenSource | undefined;
const listNotifications = async () => {
    if (listNotificationApiToken) {
        listNotificationApiToken.cancel();
        listNotificationApiToken = undefined;
    }

    state.loading = true;
    listNotificationApiToken = axios.CancelToken.source();
    try {
        const { results, total_count } = await SpaceConnector.client.notification.notification.list({
            query: notificationApiHelper.data,
        }, {
            cancelToken: listNotificationApiToken.token,
        });
        listNotificationApiToken = undefined;
        state.proxyCount = total_count;
        state.items = state.items.concat(convertNotificationItem(results));
        await setReadNotifications(results);

        // update last read
        await store.commit('settings/setGnbNotificationLastReadTime', dayjs.utc().toISOString(), { root: true });
    } catch (e: any) {
        if (!axios.isCancel(e.axiosError)) {
            ErrorHandler.handleRequestError(e, t('COMMON.GNB.NOTIFICATION.ALT_E_LIST_NOTIFICATION'));
        }
    } finally {
        state.loading = false;
    }
};
const setReadNotifications = async (notifications: any[]) => {
    const ids = notifications.filter((d) => !d.is_read).map((d) => d.notification_id);
    if (ids.length === 0) return;

    try {
        await SpaceConnector.client.notification.notification.setRead({
            notifications: ids,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const deleteNotification = async (notificationIds: string[]): Promise<boolean> => {
    try {
        await SpaceConnector.client.notification.notification.delete({
            notifications: notificationIds,
        });
        state.items = state.items.filter((d) => !notificationIds.includes(d.notificationId));
        state.proxyCount -= notificationIds.length;
        return true;
    } catch (e) {
        ErrorHandler.handleError(e);
        return false;
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
const handleSelectNotification = (notificationItem: NotificationItem) => {
    state.selectedItem = notificationItem;
    state.modalVisible = true;
};
const handleDeleteNotification = async (notificationId: string) => {
    const deletedIndex = state.items.findIndex((d) => d.notificationId === notificationId);
    const deleted = await deleteNotification([notificationId]);
    if (deleted) {
        const item = state.items[deletedIndex];
        const previousItem = state.items[deletedIndex - 1];
        item.dateHeader = getDateHeader(item.createdAt, previousItem?.createdAt);
    }
};
const handleCloseNotificationModal = () => {
    state.selectedItem = {};
    state.modalVisible = false;
};
const handleClearAll = async () => {
    const notificationIds = state.items.map((d) => d.notificationId);
    const deleted = await deleteNotification(notificationIds);
    if (deleted) await init();
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
    else if (listNotificationApiToken) {
        listNotificationApiToken.cancel();
        listNotificationApiToken = undefined;
    }
}, { immediate: true });

onMounted(() => {
    useInfiniteScroll(state.notificationItemsRef, () => {
        loadMoreNotifications();
    });
});

</script>

<style lang="postcss" scoped>
.gnb-notifications-tab {
    @apply bg-white;
    display: flex;
    flex-direction: column;
    min-height: 13rem;

    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
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
        &.loading {
            min-height: 13rem;
        }
        max-height: calc(100vh - $gnb-height - 1.5rem - 2.75rem);
        position: relative;
        overflow-y: scroll;
        padding: 0.25rem 0.5rem 0.5rem;

        .clear-all-button {
            position: absolute;
            top: 0.75rem;
            right: 0.5rem;
        }
    }
    .notification-modal {
        .header-wrapper {
            display: flex;
            align-items: flex-start;
            font-size: 1.375rem;
            line-height: 1.25;
            margin-bottom: 1rem;
            .icon {
                min-width: 1.5rem;
                margin-right: 0.5rem;
                margin-top: 0.25rem;
            }
        }
        .meta-data-wrapper {
            display: grid;
            gap: 0.25rem;
            font-size: 12px;
            line-height: 1.25;
            margin-bottom: 1.375rem;
        }
        .description-wrapper {
            @apply bg-violet-100;
            font-size: 0.875rem;
            line-height: 1.5;
            padding: 0.75rem 1rem;
            margin-bottom: 0.75rem;
        }
    }
}

/* custom design-system component - p-empty */
:deep(.p-empty) {
    text-align: center;
    padding: 4rem 3.25rem;
}
</style>
