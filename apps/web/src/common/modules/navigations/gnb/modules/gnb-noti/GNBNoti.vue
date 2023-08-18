<template>
    <div ref="containerRef"
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
                 :class="{ disabled: state.isNoRoleUser }"
                 :name="state.hasNotifications ? 'ic_gnb_bell-unread' : 'ic_gnb_bell'"
                 :color="state.hasNotifications ? undefined : 'inherit'"
            />
        </span>
        <p-tab v-show="visible"
               v-model:active-tab="state.activeTab"
               :tabs="state.tabs"
        >
            <template #extra="tab">
                <p-badge v-if="state.count[tab.name] !== 0"
                         :style-type="tab.name === state.activeTab ? 'primary3' : 'gray200'"
                         badge-type="subtle"
                >
                    {{ commaFormatter(state.count[tab.name]) }}
                </p-badge>
            </template>
            <template #notifications>
                <g-n-b-notifications-tab v-model:count="state.notificationCount"
                                         :visible="visible && state.activeTab === 'notifications'"
                />
            </template>
            <template #notice>
                <g-n-b-notice-tab @close="hideNotiMenu" />
            </template>
        </p-tab>
    </div>
</template>

<script lang="ts" setup>

import { commaFormatter } from '@cloudforet/core-lib';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PI, PTab, PBadge,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';
import { onClickOutside, useDocumentVisibility } from '@vueuse/core';
import type { MaybeRef } from 'vue';
import {
    computed, onMounted, onUnmounted, reactive, ref, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import { useNoticeStore } from '@/store/notice';

import GNBNoticeTab from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNoticeTab.vue';
import GNBNotificationsTab from '@/common/modules/navigations/gnb/modules/gnb-noti/modules/GNBNotificationsTab.vue';

import { NOTICE_POST_TYPE } from '@/services/info/notice/config';



interface Props {
    visible: boolean
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();
const store = useStore();
const { t } = useI18n();

const containerRef = ref<HTMLElement|null>(null);
const state = reactive({
    hasNotifications: computed(() => store.getters['display/hasUncheckedNotifications'] || unreadNoticeCount.value > 0),
    domainName: computed(() => store.state.domain.name),
    isNoRoleUser: computed<boolean>(() => store.getters['user/isNoRoleUser']),
    tabs: computed(() => ([
        { label: t('COMMON.GNB.NOTIFICATION.TITLE'), name: 'notifications', keepAlive: true },
        { label: t('COMMON.GNB.NOTICE.TITLE'), name: 'notice', keepAlive: true },
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

onClickOutside(containerRef as MaybeRef, hideNotiMenu);

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
