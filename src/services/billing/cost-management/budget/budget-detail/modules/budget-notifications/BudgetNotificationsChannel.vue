<template>
    <p-data-table
        :items="items"
        :loading="loading"
        :fields="fields"
        :striped="false"
        class="budget-notifications-channel"
    >
        <template #col-data-format="{ index, field, item }">
            <div v-if="item.data.length > 1">
                <p v-for="(value, index) in item.data" :key="`item-${index}`">
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
                <span v-for="day in value.day_of_week" :key="day"> {{ day }}</span><br>
                {{ utcToTimezoneFormatter(value.start_hour, timezone) }}:00 ~
                {{ utcToTimezoneFormatter(value.end_hour, timezone) }}:00
            </p>
            <span v-else>{{ $t('IDENTITY.USER.NOTIFICATION.FORM.ALL_TIME') }}</span>
        </template>
    </p-data-table>
</template>

<script lang="ts">
import { PDataTable } from '@spaceone/design-system';
import { utcToTimezoneFormatter } from '@/services/identity/user/lib/helper';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { store } from '@/store';
import { ChannelItem } from '@/services/identity/user/type';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';

export default {
    name: 'BudgetNotificationsChannel',
    components: {
        PDataTable,
    },
    setup() {
        const state = reactive({
            loading: false,
            fields: computed(() => [
                { name: 'protocol_type', label: 'Channel' },
                { name: 'name', label: 'Channel Name' },
                { name: 'data', label: 'Details' },
                { name: 'notification_level', label: 'Notifications Level' },
            ]),
            items: [] as ChannelItem[],
            timezone: computed(() => store.state.user.timezone),
        });

        const apiQueryHelper = new ApiQueryHelper();
        apiQueryHelper
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

        (async () => {
            await listNotificationsChannel();
        })();

        return {
            ...toRefs(state),
            utcToTimezoneFormatter,
        };
    },
};
</script>
