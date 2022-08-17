<template>
    <div v-click-outside="hideNotiMenu" class="gnb-notifications-notice" @click.stop
         @keydown.esc="hideNotiMenu"
    >
        <span class="menu-button" tabindex="0"
              role="button"
              @click.stop="handleNotiButtonClick"
              @keydown.enter="showNotiMenu"
        >
            <p-i class="menu-icon"
                 :name="hasNotifications ? 'ic_bell_noti' : 'ic_bell'"
                 :color="hasNotifications ? undefined : 'inherit'"
            />
        </span>
        <p-tab v-show="visible"
               :tabs="tabs"
               :active-tab.sync="activeTab"
        >
            <template #extra="tab">
                <p-badge v-if="count[tab.name] !== 0" style-type="primary3">
                    {{ commaFormatter(count[tab.name]) }}
                </p-badge>
            </template>
            <template #notifications>
                <g-n-b-notifications-tab :visible="visible && activeTab === 'notifications'"
                                         :count.sync="count.notifications"
                />
            </template>
            <template #notice>
                <g-n-b-notice-tab :count.sync="count.notice"
                                  @close="hideNotiMenu"
                />
            </template>
        </p-tab>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, onMounted, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';

import { commaFormatter } from '@spaceone/console-core-lib';
import {
    PI, PTab, PBadge,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import { vOnClickOutside } from '@vueuse/components';
import type { DirectiveFunction } from 'vue';

import { store } from '@/store';
import { i18n } from '@/translations';

import GNBNoticeTab from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNoticeTab.vue';
import GNBNotificationsTab from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNotificationsTab.vue';

interface Props {
    visible: boolean
}
export default defineComponent<Props>({
    name: 'GNBNoti',
    components: {
        GNBNoticeTab,
        PI,
        PTab,
        PBadge,
        GNBNotificationsTab,
    },
    directives: {
        clickOutside: vOnClickOutside as DirectiveFunction,
    },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            hasNotifications: computed(() => store.getters['display/hasUncheckedNotifications']),
            tabs: computed(() => ([
                { label: i18n.t('COMMON.GNB.NOTIFICATION.TITLE'), name: 'notifications', keepAlive: true },
                { label: i18n.t('COMMON.GNB.NOTICE.TITLE'), name: 'notice', keepAlive: true },
            ] as TabItem[])),
            activeTab: 'notifications',
            count: {
                notifications: 0,
                notice: 0,
            },
        });

        const setVisible = (visible: boolean) => {
            emit('update:visible', visible);
            if (visible) {
                store.dispatch('display/stopCheckNotification');
            } else {
                store.dispatch('display/startCheckNotification');
            }
        };
        const showNotiMenu = () => {
            setVisible(true);
        };
        const hideNotiMenu = () => {
            setVisible(false);
        };

        /* Event */
        const handleNotiButtonClick = () => {
            setVisible(!props.visible);
        };

        onMounted(() => {
            store.dispatch('display/startCheckNotification');
        });
        onUnmounted(() => {
            store.dispatch('display/stopCheckNotification');
        });

        watch(() => store.state.user.isSessionExpired, (isSessionExpired) => {
            if (isSessionExpired) store.dispatch('display/stopCheckNotification');
        });

        return {
            ...toRefs(state),
            showNotiMenu,
            hideNotiMenu,
            handleNotiButtonClick,
            commaFormatter,
        };
    },
});
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
