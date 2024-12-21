<script lang="ts" setup>
import {
    reactive, computed, watch, onUnmounted,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable,
    PHeading,
    PButton,
    PStatus,
    PLazyImg,
    PSelectDropdown,
    PHeadingLayout,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { NotificationProtocolModel } from '@/schema/alert-manager/notification-protocol/model';
import type { ServiceChannelListParameters } from '@/schema/alert-manager/service-channel/api-verbs/list';
import { SERVICE_CHANNEL_STATE } from '@/schema/alert-manager/service-channel/constants';
import type { ServiceChannelModel } from '@/schema/alert-manager/service-channel/model';
import type { WebhookModel } from '@/schema/alert-manager/webhook/model';
import { i18n as _i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useQueryTags } from '@/common/composables/query-tags';

import { alertManagerStateFormatter } from '@/services/alert-manager-v2/composables/refined-table-data';
import { SERVICE_TAB_HEIGHT } from '@/services/alert-manager-v2/constants/common-constant';
import {
    ALERT_EXCEL_FIELDS,
    NOTIFICATION_MANAGEMENT_TABLE_FIELDS,
    NOTIFICATION_MANAGEMENT_TABLE_HANDLER,
} from '@/services/alert-manager-v2/constants/notification-table-constant';
import { ALERT_MANAGER_ROUTE_V2 } from '@/services/alert-manager-v2/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager-v2/stores/service-detail-page-store';
import type { ProtocolInfo } from '@/services/alert-manager-v2/types/alert-manager-type';

interface Props {
    tableHeight: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 522,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;
const userStore = useUserStore();
const userState = userStore.state;
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

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
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
    notificationProtocolList: computed<NotificationProtocolModel[]>(() => serviceDetailPageState.notificationProtocolList),
    timezone: computed<string>(() => userState.timezone || ''),
});
const state = reactive({
    loading: false,
    items: [] as ServiceChannelModel[],
    totalCount: 0,
    selectIndex: undefined as number|undefined,
    selectedItem: computed<WebhookModel>(() => state.items[state.selectIndex]),
});

const notificationsListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true)
    .setPage(1, 15);
const queryTagHelper = useQueryTags({ keyItemSets: NOTIFICATION_MANAGEMENT_TABLE_HANDLER.keyItemSets });
const { queryTags } = queryTagHelper;

const getProtocolInfo = (id: string): ProtocolInfo => {
    const protocol = storeState.notificationProtocolList.find((item) => item.protocol_id === id);
    const plugin = storeState.plugins[protocol?.plugin_info.plugin_id || ''];
    return {
        name: protocol?.name || '',
        icon: plugin?.icon || '',
    };
};
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
const handleExportExcel = async () => {
    await downloadExcel({
        url: '/alertManager/serviceChannel/list',
        param: {
            query: { ...notificationsListApiQueryHelper.data, only: ALERT_EXCEL_FIELDS.map((d) => d.key) },
        },
        fields: ALERT_EXCEL_FIELDS,
        file_name_prefix: FILE_NAME_PREFIX.notifications,
        timezone: storeState.timezone,
    });
};
const handleSelectTableRow = (item:number[]) => {
    if (item.length === 0) return;
    state.selectIndex = item[0];
    serviceDetailPageStore.setSelectedNotificationId(state.items[item[0]].channel_id);
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

watch(() => storeState.serviceId, (id) => {
    if (!id) return;
    fetchNotificationList();
}, { immediate: true });

onUnmounted(() => {
    serviceDetailPageStore.setSelectedNotificationId(undefined);
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
                     :select-index="[state.selectIndex]"
                     :query-tags="queryTags"
                     :key-item-sets="NOTIFICATION_MANAGEMENT_TABLE_HANDLER.keyItemSets"
                     :value-handler-map="NOTIFICATION_MANAGEMENT_TABLE_HANDLER.valueHandlerMap"
                     :style="{height: `${props.tableHeight - SERVICE_TAB_HEIGHT}px`}"
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
                v-bind="alertManagerStateFormatter(value)"
            />
        </template>
        <template #col-protocol_id-format="{value}">
            <div class="col-channel">
                <p-lazy-img :src="assetUrlConverter(getProtocolInfo(value).icon)"
                            width="1rem"
                            height="1rem"
                            class="service-img"
                />
                <span>{{ getProtocolInfo(value).name }}</span>
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
