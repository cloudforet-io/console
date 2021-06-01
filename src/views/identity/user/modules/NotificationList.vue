<template>
    <section class="notification-wrapper">
        <p-pane-layout class="noti-channel-wrapper">
            <h3 class="sub-title">
                {{ $t('IDENTITY.USER.NOTIFICATION.NOTIFICATION_CHANNEL') }}
            </h3>
            <ul class="channel-list-wrapper">
                <div v-for="item in channelList"
                     :key="item.label"
                     class="channel-item-wrapper"
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
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';

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
        projectId: {
            type: String,
            default: null,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            channelList: [] as any,
            loading: true,
        });
        const routeState = reactive({
            routes: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.USER'), path: '/identity/user/account' },
                { name: vm.$t('IDENTITY.USER.MAIN.NOTIFICATION') },
            ])),
        });

        const apiQuery = new ApiQueryHelper();
        const listProtocol = async () => {
            try {
                state.loading = true;
                let res;
                if (props.projectId) res = await SpaceConnector.client.notification.protocol.list();
                else {
                    apiQuery.setFilters([{ k: 'protocol_type', o: '=', v: 'EXTERNAL' }]);
                    res = await SpaceConnector.client.notification.protocol.list({
                        query: apiQuery.data,
                    });
                }
                state.channelList = res.results.map(d => ({
                    label: computed(() => vm.$t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: vm.$t(`IDENTITY.USER.NOTIFICATION.${d.name.toUpperCase()}`) })).value,
                    link: {
                        name: IDENTITY_ROUTE.USER.NOTIFICATION.ADD,
                        params: {
                            channel: d.name.toLowerCase(),
                            protocolId: d.protocol_id,
                        },
                        query: {
                            projectId: props.projectId ? props.projectId : null,
                            supported_schema: d.capability.supported_schema,
                        },
                    },
                }));
            } catch (e) {
                state.channelList = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        (async () => {
            await listProtocol();
        })();

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
