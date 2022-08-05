<template>
    <div class="gnb-notifications-notice" @click.stop>
        <span class="menu-button" tabindex="0">
            <p-i class="menu-icon"
                 :name="hasNotifications ? 'ic_bell_noti' : 'ic_bell'"
                 :color="hasNotifications ? undefined : 'inherit'"
                 @click.stop="handleClickButton"
            />
        </span>
        <p-tab v-show="proxyVisibleDropdown"
               :tabs="tabs"
               :active-tab.sync="activeTab"
        >
            <template #extra="tab">
                <p-badge v-if="count[tab.name] !== 0" style-type="primary3">
                    {{ commaFormatter(count[tab.name]) }}
                </p-badge>
            </template>
            <template #notifications>
                <g-n-b-notifications-tab :visible="proxyVisibleDropdown && activeTab === 'notifications'"
                                         :count.sync="count.notifications"
                />
            </template>
            <template #notice>
                <g-n-b-notice-tab :count.sync="count.notice"
                                  @close="handleCloseDropdown"
                />
            </template>
        </p-tab>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import { commaFormatter } from '@spaceone/console-core-lib';
import {
    PI, PTab, PBadge,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';

import { store } from '@/store';

import { useProxyValue } from '@/common/composables/proxy-state';
import GNBNoticeTab from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNoticeTab.vue';
import GNBNotificationsTab from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNotificationsTab.vue';


export default {
    name: 'GNBNoti',
    components: {
        GNBNoticeTab,
        PI,
        PTab,
        PBadge,
        GNBNotificationsTab,
    },
    props: {
        visibleDropdown: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisibleDropdown: useProxyValue('visibleDropdown', props, emit),
            hasNotifications: computed(() => store.getters['display/hasUncheckedNotifications']),
            tabs: computed(() => ([
                // song-lang
                { label: 'Notifications', name: 'notifications', keepAlive: true },
                { label: 'Notice', name: 'notice', keepAlive: true },
            ] as TabItem[])),
            activeTab: 'notifications',
            count: {
                notifications: 0,
                notice: 0,
            },
        });

        /* Event */
        const handleClickButton = () => {
            state.proxyVisibleDropdown = !state.proxyVisibleDropdown;
        };
        const handleCloseDropdown = () => {
            state.proxyVisibleDropdown = false;
        };

        return {
            ...toRefs(state),
            handleClickButton,
            handleCloseDropdown,
            commaFormatter,
        };
    },
};
</script>
<style lang="postcss" scoped>
.gnb-notifications-notice {
    position: relative;

    .menu-button {
        @apply text-gray-500;
        line-height: $gnb-height;
        cursor: pointer;
        margin-left: 1.25rem;

        &.opened {
            @apply text-violet-400;
        }

        @media (hover: hover) {
            &:hover {
                @apply text-violet-400;
            }
        }
    }
    .p-tab::v-deep {
        @apply absolute bg-white rounded-xs border border-gray-200;
        display: flex;
        flex-direction: column;
        width: 30rem;
        min-height: auto;
        top: 100%;
        right: 0;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
        margin-top: -0.5rem;
        margin-right: -0.5rem;
        .tab-pane {
            padding-bottom: 0;
        }
    }
}
</style>
