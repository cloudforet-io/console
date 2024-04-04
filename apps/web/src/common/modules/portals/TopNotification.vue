<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { PNotificationBar } from '@spaceone/design-system';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';

const props = withDefaults(defineProps<{
    styleType?: string;
}>(), {
    styleType: 'dark',
});
const userWorkspaceStore = useUserWorkspaceStore();
const route = useRoute();
const state = reactive({
    visible: computed({
        get() {
            return !(store.getters['user/hasPermission'] || userWorkspaceStore.getters.workspaceList.length > 0)
                || (store.state.error.visibleAuthorizationError && !route.name?.startsWith(MY_PAGE_ROUTE._NAME)); // TODO: this (my-page guard) is a temporary solution. It should be refactored.
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
</script>
<template>
    <portal v-slot="{hasDefaultMessage}"
            to="top-notification"
            class="top-notification"
    >
        <p>
            <p-notification-bar v-model="state.visible"
                                :style-type="props.styleType"
                                @close="handleClose"
            >
                <span v-if="hasDefaultMessage">
                    <portal target="top-notification-message" />
                    {{ state.notificationText }}
                </span>
            </p-notification-bar>
        </p>
    </portal>
</template>
