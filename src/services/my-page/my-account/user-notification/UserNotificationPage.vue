<template>
    <section class="notification-wrapper">
        <p-breadcrumbs class="flex-grow" :routes="routeState.route" />
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
    computed, reactive, toRefs,
} from '@vue/composition-api';
import NotificationChannelList from '@/services/notification/modules/NotificationChannelList.vue';
import { store } from '@/store';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';

export default {
    name: 'NotificationPage',
    components: {
        NotificationChannelList,
        PBreadcrumbs,
        PPageTitle,
        PPaneLayout,
    },
    setup() {
        const state = reactive({
            isAdmin: computed(() => store.getters['user/isAdmin']).value,
        });
        const routeState = reactive({
            route: [
                { name: 'My Page', to: { name: MY_PAGE_ROUTE._NAME } },
                { name: 'My Account', to: { name: MY_PAGE_ROUTE.MY_ACCOUNT._NAME } },
                { name: 'Notifications Channel' },
            ],
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
