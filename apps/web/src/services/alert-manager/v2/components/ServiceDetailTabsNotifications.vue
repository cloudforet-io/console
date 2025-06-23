<script lang="ts" setup>
import {
    reactive, computed, onUnmounted,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { useQueryClient } from '@tanstack/vue-query';

import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
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

import { useServiceChannelApi } from '@/api-clients/alert-manager/service-channel/composables/use-service-channel-api';
import {
    SERVICE_CHANNEL_STATE,
    SERVICE_CHANNEL_TYPE,
} from '@/api-clients/alert-manager/service-channel/schema/constants';
import type { ServiceChannelModel } from '@/api-clients/alert-manager/service-channel/schema/model';
import { useScopedPaginationQuery } from '@/query/pagination/use-scoped-pagination-query';
import { useServiceQueryKey } from '@/query/query-key/use-service-query-key';
import { i18n } from '@/translations';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useQueryTags } from '@/common/composables/query-tags';

import ServiceDetailTabsNotificationsDeleteModal
    from '@/services/alert-manager/v2/components/ServiceDetailTabsNotificationsDeleteModal.vue';
import ServiceDetailTabsNotificationsTableModal
    from '@/services/alert-manager/v2/components/ServiceDetailTabsNotificationsTableModal.vue';
import ServiceDetailTabsNotificationsUpdateModal
    from '@/services/alert-manager/v2/components/ServiceDetailTabsNotificationsUpdateModal.vue';
import { alertManagerStateFormatter, getProtocolInfo } from '@/services/alert-manager/v2/composables/refined-table-data';
import { useNotificationProtocolListQuery } from '@/services/alert-manager/v2/composables/use-notification-protocol-list-query';
import { useServiceGetQuery } from '@/services/alert-manager/v2/composables/use-service-get-query';
import { SERVICE_TAB_HEIGHT } from '@/services/alert-manager/v2/constants/common-constant';
import {
    ALERT_EXCEL_FIELDS,
    NOTIFICATION_MANAGEMENT_TABLE_FIELDS,
    NOTIFICATION_MANAGEMENT_TABLE_KEY_ITEMS_SETS,
} from '@/services/alert-manager/v2/constants/notification-table-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useServiceCreateFormStore } from '@/services/alert-manager/v2/stores/service-create-form-store';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { NotificationsModalType } from '@/services/alert-manager/v2/types/alert-manager-type';

interface Props {
    tableHeight: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 522,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageGetters = serviceDetailPageStore.getters;
const serviceCreateFormStore = useServiceCreateFormStore();

const route = useRoute();
const router = useRouter();

const serviceId = computed<string>(() => route.params.serviceId as string);

const { hasReadWriteAccess } = usePageEditableStatus();

const { notificationProtocolListData } = useNotificationProtocolListQuery();
const { serviceData } = useServiceGetQuery(serviceId);

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
        name: makeDistinctValueHandler('alert_manager.ServiceChannel', 'name', 'string', [{ k: 'service_id', v: serviceId.value, o: 'eq' }]),
        state: makeEnumValueHandler(SERVICE_CHANNEL_STATE),
    })),
});
const storeState = reactive({
    timezone: computed<string>(() => serviceDetailPageGetters.timezone),
});
const state = reactive({
    refinedItems: computed<ServiceChannelModel[]>(() => (serviceChannelListData.value?.results || []).map((i) => {
        if (i.channel_type === SERVICE_CHANNEL_TYPE.FORWARD) {
            return {
                ...i,
                protocol_id: 'forward',
            };
        }
        return i;
    })),
    selectIndex: undefined as number|undefined,
    selectedItem: computed<ServiceChannelModel>(() => state.refinedItems[state.selectIndex]),
});
const paginationState = reactive({
    thisPage: 1,
    pageSize: 15,
});
const sortState = reactive({
    sortKey: 'created_at',
    sortDesc: true,
});
const modalState = reactive({
    visible: false,
    type: undefined as NotificationsModalType|undefined,
});

const notificationsListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true)
    .setPage(1, 15);
const queryTagHelper = useQueryTags({ keyItemSets: NOTIFICATION_MANAGEMENT_TABLE_KEY_ITEMS_SETS });
const { queryTags } = queryTagHelper;

const queryClient = useQueryClient();
const { serviceChannelAPI } = useServiceChannelApi();
const { key: serviceChannelListQueryKey, params: serviceChannelListQueryParams } = useServiceQueryKey('alert-manager', 'service-channel', 'list', {
    params: computed(() => {
        notificationsListApiQueryHelper.setFilters([
            ...queryTagHelper.filters.value,
        ]);
        return {
            query: {
                ...notificationsListApiQueryHelper.data,
                sort: [{ key: sortState.sortKey, desc: sortState.sortDesc }],
            },
            service_id: serviceId.value,
        };
    }),
    pagination: true,
});
const { data: serviceChannelListData, isLoading: serviceChannelListFetching, totalCount: serviceChannelListTotalCount } = useScopedPaginationQuery({
    queryKey: serviceChannelListQueryKey,
    queryFn: serviceChannelAPI.list,
    params: serviceChannelListQueryParams,
    gcTime: 1000 * 60 * 2,
    enabled: true,
}, {
    thisPage: computed(() => paginationState.thisPage),
    pageSize: computed(() => paginationState.pageSize),
    verb: 'list',
}, ['WORKSPACE']);

const refreshServiceChannelList = () => {
    queryClient.invalidateQueries({ queryKey: serviceChannelListQueryKey.value });
};

const handleCloseModal = () => {
    state.selectIndex = undefined;
    serviceDetailPageStore.setSelectedNotificationId(undefined);
};
const handleClickCreateButton = () => {
    if (!hasReadWriteAccess) return;
    serviceCreateFormStore.setCreatedService(serviceData.value || {});
    router.push({
        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL.NOTIFICATIONS.CREATE._NAME,
    }).catch(() => {});
};
const handleSelectDropdownItem = (name: NotificationsModalType) => {
    modalState.visible = true;
    modalState.type = name;
};
const handleChangeToolbox = async (options: any = {}) => {
    if (options.sortBy !== undefined) sortState.sortKey = options.sortBy;
    if (options.sortDesc !== undefined) sortState.sortDesc = options.sortDesc;
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);
};
const handleExportExcel = async () => {
    await downloadExcel({
        url: '/alert-manager/service-channel/list',
        param: {
            service_id: serviceId.value,
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
                         :loading="serviceChannelListFetching"
                         :total-count="serviceChannelListTotalCount"
                         :this-page.sync="paginationState.thisPage"
                         :page-size.sync="paginationState.pageSize"
                         :items="state.refinedItems"
                         :fields="tableState.fields"
                         :select-index="[state.selectIndex]"
                         :query-tags="queryTags"
                         :key-item-sets="NOTIFICATION_MANAGEMENT_TABLE_KEY_ITEMS_SETS"
                         :value-handler-map="tableState.valueHandlerMap"
                         :style="{height: `${props.tableHeight - SERVICE_TAB_HEIGHT}px`}"
                         @change="handleChangeToolbox"
                         @refresh="refreshServiceChannelList"
                         @export="handleExportExcel"
                         @select="handleSelectTableRow"
        >
            <template #toolbox-top>
                <p-heading-layout class="pt-8 px-4">
                    <template #heading>
                        <p-heading heading-type="sub"
                                   use-total-count
                                   :total-count="serviceChannelListTotalCount"
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
                                :src="assetUrlConverter(getProtocolInfo(value, notificationProtocolListData).icon || '')"
                                width="1rem"
                                height="1rem"
                    />
                    <span>{{ getProtocolInfo(value, notificationProtocolListData, item.data).name }}</span>
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
