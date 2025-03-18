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
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { ValueHandlerMap } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WebhookListParameters } from '@/schema/alert-manager/webhook/api-verbs/list';
import { WEBHOOK_STATE } from '@/schema/alert-manager/webhook/constants';
import type { WebhookModel } from '@/schema/alert-manager/webhook/model';
import { i18n as _i18n } from '@/translations';

import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useQueryTags } from '@/common/composables/query-tags';

import ServiceDetailTabsWebhookDeleteModal
    from '@/services/alert-manager/v2/components/ServiceDetailTabsWebhookDeleteModal.vue';
import ServiceDetailTabsWebhookTableModal
    from '@/services/alert-manager/v2/components/ServiceDetailTabsWebhookTableModal.vue';
import ServiceDetailTabsWebhookUpdateModal
    from '@/services/alert-manager/v2/components/ServiceDetailTabsWebhookUpdateModal.vue';
import { alertManagerStateFormatter } from '@/services/alert-manager/v2/composables/refined-table-data';
import { SERVICE_TAB_HEIGHT } from '@/services/alert-manager/v2/constants/common-constant';
import {
    ALERT_EXCEL_FIELDS,
    WEBHOOK_MANAGEMENT_TABLE_FIELDS,
    WEBHOOK_MANAGEMENT_TABLE_KEY_ITEMS_SETS,
} from '@/services/alert-manager/v2/constants/webhook-table-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { WebhookModalType } from '@/services/alert-manager/v2/types/alert-manager-type';

interface Props {
    tableHeight: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 522,
});

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const router = useRouter();

const { hasReadWriteAccess } = usePageEditableStatus();

const tableState = reactive({
    actionMenu: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'ENABLE',
            label: _i18n.t('ALERT_MANAGER.ENABLE'),
            disabled: !state.selectedItem || state.selectedItem?.state === WEBHOOK_STATE.ENABLED,
        },
        {
            type: 'item',
            name: 'DISABLE',
            label: _i18n.t('ALERT_MANAGER.DISABLED'),
            disabled: !state.selectedItem || state.selectedItem?.state === WEBHOOK_STATE.DISABLED,
        },
        { type: 'divider' },
        {
            type: 'item',
            name: 'UPDATE',
            label: _i18n.t('ALERT_MANAGER.UPDATE'),
            disabled: !state.selectedItem,
        },
        {
            type: 'item',
            name: 'DELETE',
            label: _i18n.t('ALERT_MANAGER.DELETE'),
            disabled: !state.selectedItem,
        },
    ])),
    fields: WEBHOOK_MANAGEMENT_TABLE_FIELDS,
    valueHandlerMap: computed<ValueHandlerMap>(() => ({
        name: makeDistinctValueHandler('alert_manager.Webhook', 'name', 'string', [{ k: 'service_id', v: storeState.serviceId, o: 'eq' }]),
        state: makeEnumValueHandler(WEBHOOK_STATE),
        'plugin_info.plugin_id': makeDistinctValueHandler('alert_manager.Webhook', 'plugin_info.plugin_id', 'string', [{ k: 'service_id', v: storeState.serviceId, o: 'eq' }]),
    })),
});
const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => serviceDetailPageGetters.pluginsReferenceMap),
    timezone: computed<string>(() => serviceDetailPageGetters.timezone),
    serviceId: computed<string>(() => serviceDetailPageState.serviceInfo.service_id),
    selectedWebhookId: computed<string|undefined>(() => serviceDetailPageState.selectedWebhookId),
});
const state = reactive({
    loading: true,
    items: [] as WebhookModel[],
    totalCount: 0,
    selectIndex: undefined as number|undefined,
    selectedItem: computed<WebhookModel>(() => state.items[state.selectIndex]),
});
const modalState = reactive({
    visible: false,
    type: undefined as WebhookModalType|undefined,
});

const webhookListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true)
    .setPage(1, 15);
const queryTagHelper = useQueryTags({ keyItemSets: WEBHOOK_MANAGEMENT_TABLE_KEY_ITEMS_SETS });
const { queryTags } = queryTagHelper;

