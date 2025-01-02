<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable, PSelectDropdown, PLink, PBadge, PI, PSelectStatus, PDivider,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/src/data-display/tables/data-table/type';
import { ACTION_ICON } from '@cloudforet/mirinae/src/navigation/link/type';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { ALERT_STATUS, ALERT_URGENCY } from '@/schema/alert-manager/alert/constants';
import type { AlertModel } from '@/schema/alert-manager/alert/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CloudServiceTypeReferenceMap } from '@/store/reference/cloud-service-type-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useQueryTags } from '@/common/composables/query-tags';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';

import { red } from '@/styles/colors';

import {
    alertStatusBadgeStyleTypeFormatter,
    getAlertStateI18n,
    getAlertUrgencyI18n,
} from '@/services/alert-manager/composables/alert-table-data';
import {
    ALERT_EXCEL_FIELDS,
    ALERT_MANAGEMENT_TABLE_FIELDS,
    ALERT_MANAGEMENT_TABLE_HANDLER,
    ALERT_STATUS_FILTERS,
} from '@/services/alert-manager/constants/alert-table-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/routes/route-constant';
import { useAlertPageStore } from '@/services/alert-manager/stores/alert-page-store';
import type { AlertFilterType } from '@/services/alert-manager/types/alert-manager-type';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';

interface AlertItem extends AlertModel {
    alert_number: string;
}

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const alertPageStore = useAlertPageStore();
const alertPageState = alertPageStore.state;
const alertPageGetters = alertPageStore.getters;
const userStore = useUserStore();
const userState = userStore.state;

const { getProperRouteLocation } = useProperRouteLocation();

const route = useRoute();

const storeState = reactive({
    cloudServiceTypeInfo: computed<CloudServiceTypeReferenceMap>(() => allReferenceGetters.cloudServiceType),
    serviceDropdownList: computed<SelectDropdownMenuItem[]>(() => alertPageGetters.serviceDropdownList),
    totalCount: computed<number>(() => alertPageState.totalAlertCount),
    alertList: computed<AlertModel[]>(() => alertPageState.alertList),
    timezone: computed<string>(() => userState.timezone || ''),
});
const state = reactive({
    loading: false,
    visibleCustomFieldModal: false,

    refinedAlertList: computed<AlertItem[]>(() => storeState.alertList.map((alert) => {
        const number = alert.alert_id.split('-');
        return {
            ...alert,
            alert_number: number[number.length - 1],
            created_at: iso8601Formatter(alert.created_at, storeState.timezone),
        };
    })),
    alertStateLabels: getAlertStateI18n(),
    urgencyLabels: getAlertUrgencyI18n(),
    fields: ALERT_MANAGEMENT_TABLE_FIELDS,
});
const filterState = reactive({
    selectedServiceId: '',
    statusFields: computed<AlertFilterType[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.OPEN'), name: ALERT_STATUS_FILTERS.OPEN },
        { label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'), name: ALERT_STATUS_FILTERS.TRIGGERED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'), name: ALERT_STATUS_FILTERS.ACKNOWLEDGED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'), name: ALERT_STATUS_FILTERS.RESOLVED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ERROR'), name: ALERT_STATUS_FILTERS.ERROR },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
    ])),
    selectedStatusFilter: 'OPEN',
    urgencyFields: computed<AlertFilterType[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
        { label: i18n.t('ALERT_MANAGER.ALERTS.HIGH'), name: ALERT_URGENCY.HIGH },
        { label: i18n.t('ALERT_MANAGER.ALERTS.LOW'), name: ALERT_URGENCY.LOW },
    ])),
    selectedUrgencyFilter: 'ALL',
});

const alertListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true)
    .setPage(1, 15);

const filterQueryHelper = new QueryHelper();
const queryTagHelper = useQueryTags({ keyItemSets: ALERT_MANAGEMENT_TABLE_HANDLER.keyItemSets });
const { queryTags } = queryTagHelper;

