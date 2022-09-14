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
                 :class="{ disabled: isNoRoleUser }"
                 :name="hasNotifications ? 'ic_bell_noti' : 'ic_bell'"
                 :color="hasNotifications ? undefined : 'inherit'"
            />
        </span>
        <p-tab v-show="visible"
               :tabs="tabs"
               :active-tab.sync="activeTab"
        >
            <template #extra="tab">
                <p-badge v-if="count[tab.name] !== 0" :style-type="tab.name === activeTab ? 'primary3' : 'gray200'">
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

import { commaFormatter } from '@spaceone/console-core-lib';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    PI, PTab, PBadge,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import { vOnClickOutside } from '@vueuse/components';
import {
    computed, defineComponent, onMounted, onUnmounted, reactive, toRefs, watch,
} from 'vue';
import type { DirectiveFunction, SetupContext } from 'vue';

import { store } from '@/store';
import { i18n } from '@/translations';

import { getNoticeBoardId } from '@/lib/helper/notice-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
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
            hasNotifications: computed(() => store.getters['display/hasUncheckedNotifications']),
            domainName: computed(() => store.state.domain.name),
            isNoRoleUser: computed<boolean>(() => store.getters['user/isNoRoleUser']),
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
            setVisible(true);
        };
        const hideNotiMenu = () => {
            setVisible(false);
        };

        /* Api */
        const noticeApiHelper = new ApiQueryHelper().setCountOnly();
        if (state.domainName === 'root') {
            noticeApiHelper.setFilters([{ k: 'post_type', v: NOTICE_POST_TYPE.SYSTEM, o: '=' }]);
        }
        const listNotice = async () => {
            try {
                const boardId = await getNoticeBoardId();
                const { total_count } = await SpaceConnector.client.board.post.list({
                    board_id: boardId,
                    query: noticeApiHelper.data,
                    domain_id: null,
                });
                state.count.notice = total_count;
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('COMMON.GNB.NOTIFICATION.ALT_E_LIST_NOTIFICATION'));
                state.count.notice = 0;
            }
        };

        /* Event */
        const handleNotiButtonClick = () => {
            if (state.isNoRoleUser) return;
            setVisible(!props.visible);
        };

        onMounted(() => {
            store.dispatch('display/startCheckNotification');
            listNotice();
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

        .disabled {
            cursor: not-allowed;
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
