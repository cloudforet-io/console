<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PBadge, PButton, PDataTable, PHeading,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ProtocolListParameters } from '@/schema/notification/protocol/api-verbs/list';
import type { ProtocolModel } from '@/schema/notification/protocol/model';
import type { UserChannelListParameters } from '@/schema/notification/user-channel/api-verbs/list';
import type { UserChannelModel } from '@/schema/notification/user-channel/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { utcToTimezoneFormatter } from '@/services/administration/helpers/user-notification-timezone-helper';
import { MY_PAGE_ROUTE } from '@/services/my-page/routes/route-constant';

const props = withDefaults(defineProps<{
    userId: string;
    manageDisabled: boolean;
}>(), {
    manageDisabled: false,
});

const state = reactive({
    title: computed<TranslateResult>(() => i18n.t('IAM.USER.NOTIFICATION.NOTIFICATION_CHANNEL')),
    loading: true,
    fields: computed(() => [
        { name: 'protocol_type', label: i18n.t('IAM.USER.NOTIFICATION.TYPE') },
        { name: 'name', label: i18n.t('IAM.USER.NOTIFICATION.CHANNEL_NAME') },
        { name: 'data', label: i18n.t('IAM.USER.NOTIFICATION.CHANNEL_INFO') },
        { name: 'schedule', label: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.SCHEDULE') },
        { name: 'subscriptions', label: i18n.t('IDENTITY.USER.NOTIFICATION.FORM.TOPIC') },
    ]),
    items: [] as (UserChannelModel & {protocol_type?: string})[],
    protocolList: [] as ProtocolModel[],
    manageLink: {
        name: MY_PAGE_ROUTE.NOTIFICATION.MANAGE._NAME,
        params: { userId: computed(() => encodeURIComponent(props.userId)) },
    },
    timezone: computed<string>(() => store.state.user.timezone),
});

const apiQuery = new ApiQueryHelper();
const listProtocol = async () => {
    try {
        apiQuery.setFilters([{ k: 'protocol_type', o: '=', v: 'EXTERNAL' }]);
        const res = await SpaceConnector.clientV2.notification.protocol.list<ProtocolListParameters, ListResponse<ProtocolModel>>({
            query: apiQuery.data,
        });
        state.protocolList = res.results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.protocolList = [];
    }
};

const injectProtocolName = (channel: UserChannelModel): string|undefined => state.protocolList.find((i) => i.protocol_id === channel.protocol_id)?.name;

const channelApiQuery = new ApiQueryHelper();
const listUserChannel = async () => {
    state.loading = true;
    try {
        channelApiQuery.setFilters([{ k: 'user_id', v: props.userId, o: '=' }]);
        const { results } = await SpaceConnector.clientV2.notification.userChannel.list<UserChannelListParameters, ListResponse<UserChannelModel>>({
            query: channelApiQuery.data,
        });
        state.items = results?.map((d) => ({
            ...d,
            protocol_type: injectProtocolName(d),
        })) ?? [];
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

</script>

<template>
    <section class="user-notifications-tab">
        <p-heading heading-type="sub"
                   :title="state.title"
        >
            <template #extra>
                <router-link :to="state.manageLink">
                    <p-button style-type="primary"
                              :disabled="manageDisabled"
                    >
                        {{ $t('IAM.USER.NOTIFICATION.MANAGE') }}
                    </p-button>
                </router-link>
            </template>
        </p-heading>

        <p-data-table
            :items="state.items"
            :loading="state.loading"
            :fields="state.fields"
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

<style lang="postcss" scoped>
.tab-header {
    display: flex;

    align-items: center;
    padding-right: 1rem;
}
</style>
