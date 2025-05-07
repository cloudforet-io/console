<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import {
    computed, onMounted, reactive, watch,
} from 'vue';

import {
    PI, PTooltip,
} from '@cloudforet/mirinae';

import { useNoticeStore } from '@/store/notice/notice-store';
import { useUserStore } from '@/store/user/user-store';

import { useGrantScopeGuard } from '@/common/composables/grant-scope-guard';
import TopBarNoticeContextMenu
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-notice/modules/TopBarNoticeContextMenu.vue';

import { blue } from '@/styles/colors';


interface Props {
    visible: boolean
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();

const noticeStore = useNoticeStore();
const noticeGetters = noticeStore.getters;
const userStore = useUserStore();

const state = reactive({
    hasNotice: computed(() => noticeGetters.unreadNoticeCount > 0),
    isNoRoleUser: computed<boolean>(() => userStore.getters.isNoRoleUser),
    iconColor: computed<string>(() => {
        if (props.visible) return blue[600];
        return 'inherit';
    }),
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

watch(() => userStore.state.isSessionExpired, (isSessionExpired) => {
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
                <span v-if="state.hasNotice"
                      class="dot"
                />
                <p-i class="menu-icon"
                     :class="{ disabled: state.isNoRoleUser }"
                     name="ic_gnb_bell"
                     :color="state.iconColor"
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
        @apply relative inline-flex items-center justify-center text-gray-500 rounded-full;
        width: 2rem;
        height: 2rem;
        line-height: $top-bar-height;
        cursor: pointer;

        .menu-icon {
            margin-bottom: -0.125rem;
            &:hover {
                @apply text-blue-600;
            }
        }
        .dot {
            @apply absolute rounded-full bg-white;
            top: 6px;
            right: 7px;
            width: 8px;
            height: 8px;
            &::before {
                content: '';

                @apply absolute rounded-full bg-blue-500;
                top: 1px;
                right: 1px;
                width: 6px;
                height: 6px;
            }
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

    @screen mobile {
        position: initial;
        .notice-content {
            width: 100%;
            left: 0;
        }
    }
}
</style>