const handleCloseModal = () => {
    state.selectIndex = undefined;
    fetchWebhookList();
    serviceDetailPageStore.setSelectedWebhookId(undefined);
};
const initSelectedWebhook = () => {
    state.selectIndex = state.items.findIndex((item) => item.webhook_id === storeState.selectedWebhookId);
};
const handleClickCreateButton = () => {
    if (!hasReadWriteAccess) return;
    router.push({
        name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL.WEBHOOK.CREATE._NAME,
    }).catch(() => {});
};
const handleSelectDropdownItem = (name: WebhookModalType) => {
    modalState.visible = true;
    modalState.type = name;
};
const handleChangeToolbox = async (options: any = {}) => {
    if (options.sortBy !== undefined) webhookListApiQueryHelper.setSort(options.sortBy, options.sortDesc);
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);
    if (options.pageStart !== undefined) webhookListApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) webhookListApiQueryHelper.setPageLimit(options.pageLimit);
    await fetchWebhookList();
};
const handleExportExcel = async () => {
    await downloadExcel({
        url: '/alert-manager/webhook/list',
        param: {
            service_id: storeState.serviceId,
            query: { ...webhookListApiQueryHelper.data, only: ALERT_EXCEL_FIELDS.map((d) => d.key) },
        },
        fields: ALERT_EXCEL_FIELDS,
        file_name_prefix: FILE_NAME_PREFIX.webhook,
        timezone: storeState.timezone,
    });
};
const handleSelectTableRow = (item:number[]) => {
    if (item.length === 0) return;
    state.selectIndex = item[0];
    serviceDetailPageStore.setSelectedWebhookId(state.items[item[0]].webhook_id);
};

const fetchWebhookList = async () => {
    state.loading = true;
    try {
        webhookListApiQueryHelper.setFilters([
            ...queryTagHelper.filters.value,
        ]);
        const { results, total_count } = await SpaceConnector.clientV2.alertManager.webhook.list<WebhookListParameters, ListResponse<WebhookModel>>({
            query: webhookListApiQueryHelper.data,
            service_id: storeState.serviceId,
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

watch(() => storeState.serviceId, (id) => {
    if (!id) return;
    fetchWebhookList();
}, { immediate: true });
watch([() => storeState.selectedWebhookId, () => state.items], ([selectedWebhookId]) => {
    if (!selectedWebhookId) return;
    initSelectedWebhook();
}, { immediate: true });

onUnmounted(() => {
    serviceDetailPageStore.setSelectedWebhookId(undefined);
    serviceDetailPageStore.setCurrentTab(undefined);
});
</script>

<template>
    <div>
        <p-toolbox-table class="service-detail-tabs-webhook"
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
                         :key-item-sets="WEBHOOK_MANAGEMENT_TABLE_KEY_ITEMS_SETS"
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
                                   :title="$t('ALERT_MANAGER.WEBHOOK.TITLE')"
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
            <template #col-plugin_info.plugin_id-format="{value}">
                <div class="col-type">
                    <p-lazy-img :src="storeState.plugins[value] ? storeState.plugins[value].icon : 'ic_webhook'"
                                error-icon="ic_webhook"
                                width="1.5rem"
                                height="1.5rem"
                    />
                    {{ storeState.plugins[value] ? storeState.plugins[value].label : value }}
                </div>
            </template>
            <template #col-state-format="{ value }">
                <p-status
                    class="capitalize"
                    v-bind="alertManagerStateFormatter(value)"
                />
            </template>
            <template #col-requests.total-format="{ value }">
                <span>{{ value || 0 }}</span>
            </template>
            <template #col-requests.error-format="{ value, item }">
                <span v-if="value"
                      class="col-failed-requests"
                >
                    {{ value || 0 }}
                    <span>({{ ((value / item?.requests?.total) * 100).toFixed(1) }}%)</span>
                </span>
            </template>
        </p-toolbox-table>
        <div v-if="modalState.visible">
            <service-detail-tabs-webhook-update-modal v-if="modalState.type === 'UPDATE'"
                                                      :visible.sync="modalState.visible"
                                                      :selected-item="state.selectedItem"
                                                      @close="handleCloseModal"
            />
            <service-detail-tabs-webhook-delete-modal v-else-if="modalState.type === 'DELETE'"
                                                      :visible.sync="modalState.visible"
                                                      :selected-item="state.selectedItem"
                                                      @close="handleCloseModal"
            />
            <service-detail-tabs-webhook-table-modal v-else
                                                     :visible.sync="modalState.visible"
                                                     :selected-item="state.selectedItem"
                                                     @close="handleCloseModal"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
.service-detail-tabs-webhook {
    min-height: 29.875rem;
    border: none;
    .col-failed-requests {
        @apply text-red-500;
    }
    .col-type {
        @apply flex items-center;
        gap: 0.5rem;
    }

    /* custom design-system component - p-toolbox-table */
    :deep(.p-toolbox-table) {
        .p-data-table {
            height: calc(100% - 44rem);
        }
    }
}
</style>
