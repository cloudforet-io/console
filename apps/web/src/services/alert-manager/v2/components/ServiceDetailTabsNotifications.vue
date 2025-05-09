<script lang="ts" setup>
import {
    reactive, computed, watch, onUnmounted,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
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
    PI,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { ServiceChannelListParameters } from '@/schema/alert-manager/service-channel/api-verbs/list';
import {
    SERVICE_CHANNEL_STATE,
    SERVICE_CHANNEL_TYPE,
} from '@/schema/alert-manager/service-channel/constants';
import type { ServiceChannelModel } from '@/schema/alert-manager/service-channel/model';
import type { ServiceModel } from '@/schema/alert-manager/service/model';
import { i18n } from '@/translations';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useQueryTags } from '@/common/composables/query-tags';

import ServiceDetailTabsNotificationsDeleteModal
    from '@/services/alert-manager/v2/components/ServiceDetailTabsNotificationsDeleteModal.vue';
import ServiceDetailTabsNotificationsTableModal
    from '@/services/alert-manager/v2/components/ServiceDetailTabsNotificationsTableModal.vue';
import ServiceDetailTabsNotificationsUpdateModal
    from '@/services/alert-manager/v2/components/ServiceDetailTabsNotificationsUpdateModal.vue';
import { alertManagerStateFormatter, getProtocolInfo } from '@/services/alert-manager/v2/composables/refined-table-data';
import { SERVICE_TAB_HEIGHT } from '@/services/alert-manager/v2/constants/common-constant';
import {
    ALERT_EXCEL_FIELDS,
    NOTIFICATION_MANAGEMENT_TABLE_FIELDS,
    NOTIFICATION_MANAGEMENT_TABLE_KEY_ITEMS_SETS,
} from '@/services/alert-manager/v2/constants/notification-table-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useServiceCreateFormStore } from '@/services/alert-manager/v2/stores/service-create-form-store';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { NotificationsModalType, ProtocolCardItemType } from '@/services/alert-manager/v2/types/alert-manager-type';

interface Props {
    tableHeight: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 522,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;
const serviceDetailPageGetters = serviceDetailPageStore.getters;
const serviceCreateFormStore = useServiceCreateFormStore();

const router = useRouter();

const { hasReadWriteAccess } = usePageEditableStatus();

const tableState = reactive({
    actionMenu: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'ENABLE',
            label: i18n.t('ALERT_MANAGER.ENABLE'),
            disabled: !state.selectedItem || state.selectedItem?.state === SERVICE_CHANNEL_STATE.ENABLED,
        },
        {
            type: 'item',
            name: 'DISABLE',
            label: i18n.t('ALERT_MANAGER.DISABLED'),
            disabled: !state.selectedItem || state.selectedItem?.state === SERVICE_CHANNEL_STATE.DISABLED,
        },
        { type: 'divider' },
        {
            type: 'item',
            name: 'UPDATE',
            label: i18n.t('ALERT_MANAGER.UPDATE'),
            disabled: !state.selectedItem,
        },
        {
            type: 'item',
            name: 'DELETE',
            label: i18n.t('ALERT_MANAGER.DELETE'),
            disabled: !state.selectedItem,
        },
    ])),
    fields: NOTIFICATION_MANAGEMENT_TABLE_FIELDS,
    valueHandlerMap: computed<ValueHandlerMap>(() => ({
        name: makeDistinctValueHandler('alert_manager.ServiceChannel', 'name', 'string', [{ k: 'service_id', v: storeState.service.service_id, o: 'eq' }]),
        state: makeEnumValueHandler(SERVICE_CHANNEL_STATE),
    })),
});
const storeState = reactive({
    timezone: computed<string>(() => serviceDetailPageGetters.timezone),
    service: computed<ServiceModel>(() => serviceDetailPageState.serviceInfo),
    notificationProtocolList: computed<ProtocolCardItemType[]>(() => serviceDetailPageGetters.notificationProtocolList),
});
const state = reactive({
    loading: false,
    items: [] as ServiceChannelModel[],
    refinedItems: computed<ServiceChannelModel[]>(() => state.items.map((i) => {
        if (i.channel_type === SERVICE_CHANNEL_TYPE.FORWARD) {
            return {
                ...i,
                protocol_id: 'forward',
            };
        }
        return i;
    })),
    totalCount: 0,
    selectIndex: undefined as number|undefined,
    selectedItem: computed<ServiceChannelModel>(() => state.refinedItems[state.selectIndex]),
});
const modalState = reactive({
    visible: false,
    type: undefined as NotificationsModalType|undefined,
});

const notificationsListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true)
    .setPage(1, 15);
const queryTagHelper = useQueryTags({ keyItemSets: NOTIFICATION_MANAGEMENT_TABLE_KEY_ITEMS_SETS });
const { queryTags } = queryTagHelper;

