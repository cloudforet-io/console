<template>
    <div class="gnb-notifications">
        <div class="top-wrapper">
            <span class="title">Notifications</span>
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
                    No Notifications
                </p>
                <p class="desc">
                    <span>When you get notifications, </span>
                    <span>they'll show up here.</span>
                </p>
            </div>
            <template v-else>
                <g-n-b-notification-item v-for="(item, i) in notifications" :key="i"
                                         :date-header="item.dateHeader"
                                         :is-new="item.isNew"
                                         :link="item.link"
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
import GNBNotificationItem from '@/common/modules/gnb/GNBNotificationItem.vue';
import GNBNotificationDateHeader from '@/common/modules/gnb/GNBNotificationDateHeader.vue';

export default {
    name: 'GNBNotifications',
    components: {
        GNBNotificationDateHeader,
        GNBNotificationItem,
        PSkeleton,
        PSelectDropdown,
        PIconButton,
    },
    setup() {
        const state = reactive({
            loading: false,
            // notifications: [],
            notifications: [
                { isNew: true, dateHeader: 'Today' },
                { isNew: true, link: 'http://www.naver.com', dateHeader: 'Yesterday' },
                { isNew: true },
                { dateHeader: 'Last 7 days' },
                {}, {}],
            moreMenuItems: computed(() => [
                { name: 'delete', label: 'Delete All' },
            ]),
        });
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
