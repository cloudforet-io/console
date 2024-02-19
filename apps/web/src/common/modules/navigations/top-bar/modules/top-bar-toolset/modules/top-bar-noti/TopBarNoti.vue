<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import { useDocumentVisibility } from '@vueuse/core';
import {
    computed, onMounted, onUnmounted, reactive, watch,
} from 'vue';

import {
    PI, PTab, PBadge,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { numberFormatter } from '@cloudforet/utils';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useNoticeStore } from '@/store/notice';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';
import TopBarNoticeTab from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-noti/modules/TopBarNoticeTab.vue';
import TopBarNotificationsTab
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-noti/modules/TopBarNotificationsTab.vue';



interface Props {
    visible: boolean
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();

interface CountInfo {
  notifications: number;
  notice: number;
}
const state = reactive({
    hasNotifications: computed(() => store.getters['display/hasUncheckedNotifications'] || noticeGetters.unreadNoticeCount > 0),
    isNoRoleUser: computed<boolean>(() => store.getters['user/isNoRoleUser']),
    tabs: computed(() => ([
        { label: i18n.t('COMMON.GNB.NOTIFICATION.TITLE'), name: 'notifications', keepAlive: true },
        { label: i18n.t('COMMON.GNB.NOTICE.TITLE'), name: 'notice', keepAlive: true },
    ] as TabItem[])),
    activeTab: 'notifications',
    notificationCount: 0,
    count: computed<CountInfo>(() => ({
        notifications: state.notificationCount,
        notice: noticeGetters.unreadNoticeCount,
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
const noticeStore = useNoticeStore();
const noticeGetters = noticeStore.getters;

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
    noticeStore.fetchNoticeReadState();
});
const { callApiWithGrantGuard } = useGrantScopeGuard(['WORKSPACE'], noticeStore.fetchNoticeCount);
callApiWithGrantGuard();


onUnmounted(() => {
    store.dispatch('display/stopCheckNotification');
});

watch(() => store.state.user.isSessionExpired, (isSessionExpired) => {
    if (isSessionExpired) {
        store.dispatch('display/stopCheckNotification');
        noticeStore.reset();
    }
});

</script>

<template>
    <div v-on-click-outside="hideNotiMenu"
         class="top-bar-notifications-notice"
         @click.stop
         @keydown.esc="hideNotiMenu"
    >
        <span :class="{'menu-button': true, 'opened': visible}"
              tabindex="0"
              role="button"
              @click.stop="handleNotiButtonClick"
              @keydown.enter="showNotiMenu"
        >
            <p-i class="menu-icon"
                 :class="{ disabled: state.isNoRoleUser }"
                 :name="state.hasNotifications ? 'ic_gnb_bell-unread' : 'ic_gnb_bell'"
                 :color="state.hasNotifications ? undefined : 'inherit'"
                 width="1.375rem"
                 height="1.375rem"
            />
        </span>
        <p-tab v-show="visible"
               :tabs="state.tabs"
               :active-tab.sync="state.activeTab"
        >
            <template #extra="tab">
                <p-badge v-if="!!state.count[tab.name]"
                         :style-type="tab.name === state.activeTab ? 'primary3' : 'gray200'"
                         badge-type="subtle"
                >
                    {{ numberFormatter((state.count[tab.name])) }}
                </p-badge>
            </template>
            <template #notifications>
                <top-bar-notifications-tab :visible="props.visible && state.activeTab === 'notifications'"
                                           :count.sync="state.notificationCount"
                />
            </template>
            <template #notice>
                <top-bar-notice-tab @close="hideNotiMenu" />
            </template>
        </p-tab>
    </div>
</template>

<style lang="postcss" scoped>
.top-bar-notifications-notice {
    position: relative;

    .menu-button {
        @apply inline-flex items-center justify-center text-gray-500 rounded-full;
        width: 2rem;
        height: 2rem;
        line-height: $top-bar-height;
        cursor: pointer;

        &:hover {
            @apply text-blue-600 bg-blue-100;
        }

        &.opened {
            @apply text-blue-600 bg-blue-200;
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
        z-index: 1000;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
        margin-right: -0.5rem;
        .tab-pane {
            padding-bottom: 0;
        }
    }
}
</style>
