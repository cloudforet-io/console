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
import NotificationChannelList from '@/services/notification/modules/NotificationChannelList.vue';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive,
} from '@vue/composition-api';
import { PBreadcrumbs, PPageTitle } from '@spaceone/design-system';
import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';
import { IDENTITY_ROUTE } from '@/services/identity/routes';
import { i18n } from '@/translations';

export default {
    name: 'ManageNotificationPage',
    components: {
        GeneralPageLayout, NotificationChannelList, PBreadcrumbs, PPageTitle,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const routeState = reactive({
            routes: computed(() => ([
                { name: i18n.t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: i18n.t('MENU.IDENTITY.USER'), path: '/identity/user/user-management' },
                { name: i18n.t('IDENTITY.USER.MAIN.ROOT_ACCOUNT'), path: '/identity/user/user-management' },
                { name: i18n.t('IDENTITY.USER.MAIN.USER_MANAGEMENT'), path: '/identity/user/user-management' },
                { name: i18n.t('IDENTITY.USER.NOTIFICATION.MANAGE_CHANNEL') },
            ])),
        });
        const goToUserManagement = () => {
            vm.$router.push({ name: IDENTITY_ROUTE.USER.MANAGEMENT._NAME });
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
