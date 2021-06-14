<template>
    <general-page-layout class="manage-notification-page">
        <p-breadcrumbs class="flex-grow" :routes="routeState.routes" />
        <p-page-title child :title="$t('IDENTITY.USER.MAIN.NOTIFICATION')"
                      @goBack="goToUserManagement"
        />
        <notification-channel-list />
    </general-page-layout>
</template>

<script lang="ts">
import NotificationChannelList from '@/views/identity/user/modules/notification/NotificationChannelList.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive,
} from '@vue/composition-api';
import { PBreadcrumbs, PPageTitle } from '@spaceone/design-system';
import GeneralPageLayout from '@/common/components/layouts/GeneralPageLayout.vue';
import { IDENTITY_ROUTE } from '@/routes/identity/identity-route';

export default {
    name: 'ManageNotificationPage',
    components: {
        GeneralPageLayout, NotificationChannelList, PBreadcrumbs, PPageTitle,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const routeState = reactive({
            routes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.NOTIFICATION') },
            ])),
        });
        const goToUserManagement = () => {
            vm.$router.push({ name: IDENTITY_ROUTE.USER.MANAGEMENT });
        };
        return {
            routeState,
            goToUserManagement,
        };
    },
};
</script>

<style lang="postcss" scoped>

</style>
