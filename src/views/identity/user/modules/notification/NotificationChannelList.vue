<template>
    <section class="notification-wrapper">
        <p-pane-layout class="noti-channel-wrapper">
            <h3 class="sub-title">
                {{ $t('IDENTITY.USER.NOTIFICATION.NOTIFICATION_CHANNEL') }}
            </h3>
            <ul v-if="protocolList.length > 0" class="channel-list-wrapper">
                <div v-for="item in protocolList"
                     :key="item.protocol_id"
                     class="channel-item-wrapper"
                >
                    <router-link :to="item.link">
                        <li class="channel-item">
                            <p-lazy-img :src="assetUrlConverter(item.tags.icon)"
                                        :width="item.name === PROTOCOL_TYPE.SLACK ? '8rem' : '2.75rem'"
                                        height="2.25rem"
                                        class="service-img"
                            />
                            <span class="text">
                                <p-i name="ic_plus_bold"
                                     width="1rem" height="1rem"
                                />
                                {{ item.label }}
                            </span>
                            <span v-if="item.protocolType === 'INTERNAL'" class="item-desc">
                                {{ $t('IDENTITY.USER.NOTIFICATION.SPACEONE_USER_DESC') }}
                            </span>
                        </li>
                    </router-link>
                </div>
            </ul>
            <span v-else>
                <p-empty v-if="channelList.length === 0" class="empty-msg protocol">
                    {{ $t('IDENTITY.USER.NOTIFICATION.NO_PROTOCOL') }}
                </p-empty>
            </span>
            <p-divider class="divider" />
            <ul v-for="item in channelList" :key="`${item.name}-${item.created_at}`">
                <li class="mb-4">
                    <notification-channel-item :channel-data="item" :project-id="projectId"
                                               @change="onChangeChannelItem"
                                               @confirm="listChannel"
                    />
                </li>
            </ul>
            <p-empty v-if="channelList.length === 0" class="empty-msg">
                {{ $t('IDENTITY.USER.NOTIFICATION.NO_NOTI_CHANNEL') }}
            </p-empty>
        </p-pane-layout>
    </section>
</template>

<script lang="ts">
import {
    PDivider, PI, PEmpty, PPaneLayout, PLazyImg,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import { assetUrlConverter } from '@/lib/util';
import { IDENTITY_ROUTE } from '@/routes/identity/identity-route';
import NotificationChannelItem from '@/views/identity/user/modules/notification/NotificationChannelItem.vue';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { store } from '@/store';
import { ChannelItem, ProtocolItem } from '@/views/identity/user/type';
import { PROTOCOL_TYPE } from '@/views/identity/user/modules/notification/notification-channel-item/type';

export default {
    name: 'NotificationChannelList',
    components: {
        NotificationChannelItem,
        PPaneLayout,
        PI,
        PDivider,
        PEmpty,
        PLazyImg,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            protocolList: [] as ProtocolItem[],
            loading: true,
            // eslint-disable-next-line no-use-before-define
            userId: computed(() => ((vm.$route.params.userId) ? decodeURIComponent(vm.$route.params.userId) : store.state.user.userId)),
            channelList: [] as ChannelItem[],
            protocolResp: [] as ProtocolItem[],
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
                state.protocolResp = res.results;
                state.protocolList = res.results.map(d => ({
                    label: computed(() => vm.$t('IDENTITY.USER.NOTIFICATION.FORM.ADD_CHANNEL', { type: d.name })).value,
                    link: {
                        name: IDENTITY_ROUTE.USER.NOTIFICATION.ADD._NAME,
                        params: {
                            protocol: d.name.replace(/(\s*)/g, ''),
                            protocolId: d.protocol_id,
                            userId: state.userId,
                        },
                        query: {
                            protocolLabel: encodeURIComponent(d.name),
                            projectId: props.projectId ? props.projectId : undefined,
                            // eslint-disable-next-line camelcase
                            supported_schema: d.capability.supported_schema,
                            protocolType: d.protocol_type,
                        },
                    },
                    protocolType: d.protocol_type,
                    tags: d.tags,
                    name: d.name,
                }));
            } catch (e) {
                state.protocolList = [];
                state.protocolResp = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        const injectProtocolName = (channel: ChannelItem) => (state.protocolResp as any).find(i => i.protocol_id === channel.protocol_id).name;

        const channelApiQuery = new ApiQueryHelper();
        const listUserChannel = async () => {
            try {
                channelApiQuery.setFilters([{ k: 'user_id', v: state.userId, o: '=' }]);
                const res = await SpaceConnector.client.notification.userChannel.list({
                    query: channelApiQuery.data,
                });
                state.channelList = res.results.map(d => ({
                    ...d,
                    // eslint-disable-next-line camelcase
                    protocol_name: injectProtocolName(d),
                }));
            } catch (e) {
                state.channelList = [];
                console.error(e);
            }
        };

        const listProjectChannel = async () => {
            try {
                channelApiQuery.setFilters([{ k: 'project_id', v: props.projectId, o: '=' }]).setSort('notification_level', false);
                const res = await SpaceConnector.client.notification.projectChannel.list({
                    query: channelApiQuery.data,
                });
                state.channelList = res.results.map(d => ({
                    ...d,
                    // eslint-disable-next-line camelcase
                    protocol_name: injectProtocolName(d),
                }));
            } catch (e) {
                state.channelList = [];
                console.error(e);
            }
        };

        const listChannel = async () => {
            if (props.projectId) await listProjectChannel();
            else await listUserChannel();
        };

        const onChangeChannelItem = async () => {
            await listChannel();
        };

        (async () => {
            await listProtocol();
            await store.dispatch('resource/user/load');
            await listChannel();
        })();

        return {
            ...toRefs(state),
            routeState,
            PROTOCOL_TYPE,
            assetUrlConverter,
            onChangeChannelItem,
            listChannel,
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
    align-items: center;
    height: 8.625rem;
    min-height: 8.625rem;
    border-radius: 0.375rem;
    .text {
        @apply text-primaryDark font-bold;
        line-height: 160%;
    }
    .item-desc {
        @apply text-violet-800;
        font-size: 0.75rem;
        line-height: 150%;
        text-align: center;
        max-width: 12.5rem;
    }
    &:hover {
        @apply bg-blue-100;
    }
}
.service-img {
    margin-bottom: 1rem;
}
.divider {
    margin-bottom: 1.5rem;
}
.empty-msg {
    margin-top: 2.5rem;
    &.protocol {
        margin-bottom: 2.5rem;
    }
}
</style>
