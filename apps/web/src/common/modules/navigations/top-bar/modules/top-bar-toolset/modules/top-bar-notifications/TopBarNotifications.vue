<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import { useDocumentVisibility } from '@vueuse/core';
import {
    computed, onMounted, onUnmounted, reactive, watch,
} from 'vue';

import {
    PI, PTooltip,
} from '@cloudforet/mirinae';

import { store } from '@/store';

import TopBarNotificationsContextMenu
    from '@/common/modules/navigations/top-bar/modules/top-bar-toolset/modules/top-bar-notifications/modules/TopBarNotificationsContextMenu.vue';

import { blue } from '@/styles/colors';


interface Props {
    visible: boolean
}
const props = withDefaults(defineProps<Props>(), {
    visible: false,
});
const emit = defineEmits<{(e: 'update:visible', value: boolean): void}>();

const state = reactive({
    hasNotifications: computed(() => store.getters['display/hasUncheckedNotifications']),
    isNoRoleUser: computed<boolean>(() => store.getters['user/isNoRoleUser']),
    notificationCount: 0,
    iconColor: computed<string>(() => {
        if (props.visible) return blue[600];
        return 'inherit';
    }),
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
});

onUnmounted(() => {
    store.dispatch('display/stopCheckNotification');
});

watch(() => store.state.user.isSessionExpired, (isSessionExpired) => {
    if (isSessionExpired) {
        store.dispatch('display/stopCheckNotification');
    }
});

</script>

<template>
    <div v-on-click-outside="hideNotiMenu"
         class="top-bar-notifications"
         @click.stop
         @keydown.esc="hideNotiMenu"
    >
        <p-tooltip :contents="$t('COMMON.GNB.TOOLTIP.NOTIFICATIONS')"
                   position="bottom"
        >
            <span :class="{'menu-button': true, 'opened': visible}"
                  tabindex="0"
                  role="button"
                  @click.stop="handleNotiButtonClick"
                  @keydown.enter="showNotiMenu"
            >
                <span v-if="state.hasNotifications"
                      class="dot"
                />
                <p-i class="menu-icon"
                     :class="{ disabled: state.isNoRoleUser }"
                     name="ic_gnb_notification"
                     :color="state.iconColor"
                     width="1.375rem"
                     height="1.375rem"
                />
            </span>
        </p-tooltip>
        <div v-show="visible"
             class="notification-content"
        >
            <top-bar-notifications-context-menu
                :visible="props.visible"
                :count.sync="state.notificationCount"
            />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.top-bar-notifications {
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

        .menu-icon {
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

        .disabled {
            cursor: not-allowed;
        }
    }

    .notification-content {
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