const getAssetInfo = (assetId: string) => {
    const assetTypeData = storeState.cloudServiceTypeInfo[assetId]?.data;
    return {
        provider: assetTypeData?.provider,
        group: assetTypeData?.group,
        name: assetTypeData?.cloud_service_type_key,
    };
};
const getServiceName = (id: string): TranslateResult => {
    if (storeState.serviceDropdownList.length === 0) return '';
    return storeState.serviceDropdownList.find((i) => i.name === id)?.label || '';
};
const handleSelectServiceDropdownItem = (id: string) => {
    filterState.selectedServiceId = id;
    fetchAlertsList();
};
const handleSelectFilter = (type: 'status' | 'urgency', value: string) => {
    if (type === 'status') {
        filterState.selectedStatusFilter = value;
    } else {
        filterState.selectedUrgencyFilter = value;
    }
    fetchAlertsList();
};
const handleChange = async (options: any = {}) => {
    if (options.sortBy !== undefined) alertListApiQueryHelper.setSort(options.sortBy, options.sortDesc);
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);
    if (options.pageStart !== undefined) alertListApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) alertListApiQueryHelper.setPageLimit(options.pageLimit);
    await fetchAlertsList();
};
const handleClickSettings = () => {
    state.visibleCustomFieldModal = true;
};
const handleVisibleCustomFieldModal = (visible) => {
    state.visibleCustomFieldModal = visible;
};
const handleCustomFieldUpdate = (fields: DataTableFieldType[]) => {
    state.fields = fields;
};
const handleExportToExcel = async () => {
    await downloadExcel({
        url: '/alert-manager/alert/list',
        param: {
            query: { ...alertListApiQueryHelper.data, only: ALERT_EXCEL_FIELDS.map((d) => d.key) },
        },
        fields: ALERT_EXCEL_FIELDS,
        file_name_prefix: FILE_NAME_PREFIX.alert,
        timezone: storeState.timezone,
    });
};

