<template>
    <div v-click-outside="hideNotiMenu"
         class="gnb-notifications-notice"
         @click.stop
         @keydown.esc="hideNotiMenu"
    >
        <span class="menu-button"
              tabindex="0"
              role="button"
              @click.stop="handleNotiButtonClick"
              @keydown.enter="showNotiMenu"
        >
            <p-i class="menu-icon"
                 :class="{ disabled: isNoRoleUser }"
                 :name="hasNotifications ? 'ic_gnb_bell-unread' : 'ic_gnb_bell'"
                 :color="hasNotifications ? undefined : 'inherit'"
            />
        </span>
        <p-tab v-show="visible"
               :tabs="tabs"
               :active-tab.sync="activeTab"
        >
            <template #extra="tab">
                <p-badge v-if="count[tab.name] !== 0"
                         :style-type="tab.name === activeTab ? 'primary3' : 'gray200'"
                         badge-type="subtle"
                >
                    {{ commaFormatter(count[tab.name]) }}
                </p-badge>
            </template>
            <template #notifications>
                <g-n-b-notifications-tab :visible="visible && activeTab === 'notifications'"
                                         :count.sync="notificationCount"
                />
            </template>
            <template #notice>
                <g-n-b-notice-tab @close="hideNotiMenu" />
            </template>
        </p-tab>
    </div>
</template>

<script lang="ts">

import { vOnClickOutside } from '@vueuse/components';
import { useDocumentVisibility } from '@vueuse/core';
import {
    computed, defineComponent, onMounted, onUnmounted, reactive, toRefs, watch,
} from 'vue';
import type { DirectiveFunction, SetupContext } from 'vue';

import {
    PI, PTab, PBadge,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { commaFormatter } from '@cloudforet/core-lib';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useNoticeStore } from '@/store/notice';

import GNBNoticeTab from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNoticeTab.vue';
import GNBNotificationsTab from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNotificationsTab.vue';

import { NOTICE_POST_TYPE } from '@/services/info/notice/config';

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
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            hasNotifications: computed(() => store.getters['display/hasUncheckedNotifications'] || unreadNoticeCount.value > 0),
            domainName: computed(() => store.state.domain.name),
            isNoRoleUser: computed<boolean>(() => store.getters['user/isNoRoleUser']),
            tabs: computed(() => ([
                { label: i18n.t('COMMON.GNB.NOTIFICATION.TITLE'), name: 'notifications', keepAlive: true },
                { label: i18n.t('COMMON.GNB.NOTICE.TITLE'), name: 'notice', keepAlive: true },
            ] as TabItem[])),
            activeTab: 'notifications',
            notificationCount: 0,
            count: computed(() => ({
                notifications: state.notificationCount,
                notice: unreadNoticeCount.value,
            })),
        });

        /* Util */
        const setVisible = (visible: boolean) => {
            emit('update:visible', visible);
            if (visible) {
                store.dispatch('display/stopCheckNotification');
            } else {
                store.dispatch('display/startCheckNotification');
            }
        };
        const showNotiMenu = () => {
            if (!props.visible) setVisible(true);
        };
        const hideNotiMenu = () => {
            if (props.visible) setVisible(false);
        };

        /* Api */
        const noticeApiHelper = new ApiQueryHelper().setCountOnly();
        if (state.domainName === 'root') {
            noticeApiHelper.setFilters([{ k: 'post_type', v: NOTICE_POST_TYPE.SYSTEM, o: '=' }]);
        }

        const {
            unreadNoticeCount, fetchNoticeCount, fetchNoticeReadState,
        } = useNoticeStore({
            userId: computed(() => store.state.user.userId),
        });

        const documentVisibility = useDocumentVisibility();
        watch(documentVisibility, (visibility) => {
            if (visibility === 'hidden') {
                store.dispatch('display/stopCheckNotification');
            } else {
                store.dispatch('display/startCheckNotification');
            }
        }, { immediate: true });

        /* Event */
        const handleNotiButtonClick = () => {
            if (state.isNoRoleUser) return;
            setVisible(!props.visible);
        };

        onMounted(() => {
            store.dispatch('display/startCheckNotification');
            fetchNoticeReadState();
            fetchNoticeCount();
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
            unreadNoticeCount,
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

        .disabled {
            cursor: not-allowed;
        }
    }

    /* custom design-system component - p-tab */
    :deep(.p-tab) {
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
