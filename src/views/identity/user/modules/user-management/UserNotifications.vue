<template>
    <section class="user-notifications-tab">
        <div class="tab-header">
            <p-panel-top>{{ title }}</p-panel-top>
            <router-link :to="manageLink">
                <p-button style-type="primary-dark">
                    Manage
                </p-button>
            </router-link>
        </div>
        <p-data-table
            :items="items"
            :loading="loading"
            :fields="fields"
            :striped="false"
        >
            <template #col-data-format="{ value }">
                <p v-if="Object.keys(value)[0] === 'webhook_url'">
                    <!-- masking token -->
                    {{ Object.keys(value)[0] }} : {{ Object.values(value)[0].replace(/(?<=.{0})./gi, "*") }}
                </p>
                <div v-else-if="value.length > 1">
                    <p v-for="(value, index) in value" :key="`item-${index}`">
                        {{ Object.keys(value)[0] }} : {{ Object.values(value)[0] }}
                    </p>
                </div>
                <p v-else>
                    {{ Object.keys(value)[0] }} : {{ Object.values(value)[0] }}
                </p>
            </template>
            <template #col-subscriptions-format="{value}">
                <ul v-if="value.length > 0">
                    <li v-for="(item, index) in value" :key="`topic-${index}`">
                        <p-tag :deletable="false">
                            {{ item }}
                        </p-tag>
                    </li>
                </ul>
                <span v-else>
                    Receive all notifications
                </span>
            </template>
        </p-data-table>
    </section>
</template>
<script lang="ts">
import {
    PBadge, PButton, PDataTable, PPanelTop, PTag,
} from '@spaceone/design-system';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { SpaceConnector } from '@/lib/space-connector';
import { ChannelItem, ProtocolItem } from '@/views/identity/user/type';
import { IDENTITY_ROUTE } from '@/routes/identity/identity-route';

export default {
    name: 'UserNotifications',
    components: {
        PDataTable,
        PPanelTop,
        PTag,
        PButton,
    },
    props: {
        userId: {
            type: String,
            required: true,
            default: undefined,
        },
    },
    setup(props) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            title: 'Notifications Channel',
            loading: true,
            fields: computed(() => [
                { name: 'protocol_type', label: 'Type' },
                { name: 'name', label: 'Channel Name' },
                { name: 'data', label: 'Channel Info.' },
                { name: 'schedule', label: 'Schedule' },
                { name: 'subscriptions', label: 'Topic' },
            ]),
            items: [] as ChannelItem[],
            protocolList: [] as ProtocolItem[],
            manageLink: {
                name: IDENTITY_ROUTE.USER.NOTIFICATION.MANAGE,
                params: { user_id: encodeURIComponent(props.userId) },
            },
        });

        const apiQuery = new ApiQueryHelper();
        const listProtocol = async () => {
            try {
                apiQuery.setFilters([{ k: 'protocol_type', o: '=', v: 'EXTERNAL' }]);
                const res = await SpaceConnector.client.notification.protocol.list({
                    query: apiQuery.data,
                });
                state.protocolList = res.results;
            } catch (e) {
                state.protocolList = [];
                console.error(e);
            }
        };

        const injectProtocolName = (channel: ChannelItem) => (state.protocolList as any).find(i => i.protocol_id === channel.protocol_id).name;

        const channelApiQuery = new ApiQueryHelper();
        const listUserChannel = async () => {
            state.loading = true;
            try {
                channelApiQuery.setFilters([{ k: 'user_id', v: props.userId, o: '=' }]);
                const res = await SpaceConnector.client.notification.userChannel.list({
                    query: channelApiQuery.data,
                });
                state.items = res.results.map(d => ({
                    ...d,
                    // eslint-disable-next-line camelcase
                    protocol_type: injectProtocolName(d),
                }));
            } catch (e) {
                state.items = [];
                console.error(e);
            } finally {
                state.loading = false;
            }
        };

        watch(() => props.userId, async () => {
            await listProtocol();
            await listUserChannel();
        }, { immediate: true });


        return {
            ...toRefs(state),
        };
    },
};
</script>

<style lang="postcss" scoped>
.tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 1rem;
}
</style>
