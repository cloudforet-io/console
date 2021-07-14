<template>
    <div class="gnb-notifications">
        <div class="top-wrapper">
            <span class="title">{{ $t('COMMON.GNB.NOTIFICATION.TITLE') }}</span>
            <p-select-dropdown class="more-button" :items="moreMenuItems"
                               button-only button-icon="ic_more"
            />
            <p-icon-button class="settings-button" name="ic_setting" color="inherit" />
        </div>
        <div class="contents-wrapper">
            <template v-if="loading">
                <g-n-b-notification-date-header datetime="Today" class="ml-2" />
                <div v-for="i in [0, 1]" :key="`${i}-skeleton`" class="px-4 py-2">
                    <p-skeleton height="40px" />
                </div>
            </template>
            <div v-else-if="notifications.length === 0" class="no-data">
                <img src="@/assets/images/illust_astronaut_radio.svg">
                <p class="title">
                    {{ $t('COMMON.GNB.NOTIFICATION.NO_NOTIFICATION') }}
                </p>
                <p class="desc">
                    <span>{{ $t('COMMON.GNB.NOTIFICATION.NO_NOTI_DESC_1') }}&nbsp;</span>
                    <span>{{ $t('COMMON.GNB.NOTIFICATION.NO_NOTI_DESC_2') }}</span>
                </p>
            </div>
            <template v-else>
                <g-n-b-notification-item v-for="(item, i) in notifications" :key="i"
                                         :data="item"
                                         :before-data="i === 0 ? null : notifications[i - 1]"
                />
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';
import {
    PIconButton, PSkeleton, PSelectDropdown,
} from '@spaceone/design-system';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';

import GNBNotificationItem from '@/common/modules/gnb/GNBNotificationItem.vue';
import GNBNotificationDateHeader from '@/common/modules/gnb/GNBNotificationDateHeader.vue';
import { showErrorMessage } from '@/lib/helper/notice-alert-helper';
import { i18n } from '@/translations';

export default {
    name: 'GNBNotifications',
    components: {
        GNBNotificationDateHeader,
        GNBNotificationItem,
        PSkeleton,
        PSelectDropdown,
        PIconButton,
    },
    setup(props, { root }) {
        const state = reactive({
            loading: false,
            notifications: [],
            moreMenuItems: computed(() => [
                { name: 'delete', label: 'Delete All' },
            ]),
        });

        const setReadNotifications = async (notifications: any[]) => {
            try {
                await SpaceConnector.client.notification.notification.setRead({
                    notifications: notifications.filter(d => !d.is_read).map(d => d.notification_id),
                }, {
                    headers: {
                        MOCK_MODE: true,
                    },
                });
            } catch (e) {
                console.error(e);
            }
        };

        const notificationApiHelper = new ApiQueryHelper();
        const notificationApiQuery = notificationApiHelper.data;
        const listNotifications = async () => {
            if (state.loading) return;

            state.loading = true;

            try {
                const { results } = await SpaceConnector.client.notification.notification.list({
                    query: notificationApiQuery,
                }, {
                    headers: {
                        MOCK_MODE: true,
                    },
                });
                state.notifications = results;
                setReadNotifications(results);
            } catch (e) {
                state.notifications = [];
                console.error(e);
                showErrorMessage(i18n.t('COMMON.GNB.NOTIFICATION.ALT_E_LIST_NOTIFICATION'), e, root);
            } finally {
                state.loading = false;
            }
        };

        /* Init */
        (async () => {
            await listNotifications();
        })();

        return {
            ...toRefs(state),
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
    padding-bottom: 0.5rem;
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
        flex-grow: 1;
        overflow-y: auto;
        height: 100%;
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
