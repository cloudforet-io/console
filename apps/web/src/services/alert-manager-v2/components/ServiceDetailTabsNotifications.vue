<script lang="ts" setup>
import {
    reactive, computed, onMounted,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable,
    PHeading,
    PButton,
    PStatus,
    PI,
    PSelectDropdown,
    PHeadingLayout,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { ServiceChannelListParameters } from '@/schema/alert-manager/service-channel/api-verbs/list';
import { SERVICE_CHANNEL_STATE } from '@/schema/alert-manager/service-channel/constants';
import type { ServiceChannelModel } from '@/schema/alert-manager/service-channel/model';
import { i18n as _i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useProxyValue } from '@/common/composables/proxy-state';
import { useQueryTags } from '@/common/composables/query-tags';

import { webhookStateFormatter } from '@/services/alert-manager-v2/composables/refined-table-data';
import {
    NOTIFICATION_MANAGEMENT_TABLE_FIELDS,
    NOTIFICATION_MANAGEMENT_TABLE_HANDLER,
} from '@/services/alert-manager-v2/constants/notification-table-constant';
import { ALERT_MANAGER_ROUTE_V2 } from '@/services/alert-manager-v2/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager-v2/stores/service-detail-page-store';

interface Props {
    selectedId?: string
}

const props = withDefaults(defineProps<Props>(), {
    selectedId: undefined,
});

const emit = defineEmits<{(e: 'update:selected-id', value: string): void;
}>();

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();

const tableState = reactive({
    actionMenu: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'enable',
            label: _i18n.t('ALERT_MANAGER.ENABLE'),
            disabled: state.selectedItem?.state === SERVICE_CHANNEL_STATE.ENABLED,
        },
        {
            type: 'item',
            name: 'disable',
            label: _i18n.t('ALERT_MANAGER.DISABLED'),
            disabled: state.selectedItem?.state === SERVICE_CHANNEL_STATE.DISABLED,
        },
        { type: 'divider' },
        {
            type: 'item',
            name: 'update',
            label: _i18n.t('ALERT_MANAGER.UPDATE'),
        },
        {
            type: 'item',
            name: 'delete',
            label: _i18n.t('ALERT_MANAGER.DELETE'),
        },
    ])),
    fields: NOTIFICATION_MANAGEMENT_TABLE_FIELDS,
});
const storeState = reactive({
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
});
const state = reactive({
    loading: false,
    items: [] as ServiceChannelModel[],
    totalCount: 0,
    selectIndex: [],
    selectedItem: computed<ServiceChannelModel>(() => state.items[state.selectIndex[0]]),
    proxySelectedId: useProxyValue<string>('selectedId', props, emit),
});

const notificationsListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true);
const queryTagHelper = useQueryTags({ keyItemSets: NOTIFICATION_MANAGEMENT_TABLE_HANDLER.keyItemSets });
const { queryTags } = queryTagHelper;

const handleClickCreateButton = () => {
    router.push(getProperRouteLocation({
        name: ALERT_MANAGER_ROUTE_V2.SERVICE.DETAIL.NOTIFICATIONS.CREATE._NAME,
    }));
};
const handleSelectDropdownItem = (name) => {
    console.log('TODO: handleSelectDropdownItem', name);
};
const handleChangeToolbox = async (options: any = {}) => {
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);
    if (options.pageStart !== undefined) notificationsListApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) notificationsListApiQueryHelper.setPageLimit(options.pageLimit);
    await fetchNotificationList();
};
const handleExportExcel = () => {
    console.log('TODO: handleExportExcel');
};
const handleSelectTableRow = () => {
    state.proxySelectedId = state.selectedItem.channel_id;
};

const fetchNotificationList = async () => {
    state.loading = true;
    try {
        notificationsListApiQueryHelper.setFilters([
            ...queryTagHelper.filters.value,
        ]);
        const { results, total_count } = await SpaceConnector.clientV2.alertManager.serviceChannel.list<ServiceChannelListParameters, ListResponse<ServiceChannelModel>>({
            query: notificationsListApiQueryHelper.data,
            service_id: storeState.serviceId,
        });
        state.items = results || [];
        state.totalCount = total_count || 0;
    } catch (e) {
        ErrorHandler.handleError(e, true);
        state.items = [];
        state.totalCount = 0;
    } finally {
        state.loading = false;
    }
};

onMounted(() => {
    fetchNotificationList();
});
</script>

<template>
    <p-toolbox-table class="service-detail-tabs-notifications"
                     search-type="query"
                     selectable
                     sortable
                     exportable
                     :multi-select="false"
                     :loading="state.loading"
                     :total-count="state.totalCount"
                     :items="state.items"
                     :fields="tableState.fields"
                     :select-index.sync="state.selectIndex"
                     :query-tags="queryTags"
                     :key-item-sets="NOTIFICATION_MANAGEMENT_TABLE_HANDLER.keyItemSets"
                     :value-handler-map="NOTIFICATION_MANAGEMENT_TABLE_HANDLER.valueHandlerMap"
                     @change="handleChangeToolbox"
                     @refresh="handleChangeToolbox()"
                     @export="handleExportExcel"
                     @select="handleSelectTableRow"
    >
        <template #toolbox-top>
            <p-heading-layout class="pt-8 px-4">
                <template #heading>
                    <p-heading heading-type="sub"
                               use-total-count
                               :total-count="state.totalCount"
                               :title="$t('ALERT_MANAGER.NOTIFICATIONS.TITLE')"
                    />
                </template>
                <template #extra>
                    <p-button style-type="primary"
                              icon-left="ic_plus_bold"
                              @click="handleClickCreateButton"
                    >
                        {{ $t('ALERT_MANAGER.CREATE') }}
                    </p-button>
                </template>
            </p-heading-layout>
        </template>
        <template #toolbox-left>
            <p-select-dropdown :menu="tableState.actionMenu"
                               :disabled="!state.selectedItem"
                               reset-selection-on-menu-close
                               :placeholder="$t('ALERT_MANAGER.ACTION')"
                               @select="handleSelectDropdownItem"
            />
        </template>
        <template #col-state-format="{ value }">
            <p-status
                class="capitalize"
                v-bind="webhookStateFormatter(value)"
            />
        </template>
        <template #col-channel-format="{value}">
            <div class="col-channel">
                <p-i name="ic_envelope-filled"
                     width="1rem"
                     height="1rem"
                     color="gray-200"
                />
                <span>{{ value }}</span>
            </div>
        </template>
    </p-toolbox-table>
</template>

<style scoped lang="postcss">
.service-detail-tabs-notifications {
    border: none;
    .col-channel {
        @apply flex items-center;
        gap: 0.5rem;
    }
}
</style>
