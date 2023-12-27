<template>
    <portal to="top-notification"
            class="top-notification"
    >
        <p slot-scope="{hasDefaultMessage}">
            <p-notification-bar v-model="visible"
                                :style-type="styleType"
                                @close="handleClose"
            >
                <span v-if="hasDefaultMessage">
                    <portal target="top-notification-message" />
                    {{ notificationText }}
                </span>
            </p-notification-bar>
        </p>
    </portal>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import { PNotificationBar } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

export default {
    name: 'TopNotification',
    components: { PNotificationBar },
    props: {
        styleType: {
            type: String,
            default: 'dark',
        },
    },
    setup() {
        const userWorkspaceStore = useUserWorkspaceStore();
        const state = reactive({
            visible: computed({
                get() {
                    return !(store.getters['user/hasPermission'] || userWorkspaceStore.getters.workspaceList.length > 0) || store.state.error.visibleAuthorizationError;
                },
                set(val) { store.commit('error/setVisibleAuthorizationError', val); },
            }),
            notificationText: computed(() => {
                if (userWorkspaceStore.getters.workspaceList.length === 0) {
                    return i18n.t('APP.TOP_NOTI.NO_WORKSPACE');
                }
                return i18n.t('APP.TOP_NOTI.PERMISSION_DENIED');
            }),
        });
        const handleClose = () => {
            state.visible = false;
        };
        return {
            ...toRefs(state),
            handleClose,
        };
    },
};
</script>