const handleCloseModal = () => {
    state.selectIndex = undefined;
    fetchNotificationList();
    serviceDetailPageStore.setSelectedNotificationId(undefined);
};
const handleClickCreateButton = () => {
    if (!hasReadWriteAccess) return;
    serviceCreateFormStore.setCreatedService(storeState.service);
    router.push({
        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL.NOTIFICATIONS.CREATE._NAME,
    }).catch(() => {});
};
const handleSelectDropdownItem = (name: NotificationsModalType) => {
    modalState.visible = true;
    modalState.type = name;
};
const handleChangeToolbox = async (options: any = {}) => {
    if (options.sortBy !== undefined) notificationsListApiQueryHelper.setSort(options.sortBy, options.sortDesc);
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);
    if (options.pageStart !== undefined) notificationsListApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) notificationsListApiQueryHelper.setPageLimit(options.pageLimit);
    await fetchNotificationList();
};
const handleExportExcel = async () => {
    await downloadExcel({
        url: '/alert-manager/service-channel/list',
        param: {
            service_id: storeState.service.service_id,
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
    serviceDetailPageStore.setSelectedNotificationId(state.refinedItems[item[0]].channel_id);
};

const fetchNotificationList = async () => {
    state.loading = true;
    try {
        notificationsListApiQueryHelper.setFilters([
            ...queryTagHelper.filters.value,
        ]);
        const { results, total_count } = await SpaceConnector.clientV2.alertManager.serviceChannel.list<ServiceChannelListParameters, ListResponse<ServiceChannelModel>>({
            query: notificationsListApiQueryHelper.data,
            service_id: storeState.service.service_id,
        });
        state.items = results || [];
        state.totalCount = total_count || 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
        state.totalCount = 0;
    } finally {
        state.loading = false;
    }
};

watch(() => storeState.service.service_id, (id) => {
    if (!id) return;
    fetchNotificationList();
}, { immediate: true });

onUnmounted(() => {
    serviceDetailPageStore.setSelectedNotificationId(undefined);
    serviceDetailPageStore.setCurrentTab(undefined);
});
</script>

<template>
    <div>
        <p-toolbox-table class="service-detail-tabs-notifications"
                         search-type="query"
                         selectable
                         sortable
                         exportable
                         :multi-select="false"
                         :loading="state.loading"
                         :total-count="state.totalCount"
                         :items="state.refinedItems"
                         :fields="tableState.fields"
                         :select-index="[state.selectIndex]"
                         :query-tags="queryTags"
                         :key-item-sets="NOTIFICATION_MANAGEMENT_TABLE_KEY_ITEMS_SETS"
                         :value-handler-map="tableState.valueHandlerMap"
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
                    <template v-if="hasReadWriteAccess"
                              #extra
                    >
                        <p-button style-type="primary"
                                  icon-left="ic_plus_bold"
                                  @click="handleClickCreateButton"
                        >
                            {{ $t('ALERT_MANAGER.CREATE') }}
                        </p-button>
                    </template>
                </p-heading-layout>
            </template>
            <template v-if="hasReadWriteAccess"
                      #toolbox-left
            >
                <p-select-dropdown :menu="tableState.actionMenu"
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
            <template #col-protocol_id-format="{value, item}">
                <div class="col-channel">
                    <p-i v-if="value === 'forward'"
                         name="ic_notification-protocol_users"
                         width="1rem"
                         height="1rem"
                    />
                    <p-lazy-img v-else
                                :src="assetUrlConverter(getProtocolInfo(value, storeState.notificationProtocolList).icon || '')"
                                width="1rem"
                                height="1rem"
                    />
                    <span>{{ getProtocolInfo(value, storeState.notificationProtocolList, item.data).name }}</span>
                </div>
            </template>
        </p-toolbox-table>
        <div v-if="modalState.visible">
            <service-detail-tabs-notifications-update-modal v-if="modalState.type === 'UPDATE'"
                                                            :visible.sync="modalState.visible"
                                                            :selected-item="state.selectedItem"
                                                            @close="handleCloseModal"
            />
            <service-detail-tabs-notifications-delete-modal v-else-if="modalState.type === 'DELETE'"
                                                            :visible.sync="modalState.visible"
                                                            :selected-item="state.selectedItem"
                                                            @close="handleCloseModal"
            />
            <service-detail-tabs-notifications-table-modal v-else
                                                           :visible.sync="modalState.visible"
                                                           :selected-item="state.selectedItem"
                                                           @close="handleCloseModal"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-notifications {
    border: none;
    min-height: 29.875rem;
    .col-channel {
        @apply flex items-center;
        gap: 0.5rem;
    }
}
</style>
