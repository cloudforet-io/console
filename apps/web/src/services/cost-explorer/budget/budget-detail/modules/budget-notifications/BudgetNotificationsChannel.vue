<script lang="ts" setup>

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PBadge, PDataTable } from '@spaceone/design-system';
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { ProtocolReferenceMap } from '@/store/modules/reference/protocol/type';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { utcToTimezoneFormatter } from '@/services/administration/iam/user/lib/helper';
import type { ChannelItem } from '@/services/administration/iam/user/type';


const getBadgeColor = (level: string) => {
    switch (level) {
    case 'LV1':
        return 'secondary1';
    case 'LV2':
        return 'indigo500';
    case 'LV3':
        return 'peacock400';
    case 'LV4':
        return 'coral500';
    case 'LV5':
        return 'alert';
    default:
        return 'primary';
    }
};

interface Props {
    projectId?: string;
}

const props = defineProps<Props>();
const store = useStore();
const { t } = useI18n();

const state = reactive({
    loading: false,
    fields: computed(() => [
        { name: 'protocol_id', label: t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.FIELD.CHANNEL') },
        { name: 'name', label: t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.FIELD.CHANNEL_NAME') },
        { name: 'data', label: t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.FIELD.DETAILS') },
        { name: 'notification_level', label: t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.FIELD.NOTIFICATIONS_LEVEL') },
        { name: 'schedule', label: t('BILLING.COST_MANAGEMENT.BUDGET.DETAIL.FIELD.SCHEDULE') },
    ]),
    items: [] as ChannelItem[],
    timezone: computed(() => store.state.user.timezone),
    protocols: computed<ProtocolReferenceMap>(() => store.getters['reference/protocolItems']),
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

const protocolFormatter = (val) => state.protocols[val]?.name || val;

(async () => {
    await Promise.allSettled([
        listNotificationsChannel(),
        // LOAD REFERENCE STORE
        store.dispatch('reference/protocol/load'),
    ]);
})();

</script>

<template>
    <p-data-table
        :items="state.items"
        :loading="state.loading"
        :fields="state.fields"
        :striped="false"
        class="budget-notifications-channel"
    >
        <template #col-protocol_id-format="{value}">
            {{ protocolFormatter(value) }}
        </template>
        <template #col-data-format="{ index, item }">
            <p v-if="item.secret_id.length > 0">
                <!-- masking secret data -->
                data: *******
            </p>
            <p v-if="item.data && Object.keys(item.data)[0] === 'users'">
                <span v-for="user in item.data.users"
                      :key="`${user}-${index}`"
                >
                    <p-badge style-type="gray200"
                             badge-type="subtle"
                             shape="square"
                             class="rounded mr-1"
                    >{{ user }}</p-badge>
                </span>
            </p>
            <div v-else-if="item.data">
                <p v-for="(value, dIdx) in item.data"
                   :key="`item-${dIdx}`"
                >
                    {{ value }}
                </p>
            </div>
        </template>
        <template #col-notification_level-format="{value}">
            <p-badge :style-type="getBadgeColor(value)"
                     badge-type="solid-outline"
            >
                {{ value }}
            </p-badge>
        </template>
        <template #col-schedule-format="{value}">
            <p v-if="value">
                <span v-for="day in value.day_of_week"
                      :key="day"
                > {{ day }}</span><br>
                {{ utcToTimezoneFormatter(value.start_hour, state.timezone) }}:00 ~
                {{ utcToTimezoneFormatter(value.end_hour, state.timezone) }}:00
            </p>
            <span v-else>{{ t('IDENTITY.USER.NOTIFICATION.FORM.ALL_TIME') }}</span>
        </template>
    </p-data-table>
</template>
