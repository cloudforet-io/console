<template>
    <section class="user-notifications-tab">
        <p-heading heading-type="sub"
                   :title="title"
        >
            <template #extra>
                <router-link :to="manageLink">
                    <p-button style-type="primary"
                              :disabled="manageDisabled"
                    >
                        {{ $t('IDENTITY.USER.NOTIFICATION.MANAGE') }}
                    </p-button>
                </router-link>
            </template>
        </p-heading>

        <p-data-table
            :items="items"
            :loading="loading"
            :fields="fields"
            :striped="false"
        >
            <template #col-data-format="{ item }">
                <div v-if="item.data.length > 1">
                    <p v-for="(value, index) in item.data"
                       :key="`item-${index}`"
                    >
                        {{ Object.keys(value)[0] }} : {{ Object.values(value)[0] }}
                    </p>
                </div>
                <p v-else-if="item.secret_id.length > 0">
                    <!-- masking secret data -->
                    data: *******
                </p>
                <p v-else>
                    {{ Object.keys(item.data)[0] }} : {{ Object.values(item.data)[0] }}
                </p>
            </template>
            <template #col-schedule-format="{value}">
                <p v-if="value">
                    <span v-for="day in value.day_of_week"
                          :key="day"
                    > {{ day }}</span><br>
                    {{ utcToTimezoneFormatter(value.start_hour, timezone) }}:00 ~
                    {{ utcToTimezoneFormatter(value.end_hour, timezone) }}:00
                </p>
                <span v-else>{{ $t('IDENTITY.USER.NOTIFICATION.FORM.ALL_TIME') }}</span>
            </template>
            <template #col-subscriptions-format="{value}">
                <ul v-if="value.length > 0">
                    <li v-for="(item, index) in value"
                        :key="`topic-${index}`"
                    >
                        <p-badge style-type="gray200"
                                 badge-type="subtle"
                                 shape="square"
                                 class="rounded"
                        >
                            {{ item }}
                        </p-badge>
                    </li>
                </ul>
                <span v-else>
                    {{ $t('IDENTITY.USER.NOTIFICATION.FORM.RECEIVE_ALL') }}
                </span>
            </template>
        </p-data-table>
    </section>
</template>
<script lang="ts">
import {
    computed, reactive, toRefs, watch,
} from 'vue';

import {
    PBadge, PButton, PDataTable, PHeading,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { utcToTimezoneFormatter } from '@/services/administration/iam/user/lib/helper';
import type { ChannelItem, ProtocolItem } from '@/services/administration/iam/user/type';
import { MY_PAGE_ROUTE } from '@/services/my-page/route-config';

export default {
    name: 'UserNotifications',
    components: {
        PDataTable,
        PHeading,
        PBadge,
        PButton,
    },
    props: {
        userId: {
            type: String,
            required: true,
            default: undefined,
        },
        manageDisabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const state = reactive({
            title: i18n.t('IDENTITY.USER.NOTIFICATION.NOTIFICATION_CHANNEL'),
            loading: true,
            fields: computed(() => [
                { name: 'protocol_type', label: i18n.t('IDENTITY.USER.NOTIFICATION.TYPE') },
                { name: 'name', label: i18n.t('IDENTITY.USER.NOTIFICATION.CHANNEL_NAME') },
                { name: 'data', label: i18n.t('IDENTITY.USER.NOTIFICATION.CHANNEL_INFO') },
                { name: 'schedule', label: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE') },
                { name: 'subscriptions', label: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC') },
            ]),
            items: [] as ChannelItem[],
            protocolList: [] as ProtocolItem[],
            manageLink: {
                name: MY_PAGE_ROUTE.MY_ACCOUNT.NOTIFICATION.MANAGE._NAME,
                params: { userId: computed(() => encodeURIComponent(props.userId)) },
            },
            timezone: computed(() => store.state.user.timezone),
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
                ErrorHandler.handleError(e);
                state.protocolList = [];
            }
        };

        const injectProtocolName = (channel: ChannelItem) => (state.protocolList as any).find((i) => i.protocol_id === channel.protocol_id).name;

        const channelApiQuery = new ApiQueryHelper();
        const listUserChannel = async () => {
            state.loading = true;
            try {
                channelApiQuery.setFilters([{ k: 'user_id', v: props.userId, o: '=' }]);
                const res = await SpaceConnector.client.notification.userChannel.list({
                    query: channelApiQuery.data,
                });
                state.items = res.results.map((d) => ({
                    ...d,
                    protocol_type: injectProtocolName(d),
                }));
            } catch (e) {
                ErrorHandler.handleError(e);
                state.items = [];
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
            utcToTimezoneFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.tab-header {
    display: flex;

    align-items: center;
    padding-right: 1rem;
}
</style>
