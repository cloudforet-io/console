<template>
    <section class="notification-wrapper">
        <p-breadcrumbs class="flex-grow" :routes="routeState.routes" />
        <p-page-title :title="$t('IDENTITY.USER.MAIN.NOTIFICATION')" />
        <p-pane-layout class="noti-channel-wrapper">
            <h3 class="sub-title">
                {{ $t('IDENTITY.USER.NOTIFICATION.NOTIFICATION_CHANNEL') }}
            </h3>
            <ul class="channel-list-wrapper">
                <router-link v-for="item in channelList"
                             :key="item.label" :to="item.link"
                >
                    <li class="channel-item">
                        <span class="text">
                            <p-i name="ic_plus_bold"
                                 width="0.625rem" height="0.625rem"
                            />
                            {{ item.label }}
                        </span>
                    </li>
                </router-link>
            </ul>
            <p-divider class="divider" />
            <notification-channel-card />
            <!--            <p-empty class="empty-msg">-->
            <!--                {{ $t('IDENTITY.USER.NOTIFICATION.NO_NOTI_CHANNEL') }}-->
            <!--            </p-empty>-->
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import {
    PBreadcrumbs, PDivider, PI, PEmpty, PPageTitle, PPaneLayout,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { IDENTITY_ROUTE } from '@/routes/identity/identity-route';
import NotificationChannelCard from '@/views/identity/user/modules/NotificationChannelCard.vue';

export default {
    name: 'UserNotificationPage',
    components: {
        NotificationChannelCard,
        PBreadcrumbs,
        PPageTitle,
        PPaneLayout,
        PI,
        PDivider,
        PEmpty,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            channelList: computed(() => [
                {
                    label: vm.$t('IDENTITY.USER.NOTIFICATION.ADD_SMS'),
                    link: {
                        name: IDENTITY_ROUTE.USER.ADD_NOTIFICATION,
                        params: { channel: 'sms' },
                    },
                },
                {
                    label: vm.$t('IDENTITY.USER.NOTIFICATION.ADD_VOICE'),
                    link: {
                        name: IDENTITY_ROUTE.USER.ADD_NOTIFICATION,
                        params: { channel: 'voice' },
                    },
                },
                {
                    label: vm.$t('IDENTITY.USER.NOTIFICATION.ADD_SLACK'),
                    link: {
                        name: IDENTITY_ROUTE.USER.ADD_NOTIFICATION,
                        params: { channel: 'slack' },
                    },
                },
            ]),
        });
        const routeState = reactive({
            routes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.NOTIFICATION') },
            ])),
        });
        return {
            ...toRefs(state),
            routeState,
        };
    },
};
</script>

<style lang="postcss" scoped>
.noti-channel-wrapper {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
    height: 100%;
    padding: 2rem 1rem 2.5rem;
}
.sub-title {
    font-size: 1.375rem;
    line-height: 145%;
}
.channel-list-wrapper {
    display: grid;
    row-gap: 0.5rem;
    column-gap: 0.5rem;
    grid-template-columns: repeat(auto-fit, minmax(216px, 1fr));
    margin-top: 1.125rem;
    margin-bottom: 1.5rem;
    gap: 0.5rem;
}
.channel-item {
    display: flex;
    flex-direction: column;
    place-content: center;
    text-align: center;
    height: 8.625rem;
    min-height: 8.625rem;
    border: 1px solid rgba(theme('colors.gray.300'), 1);
    border-radius: 0.375rem;
    .text {
        @apply text-primaryDark font-bold;
    }
}
.divider {
    margin-bottom: 1.5rem;
}
.empty-msg {
    margin-top: 2.5rem;
}
</style>
