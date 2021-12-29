<template>
    <p-data-table
        :items="items"
        :loading="loading"
        :fields="fields"
        :striped="false"
        class="budget-notifications-channel"
    >
        <template #col-protocol_id-format="{value}">
            {{ protocolFormatter(value) }}
        </template>
        <template #col-data-format="{ index, field, item }">
            <p v-if="item.secret_id.length > 0">
                <!-- masking secret data -->
                data: *******
            </p>
            <p v-if="item.data && Object.keys(item.data)[0] === 'users'">
                <span v-for="user in item.data.users" :key="`${user}-${index}`">
                    <p-badge style-type="gray200" shape="square" class="rounded mr-1">{{ user }}</p-badge>
                </span>
            </p>
            <div v-else-if="item.data">
                <p v-for="(value, index) in item.data" :key="`item-${index}`">
                    {{ value }}
                </p>
            </div>
        </template>
        <template #col-notification_level-format="{value}">
            <p-badge :style-type="getBadgeColor(value)" outline>
                {{ value }}
            </p-badge>
        </template>
        <template #col-schedule-format="{value}">
            <p v-if="value">
                <span v-for="day in value.day_of_week" :key="day"> {{ day }}</span><br>
                {{ utcToTimezoneFormatter(value.start_hour, timezone) }}:00 ~
                {{ utcToTimezoneFormatter(value.end_hour, timezone) }}:00
            </p>
            <span v-else>{{ $t('IDENTITY.USER.NOTIFICATION.FORM.ALL_TIME') }}</span>
        </template>
    </p-data-table>
</template>

<script lang="ts">
import { PBadge, PDataTable } from '@spaceone/design-system';
import { utcToTimezoneFormatter } from '@/services/identity/user/lib/helper';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { store } from '@/store';
import { ChannelItem } from '@/services/identity/user/type';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';

const getBadgeColor = (level: string) => {
    switch (level) {
    case 'LV1':
        return 'secondary1';
    case 'LV2':
        return 'indigo';
    case 'LV3':
        return 'peacock';
    case 'LV4':
        return 'coral500';
    case 'LV5':
        return 'alert';
    default:
        return 'primary';
    }
};

export default {
    name: 'BudgetNotificationsChannel',
    components: {
        PDataTable,
        PBadge,
    },
    props: {
        projectId: {
            type: String,
            default: undefined,
        },
    },
    setup(props) {
        const state = reactive({
            loading: false,
            fields: computed(() => [
                { name: 'protocol_id', label: 'Channel' },
                { name: 'name', label: 'Channel Name' },
                { name: 'data', label: 'Details' },
                { name: 'notification_level', label: 'Notifications Level' },
                { name: 'schedule', label: 'Schedule ' },
            ]),
            items: [] as ChannelItem[],
            timezone: computed(() => store.state.user.timezone),
            protocols: computed(() => store.state.resource.protocol.items),
        });

        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper
            .setFilters([{ k: 'project_id', v: props.projectId, o: '=' }])
            .setOrFilters([{ k: 'is_subscribe', v: false, o: '=' }, { k: 'subscriptions', v: 'cost_analysis.Budget', o: '=' }]);

        const listNotificationsChannel = async () => {
            state.loading = true;
            try {
                const { results } = await SpaceConnector.client.notification.projectChannel.list({
                    query: apiQueryHelper.data,
                });
                state.items = results;
            } catch (e) {
                state.items = [];
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };

        const protocolFormatter = val => state.protocols[val]?.name || val;

        (async () => {
            await Promise.allSettled([listNotificationsChannel(), store.dispatch('resource/protocol/load')]);
        })();

        return {
            ...toRefs(state),
            utcToTimezoneFormatter,
            getBadgeColor,
            protocolFormatter,
        };
    },
};
</script>
