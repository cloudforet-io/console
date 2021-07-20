<template>
    <section class="notification-wrapper">
        <p-breadcrumbs v-if="isAdmin" class="flex-grow" :routes="routeState.adminRoutes" />
        <p-breadcrumbs v-else class="flex-grow" :routes="routeState.userRoutes" />
        <p-page-title :title="$t('IDENTITY.USER.MAIN.NOTIFICATION')" />
        <p-pane-layout class="list-wrapper">
            <notification-channel-list />
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import {
    PBreadcrumbs, PPageTitle, PPaneLayout,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import NotificationChannelList from '@/views/identity/user/modules/notification/NotificationChannelList.vue';
import {store} from "../../../../store";

export default {
    name: 'NotificationPage',
    components: {
        NotificationChannelList,
        PBreadcrumbs,
        PPageTitle,
        PPaneLayout,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            isAdmin: computed(() => store.getters['user/isAdmin']).value,
        })
        const routeState = reactive({
            userRoutes: computed(() => ([
                { name: vm.$t('IDENTITY.USER.MAIN.MY_ACCOUNT'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.NOTIFICATION') },
            ])),
            adminRoutes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/user-management' },
                { name: vm.$t('IDENTITY.USER.MAIN.MY_ACCOUNT'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.NOTIFICATION') },
            ])),
        });
        return {
            routeState,
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.list-wrapper {
    padding-bottom: 2.5rem;
}
</style>
