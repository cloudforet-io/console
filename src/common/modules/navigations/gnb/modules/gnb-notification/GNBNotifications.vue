<template>
    <div ref="containerRef" class="gnb-notifications">
        <div class="top-wrapper">
            <span class="title">{{ $t('COMMON.GNB.NOTIFICATION.TITLE') }}</span>
            <!--            <p-select-dropdown class="more-button" :items="moreMenuItems"-->
            <!--                               type="icon-button" button-icon="ic_more"-->
            <!--            />-->
            <!--            <router-link :to="{name: IDENTITY_ROUTE.USER.NOTIFICATION._NAME}"-->
            <!--                         class="inline-flex"-->
            <!--                         @click.native="$emit('click-settings')"-->
            <!--            >-->
            <!--                <p-icon-button class="settings-button" name="ic_setting" color="inherit" />-->
            <!--            </router-link>-->
        </div>
        <div class="contents-wrapper">
            <template v-if="notifications.length === 0">
                <template v-if="loading">
                    <g-n-b-notification-date-header :value="$t('COMMON.GNB.NOTIFICATION.TODAY')" class="ml-2" />
                    <div v-for="i in [0, 1]" :key="`${i}-skeleton`" class="px-4 py-2">
                        <p-skeleton height="40px" />
                    </div>
                </template>
                <div v-else class="no-data">
                    <img src="@/assets/images/illust_astronaut_radio.svg">
                    <p class="title">
                        {{ $t('COMMON.GNB.NOTIFICATION.NO_NOTIFICATION') }}
                    </p>
                    <p class="desc">
                        <span>{{ $t('COMMON.GNB.NOTIFICATION.NO_NOTI_DESC_1') }}&nbsp;</span>
                        <span>{{ $t('COMMON.GNB.NOTIFICATION.NO_NOTI_DESC_2') }}</span>
                    </p>
                </div>
            </template>
            <template v-else>
                <g-n-b-notification-item v-for="(item, i) in notifications" :key="`${item.notification_id}-${i}`"
                                         ref="notificationItemRefs"
                                         :data="item"
                                         :before-data="i === 0 ? null : notifications[i - 1]"
                />
                <div v-if="loading" class="px-4 py-2">
                    <p-skeleton height="40px" />
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
    computed, onMounted, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import {
    PSkeleton,
} from '@spaceone/design-system';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';
import { IDENTITY_ROUTE } from '@/services/identity/routes';
import { showErrorMessage } from '@/lib/helper/notice-alert-helper';
import GNBNotificationItem from '@/common/modules/navigations/gnb/modules/gnb-notification/modules/GNBNotificationItem.vue';
import GNBNotificationDateHeader from '@/common/modules/navigations/gnb/modules/gnb-notification/modules/GNBNotificationDateHeader.vue';
import dayjs from 'dayjs';


