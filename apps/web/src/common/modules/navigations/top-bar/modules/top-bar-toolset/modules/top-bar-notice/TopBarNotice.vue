<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PI, PTooltip,
} from '@spaceone/design-system';

import { store } from '@/store';

import { useNoticeStore } from '@/store/notice';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';
import TopBarNoticeContextMenu
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-notice/modules/TopBarNoticeContextMenu.vue';


interface Props {
    visible: boolean
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();

const noticeStore = useNoticeStore();
const noticeGetters = noticeStore.getters;


const state = reactive({
    hasNotice: computed(() => noticeGetters.unreadNoticeCount > 0),
    isNoRoleUser: computed<boolean>(() => store.getters['user/isNoRoleUser']),
});

/* Util */
const setVisible = (visible: boolean) => {
    emit('update:visible', visible);
};
const showNotiMenu = () => {
    if (!props.visible) setVisible(true);
};
const hideNotiMenu = () => {
    if (props.visible) setVisible(false);
};

/* Event */
const handleNotiButtonClick = () => {
    if (state.isNoRoleUser) return;
    setVisible(!props.visible);
};

onMounted(() => {
    noticeStore.fetchNoticeReadState();
});

const { callApiWithGrantGuard } = useGrantScopeGuard(['WORKSPACE'], noticeStore.fetchNoticeCount);
callApiWithGrantGuard();

watch(() => store.state.user.isSessionExpired, (isSessionExpired) => {
    if (isSessionExpired) {
        noticeStore.reset();
    }
});
</script>

<template>
    <div v-on-click-outside="hideNotiMenu"
         class="top-bar-notice"
         @click.stop
         @keydown.esc="hideNotiMenu"
    >
        <p-tooltip :contents="$t('COMMON.GNB.TOOLTIP.NOTICE')"
                   position="bottom"
        >
            <span :class="{'menu-button': true, 'opened': visible}"
                  tabindex="0"
                  role="button"
                  @click.stop="handleNotiButtonClick"
                  @keydown.enter="showNotiMenu"
            >
                <p-i class="menu-icon"
                     :class="{ disabled: state.isNoRoleUser }"
                     :name="state.hasNotice ? 'ic_gnb_notification-unread' : 'ic_gnb_notification'"
                     :color="state.hasNotice ? undefined : 'inherit'"
                     width="1.375rem"
                     height="1.375rem"
                />
            </span>
        </p-tooltip>
        <div v-show="visible"
             class="notice-content"
        >
            <top-bar-notice-context-menu @close="hideNotiMenu" />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.top-bar-notice {
    position: relative;

    .menu-button {
        @apply inline-flex items-center justify-center text-gray-500 rounded-full;
        width: 2rem;
        height: 2rem;
        line-height: $top-bar-height;
        cursor: pointer;

        .menu-icon {
            margin-bottom: -0.125rem;
        }

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

    .notice-content {
        @apply absolute bg-white rounded-xs border border-gray-200;
        display: flex;
        flex-direction: column;
        width: 27.5rem;
        min-height: auto;
        top: 100%;
        right: 0;
        box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.08);
        margin-right: -0.5rem;
        z-index: 1000;
    }
}
</style>
