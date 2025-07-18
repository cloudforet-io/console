<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { PNotificationBar } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import { useErrorStore } from '@/store/error/error-store';
import { useUserStore } from '@/store/user/user-store';

import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';


const props = withDefaults(defineProps<{
    styleType?: string;
}>(), {
    styleType: 'dark',
});
const userWorkspaceStore = useUserWorkspaceStore();
const errorStore = useErrorStore();
const userStore = useUserStore();
const authorizationStore = useAuthorizationStore();
const route = useRoute();

const storeState = reactive({
    hasPermission: computed(() => authorizationStore.getters.hasPermission),
    isDomainAdmin: computed(() => userStore.getters.isDomainAdmin),
    workspaceList: computed(() => userWorkspaceStore.getters.workspaceList),
    visibleAuthorizationError: computed(() => errorStore.state.visibleAuthorizationError),
});
const state = reactive({
    visible: computed({
        get() {
            // REFACTOR: this (my-page guard) is a temporary solution. It should be refactored.
            let result: boolean;

            if (storeState.hasPermission || storeState.workspaceList.length > 0) {
                result = false;
            } else if (storeState.visibleAuthorizationError && !route.name?.startsWith(MY_PAGE_ROUTE._NAME)) {
                result = false;
            } else result = !(route.name?.startsWith(MY_PAGE_ROUTE._NAME) && storeState.isDomainAdmin);

            return result;
        },
        set(val) {
            errorStore.setVisibleAuthorizationError(val);
        },
    }),
    notificationText: computed(() => {
        if (storeState.workspaceList.length === 0) {
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