export default {
    name: 'GNBNotifications',
    components: {
        GNBNotificationDateHeader,
        GNBNotificationItem,
        PSkeleton,
    },
    setup() {
        const state = reactive({
            containerRef: null as Element|null,
            notificationItemRefs: [] as Vue[],
            loading: false,
            notifications: [],
            moreMenuItems: computed(() => [
                { name: 'delete', label: 'Delete All' },
            ]),
            timezone: computed(() => store.state.user.timezone),
        });

        const setReadNotifications = async (notifications: any[]) => {
            const ids = notifications.filter(d => !d.is_read).map(d => d.notification_id);
            if (ids.length === 0) return;

            try {
                await SpaceConnector.client.notification.notification.setRead({
                    notifications: ids,
                });
            } catch (e) {
                console.error(e);
            }
        };

        const currentTime = dayjs();
        let totalCount: number|undefined;
        let pageStart = 1;
        const pageLimit = 15;
        const notificationApiHelper = new ApiQueryHelper()
            .setPage(pageStart, pageLimit)
            .setSort('created_at', true)
            .setFilters([
                { k: 'created_at', v: currentTime.subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'), o: '>=t' },
                { k: 'created_at', v: currentTime.format('YYYY-MM-DD HH:mm:ss'), o: '<t' },
                { k: 'user_id', v: store.state.user.userId, o: '=' },
            ]);

        const listNotifications = async () => {
            if (state.loading) return;

            state.loading = true;

            try {
                const { results, total_count } = await SpaceConnector.client.notification.notification.list({
                    query: notificationApiHelper.data,
                });

                totalCount = total_count;
                state.notifications = state.notifications.concat(results);
                setReadNotifications(results);
            } catch (e) {
                console.error(e);
                showErrorMessage(i18n.t('COMMON.GNB.NOTIFICATION.ALT_E_LIST_NOTIFICATION'), e);
            } finally {
                state.loading = false;
            }
        };

        /* Intersection Observe */
        let intersectionObserver: IntersectionObserver|undefined;
        let observedElement: Element|undefined;

        const updateObservingElement = (el: Element) => {
            if (!intersectionObserver) return;

            if (observedElement) intersectionObserver.unobserve(observedElement);
            intersectionObserver.observe(el);
            observedElement = el;
        };

        const onElementObserved = (entries: IntersectionObserverEntry[]) => {
            if (state.loading) return;
            if (typeof totalCount === 'number' && state.notifications.length >= totalCount) return;

            const lastEntry = entries[entries.length - 1];
            if (!lastEntry.isIntersecting) return;

            pageStart += pageLimit;
            notificationApiHelper.setPageStart(pageStart);
            listNotifications();
        };

        onMounted(() => {
            if (!state.containerRef || intersectionObserver) return;

            intersectionObserver = new IntersectionObserver((entries) => {
                onElementObserved(entries);
            }, {
                root: state.containerRef,
                threshold: 0.6,
            });
        });

        onUnmounted(() => {
            if (intersectionObserver) {
                intersectionObserver.disconnect();
                intersectionObserver = undefined;
            }
        });

        watch(() => state.notificationItemRefs, (items) => {
            if (items.length !== state.notifications.length) return;

            const lastElement = items[items.length - 1]?.$el;
            if (lastElement) {
                updateObservingElement(lastElement);
            }
        });

        /* Init */
        (async () => {
            await listNotifications();
        })();

        return {
            ...toRefs(state),
            IDENTITY_ROUTE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.gnb-notifications {
    @apply bg-white border border-gray-200 rounded-sm;
    display: flex;
    flex-direction: column;
    max-width: 480px;
    width: 100vw;
    height: 100vh;
    max-height: calc(100vh - $gnb-height - 24px);
    overflow-y: scroll;
    .top-wrapper {
        width: 100%;
        display: flex;
        align-items: center;
        padding: 1rem 1rem 0 1rem;
        .title {
            @apply text-gray-dark;
            flex-grow: 1;
            flex-shrink: 0;
            font-size: 1rem;
            line-height: 1.6;
        }
        .more-button::v-deep {
            flex-shrink: 0;
            margin-right: 0.75rem;
            line-height: 1;
            &:not(.active) {
                .dropdown-button .dropdown-icon:not(:hover) {
                    @apply text-gray-700;
                }
            }
        }
        .settings-button {
            flex-shrink: 0;
            &:not(:hover) {
                @apply text-gray-700;
            }
        }
    }
    .contents-wrapper {
        padding: 0.25rem 0 0.5rem 0;
        line-height: 1;
        .notification-item {
            margin: 0 0.5rem;
        }
    }
    .no-data {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-items: center;
        img {
            margin-top: 130px;
            max-height: 160px;
        }
        .title {
            @apply text-violet-300;
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
            font-weight: bold;
            font-size: 1.125rem;
            line-height: 1.6;
        }
        .desc {
            @apply text-gray-400;
            font-size: 0.875rem;
            line-height: 1.6;
            text-align: center;
        }
    }

    @screen mobile {
        .no-data {
            img {
                margin-top: 40px;
                max-height: 140px;
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
