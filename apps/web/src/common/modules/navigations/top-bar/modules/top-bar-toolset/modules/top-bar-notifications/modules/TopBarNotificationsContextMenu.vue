<script setup lang="ts">
import { useInfiniteScroll } from '@vueuse/core';
import {
    computed,
    onMounted, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { getCancellableFetcher } from '@cloudforet/core-lib/space-connector/cancellable-fetcher';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PDataLoader, PButtonModal, PI, PLink, PDefinitionTable, PButton, PEmpty, PTextBeautifier,
} from '@cloudforet/mirinae';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { NotificationDeleteParameters } from '@/schema/notification/notification/api-verbs/delete';
import type { NotificationListParameters } from '@/schema/notification/notification/api-verbs/list';
import type { NotificationSetReadParameters } from '@/schema/notification/notification/api-verbs/set-read';
import type { NotificationModel } from '@/schema/notification/notification/model';
import { i18n } from '@/translations';

import { useDisplayStore } from '@/store/display/display-store';
import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useI18nDayjs } from '@/common/composables/i18n-dayjs';
import { useProxyValue } from '@/common/composables/proxy-state';
import TopBarNotiItem from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-notice/modules/TopBarNotiItem.vue';
import {
    NOTIFICATION_TYPE_ICONS,
} from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-notifications/type';

import { safe } from '@/styles/colors';

interface NotificationItem {
    notificationId: string;
    createdAt: string;
    dateHeader?: TranslateResult | string;
    isRead: boolean;
    title?: string;
    icon: string;
    iconColor?: string;
    message: any;
}

const NOTIFICATIONS_ITEM_LIMIT = 15;

const props = withDefaults(defineProps<{
    visible?: boolean;
    count?: number;
}>(), {
    visible: false,
    count: 0,
});

const emit = defineEmits<{(e: 'update:visible', value: boolean): void;
}>();
const { i18nDayjs } = useI18nDayjs();

const userStore = useUserStore();
const displayStore = useDisplayStore();

const state = reactive({
    loading: true,
    timezone: computed(() => userStore.state.timezone),
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
            { k: 'user_id', v: userStore.state.userId, o: '=' },
        ]);
};
const notificationApiHelper = new ApiQueryHelper();
initApiHelper(notificationApiHelper);
const fetcher = getCancellableFetcher<NotificationListParameters, ListResponse<NotificationModel>>(SpaceConnector.clientV2.notification.notification.list);
const listNotifications = async () => {
    state.loading = true;
    try {
        const { status, response } = await fetcher({
            query: notificationApiHelper.data,
        });
        if (status === 'succeed') {
            state.proxyCount = response.total_count;
            state.items = state.items.concat(convertNotificationItem(response.results ?? []));
            await setReadNotifications(response.results ?? []);
            // update last read
            displayStore.updateGnbNotificationLastReadTime(dayjs.utc().toISOString());
        }
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('COMMON.GNB.NOTIFICATION.ALT_E_LIST_NOTIFICATION'));
    } finally {
        state.loading = false;
    }
};
const setReadNotifications = async (notifications: any[]) => {
    const ids = notifications.filter((d) => !d.is_read).map((d) => d.notification_id);
    if (ids.length === 0) return;

    try {
        await SpaceConnector.clientV2.notification.notification.setRead<NotificationSetReadParameters>({
            notifications: ids,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};
const deleteNotification = async (notificationIds: string[]): Promise<boolean> => {
    try {
        await SpaceConnector.clientV2.notification.notification.delete<NotificationDeleteParameters>({
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
}, { immediate: true });

onMounted(() => {
    useInfiniteScroll(state.notificationItemsRef, () => {
        loadMoreNotifications();
    });
});
</script>

<template>
    <div class="top-bar-notifications-context-menu">
        <p-data-loader :data="state.items"
                       :loading="state.loading"
                       :disable-empty-case="state.loading"
        >
            <div ref="notificationItemsRef"
                 class="content-wrapper"
                 :class="{ loading: state.loading }"
            >
                <p-button v-if="!state.loading"
                          style-type="transparent"
                          size="sm"
                          class="clear-all-button"
                          @click="handleClearAll"
                >
                    {{ $t('COMMON.CUSTOM_FIELD_MODAL.CLEAR_ALL') }}
                </p-button>
                <top-bar-noti-item v-for="(item, idx) in state.items"
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
                    :title="$t('COMMON.GNB.NOTIFICATION.NO_NOTIFICATION')"
                >
                    <template #image>
                        <img alt="illust_astronaut_radio"
                             src="@/assets/images/illust_astronaut_radio.svg"
                        >
                    </template>
                    {{ $t('COMMON.GNB.NOTIFICATION.NO_NOTIFICATION_DESC') }}
                </p-empty>
            </template>
        </p-data-loader>
        <p-button-modal class="notification-modal"
                        size="md"
                        :visible.sync="state.modalVisible"
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
                        <b>{{ $t('COMMON.GNB.NOTICE.OCCURED_TIME') }} </b>
                        <span>{{ iso8601Formatter(state.selectedItem.createdAt, state.timezone) }}</span>
                    </div>
                    <div v-if="state.selectedItem.message.link">
                        <b>{{ $t('COMMON.GNB.NOTICE.DETAIL_LINK') }} </b>
                        <p-link :href="state.selectedItem.message.link"
                                action-icon="external-link"
                                class="detail-link"
                        >
                            {{ state.selectedItem.message.link }}
                        </p-link>
                    </div>
                </div>
                <div v-if="state.selectedItem.message.description"
                     class="description-wrapper"
                >
                    <p-text-beautifier :value="state.selectedItem.message.description" />
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
                {{ $t('APP.MAIN.CLOSE') }}
            </template>
        </p-button-modal>
    </div>
</template>

<style lang="postcss" scoped>
.top-bar-notifications-context-menu {
    @apply bg-white;
    display: flex;
    flex-direction: column;
    min-height: 13rem;

    /* custom design-system component - p-link */
    .detail-link:deep {
        > a {
            display: inline;
        }
    }

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
        max-height: calc(100vh - $top-bar-height - 1.5rem);
        position: relative;
        overflow-y: auto;
        padding: 0.25rem 0.5rem 0.5rem 0.5rem;

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
            white-space: pre-line;
        }
    }
}

/* custom design-system component - p-empty */
:deep(.p-empty) {
    text-align: center;
    padding: 4rem 3.25rem;
}
</style>