const fetchAlertsList = async () => {
    try {
        filterQueryHelper.setFilters([]);
        if (filterState.selectedStatusFilter === ALERT_STATUS_FILTERS.OPEN) {
            filterQueryHelper.addFilter({ k: 'status', v: [ALERT_STATUS_FILTERS.TRIGGERED, ALERT_STATUS_FILTERS.ACKNOWLEDGED], o: '=' });
        } else if (filterState.selectedStatusFilter !== 'ALL') {
            filterQueryHelper.addFilter({ k: 'status', v: filterState.selectedStatusFilter, o: '=' });
        }
        if (filterState.selectedUrgencyFilter !== 'ALL') {
            filterQueryHelper.addFilter({ k: 'urgency', v: filterState.selectedUrgencyFilter, o: '=' });
        }
        if (filterState.selectedServiceId) {
            filterQueryHelper.addFilter({ k: 'service_id', v: filterState.selectedServiceId, o: '=' });
        }

        alertListApiQueryHelper.setFilters([
            ...queryTagHelper.filters.value,
            ...filterQueryHelper.filters,
        ]);

        const params = {
            query: alertListApiQueryHelper.data,
        };
        await alertPageStore.setAlertListParams(params);
        await alertPageStore.fetchAlertsList(params);
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};

watch(() => route.query, async (query) => {
    const { serviceId, status, urgency } = query;
    if (serviceId) {
        filterState.selectedServiceId = serviceId as string;
    }
    if (status) {
        filterState.selectedStatusFilter = status as string;
    }
    if (urgency) {
        filterState.selectedUrgencyFilter = urgency as string;
    }

    try {
        state.loading = true;
        await fetchAlertsList();
    } finally {
        state.loading = false;
    }
}, { immediate: true });
</script>

<template>
    <div class="alert-data-table">
        <p-toolbox-table searchable
                         sortable
                         exportable
                         search-type="query"
                         sort-by="created_at"
                         :sort-desc="true"
                         :query-tags="queryTags"
                         :loading="state.loading"
                         :total-count="storeState.totalCount"
                         :fields="state.fields"
                         :items="state.refinedAlertList"
                         :key-item-sets="ALERT_MANAGEMENT_TABLE_HANDLER.keyItemSets"
                         :value-handler-map="ALERT_MANAGEMENT_TABLE_HANDLER.valueHandlerMap"
                         settings-visible
                         @change="handleChange"
                         @click-settings="handleClickSettings"
                         @refresh="fetchAlertsList"
                         @export="handleExportToExcel"
        >
            <template #toolbox-top>
                <p-select-dropdown :menu="storeState.serviceDropdownList"
                                   :selection-label="$t('ALERT_MANAGER.ALERTS.SERVICE')"
                                   style-type="rounded"
                                   show-delete-all-button
                                   selection-highlight
                                   use-fixed-menu-style
                                   :selected="filterState.selectedServiceId"
                                   class="service-dropdown mt-6 pl-4"
                                   @update:selected="handleSelectServiceDropdownItem"
                />
            </template>
            <template #toolbox-bottom>
                <div class="quick-filter-wrapper flex justify-between mr-4 mb-4 ml-4">
                    <div class="status-filter-wrapper">
                        <span>{{ $t('ALERT_MANAGER.STATUS') }}</span>
                        <p-divider class="divider"
                                   vertical
                        />
                        <p-select-status v-for="(item, idx) in filterState.statusFields"
                                         :key="idx"
                                         :selected="filterState.selectedStatusFilter"
                                         :value="item.name"
                                         @change="handleSelectFilter('status', item.name)"
                        >
                            {{ item.label }}
                        </p-select-status>
                    </div>
                    <div class="status-filter-wrapper">
                        <span>{{ $t('ALERT_MANAGER.ALERTS.LABEL_URGENCY') }}</span>
                        <p-divider class="divider"
                                   vertical
                        />
                        <p-select-status v-for="(item, idx) in filterState.urgencyFields"
                                         :key="idx"
                                         :selected="filterState.selectedUrgencyFilter"
                                         :value="item.name"
                                         @change="handleSelectFilter('urgency', item.name)"
                        >
                            {{ item.label }}
                        </p-select-status>
                    </div>
                </div>
            </template>
            <template #col-title-format="{ value, item }">
                <template v-if="value">
                    <p-link highlight
                            :to="{
                                name: ALERT_MANAGER_ROUTE.ALERTS.DETAIL._NAME,
                                params: { alertId: item.alert_id }
                            }"
                    >
                        <span class="title-link">{{ value }}</span>
                    </p-link>
                </template>
            </template>
            <template #col-status-format="{ value }">
                <p-badge :style-type="alertStatusBadgeStyleTypeFormatter(value)"
                         :badge-type="value === ALERT_STATUS.TRIGGERED ? 'solid' : 'subtle'"
                >
                    {{ state.alertStateLabels[value] }}
                </p-badge>
            </template>
            <template #col-urgency-format="{ value }">
                <p-i :name="value === ALERT_URGENCY.HIGH ? 'ic_error-filled' : 'ic_warning-filled'"
                     width="1em"
                     height="1em"
                     class="mr-1"
                     :color="value === ALERT_URGENCY.HIGH ? red[400] : red[200]"
                />
                <span>{{ state.urgencyLabels[value] }}</span>
            </template>
            <template #col-service_id-format="{ value }">
                <template v-if="value">
                    <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                            new-tab
                            highlight
                            :to="getProperRouteLocation({
                                name: ALERT_MANAGER_ROUTE.SERVICE.DETAIL._NAME,
                                params: {
                                    serviceId: value,
                                },
                            })"
                    >
                        {{ getServiceName(value) }}
                    </p-link>
                </template>
            </template>
            <template #col-resources-format="{ value }">
                <span v-if="(value ?? []).length === 0">
                    --
                </span>
                <template v-else>
                    <div v-for="(item, idx) in value.slice(0, 3)"
                         :key="`resource-item-${idx}`"
                         class="flex items-center gap-2"
                    >
                        <p class="resource-item truncate">
                            {{ item?.name }}
                        </p>
                        <p-link :text="i18n.t('ALERT_MANAGER.ALERTS.VIEW')"
                                :to="{
                                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                                    params: getAssetInfo(item.asset_id)
                                }"
                                size="sm"
                                highlight
                                action-icon="internal-link"
                                new-tab
                        />
                    </div>
                </template>
            </template>
        </p-toolbox-table>
        <custom-field-modal :visible="state.visibleCustomFieldModal"
                            resource-type="alertManager.alert"
                            :default-field="ALERT_MANAGEMENT_TABLE_FIELDS"
                            @update:visible="handleVisibleCustomFieldModal"
                            @complete="fetchAlertsList"
                            @custom-field-loaded="handleCustomFieldUpdate"
        />
    </div>
</template>

<style scoped lang="postcss">
.alert-data-table {
    .service-dropdown {
        margin-bottom: -0.5rem;
        width: max-content;
    }
    .quick-filter-wrapper {
        .status-filter-wrapper {
            @apply flex items-center flex-wrap text-label-md text-gray-600;
            gap: 0.75rem;
            margin-top: -0.5rem;
            .divider {
                height: 1rem;
                padding-top: 0.25rem;
                padding-bottom: 0.25rem;
            }
        }

        @screen mobile {
            flex-direction: column;
            gap: 1rem;
            .status-filter-wrapper {
                margin-top: 0;
                .divider {
                    padding-top: 0;
                    padding-bottom: 0;
                }
            }
        }
    }
    .resource-item {
        max-width: 14.75rem;
    }
}
</style>
