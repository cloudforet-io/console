<template>
    <section class="notification-wrapper">
        <p-pane-layout class="noti-channel-wrapper">
            <h3 class="sub-title">
                {{ $t('IDENTITY.USER.NOTIFICATION.NOTIFICATION_CHANNEL') }}
            </h3>
            <ul class="channel-list-wrapper">
                <div v-for="item in channelList"
                     :key="item.label"
                     class="channel-item-wrapper" :class="{'hide': hideProjectOnlyChannel && item.isProjectOnlyChannel}"
                >
                    <router-link :to="item.link">
                        <li class="channel-item">
                            <span class="text">
                                <p-i name="ic_plus_bold"
                                     width="0.625rem" height="0.625rem"
                                />
                                {{ item.label }}
                            </span>
                        </li>
                    </router-link>
                </div>
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
    PDivider, PI, PEmpty, PPaneLayout,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { IDENTITY_ROUTE } from '@/routes/identity/identity-route';
import NotificationChannelCard from '@/views/identity/user/modules/NotificationChannelCard.vue';
import { PROJECT_ROUTE } from '@/routes/project/project-route';

export default {
    name: 'NotificationList',
    components: {
        NotificationChannelCard,
        PPaneLayout,
        PI,
        PDivider,
        PEmpty,
    },
    props: {
        hideProjectOnlyChannel: {
            type: Boolean,
            default: true,
        },
        projectId: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            channelList: computed(() => [
                {
                    label: vm.$t('IDENTITY.USER.NOTIFICATION.ADD_MEMBER_GROUP'),
                    link: {
                        name: IDENTITY_ROUTE.USER.NOTIFICATION.ADD,
                        params: { channel: 'member' },
                        query: {
                            projectId: props.projectId,
                        },
                    },
                    isProjectOnlyChannel: true,
                },
                {
                    label: vm.$t('IDENTITY.USER.NOTIFICATION.ADD_SMS'),
                    link: {
                        name: IDENTITY_ROUTE.USER.NOTIFICATION.ADD,
                        params: { channel: 'sms' },
                    },
                },
                {
                    label: vm.$t('IDENTITY.USER.NOTIFICATION.ADD_VOICE'),
                    link: {
                        name: IDENTITY_ROUTE.USER.NOTIFICATION.ADD,
                        params: { channel: 'voice' },
                    },
                },
                {
                    label: vm.$t('IDENTITY.USER.NOTIFICATION.ADD_SLACK'),
                    link: {
                        name: IDENTITY_ROUTE.USER.NOTIFICATION.ADD,
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
    @apply border-none;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 100%;
    height: 100%;
    padding: 2rem 1rem 0;
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
.channel-item-wrapper {
    &.hide {
        display: none;
    }
}
.channel-item {
    @apply border border-gray-300;
    display: flex;
    flex-direction: column;
    place-content: center;
    text-align: center;
    height: 8.625rem;
    min-height: 8.625rem;
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
