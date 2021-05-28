<template>
    <section class="notification-wrapper">
        <p-breadcrumbs class="flex-grow" :routes="routeState.routes" />
        <p-page-title :title="$t('IDENTITY.USER.MAIN.NOTIFICATION')" />
        <notification-list />
    </section>
</template>

<script lang="ts">
import {
    PBreadcrumbs, PPageTitle,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive,
} from '@vue/composition-api';
import NotificationList from '@/views/identity/user/modules/NotificationList.vue';

export default {
    name: 'NotificationPage',
    components: {
        NotificationList,
        PBreadcrumbs,
        PPageTitle,
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
        return {
            routeState,
        };
    },
};
</script>

<style lang="postcss" scoped>
</style>
