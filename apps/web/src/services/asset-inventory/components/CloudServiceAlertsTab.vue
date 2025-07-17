<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import { makeDistinctValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeading, PToolboxTable, PSelectStatus, PBadge, PDivider, PLink, PI,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { useAlertApi } from '@/api-clients/alert-manager/alert/composables/use-alert-api';
import { ALERT_STATUS, ALERT_URGENCY } from '@/api-clients/alert-manager/alert/schema/constants';
import type { AlertModel } from '@/api-clients/alert-manager/alert/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import { useQueryTags } from '@/common/composables/query-tags';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';

import { gray, red } from '@/styles/colors';

import {
    alertStatusBadgeStyleTypeFormatter,
    calculateTime, getAlertStateI18n, getAlertUrgencyI18n,
} from '@/services/alert-manager/v2/composables/alert-table-data';
import {
    ALERT_EXCEL_FIELDS,
    ALERT_MANAGEMENT_TABLE_FIELDS, ALERT_MANAGEMENT_TABLE_HANDLER,
    ALERT_STATUS_FILTERS,
} from '@/services/alert-manager/v2/constants/alert-table-constant';
import { ALERT_MANAGER_ROUTE } from '@/services/alert-manager/v2/routes/route-constant';
import type { AlertFilterType } from '@/services/alert-manager/v2/types/alert-manager-type';

interface Props {
    cloudServiceId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    cloudServiceId: '',
});

const userStore = useUserStore();
const userState = userStore.state;

const referenceMap = useAllReferenceDataModel();

const storeState = reactive({
    timezone: computed<string>(() => userState.timezone || ''),
});
const state = reactive({
    fields: ALERT_MANAGEMENT_TABLE_FIELDS,
    alertStateLabels: getAlertStateI18n(),
    urgencyLabels: getAlertUrgencyI18n(),
    totalCount: 0,
    searchText: '',
    pageLimit: 15,
    pageStart: 1,
    listTotalCount: 0,
    visibleCustomFieldModal: false,
});

const filterState = reactive({
    pageStart: 1,
    pageLimit: 15,
    sortKey: 'created_at',
    sortDesc: true,
    selectedServiceId: '',
    statusFields: computed<AlertFilterType[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.OPEN'), name: ALERT_STATUS_FILTERS.OPEN },
        { label: i18n.t('ALERT_MANAGER.ALERTS.TRIGGERED'), name: ALERT_STATUS_FILTERS.TRIGGERED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ACKNOWLEDGED'), name: ALERT_STATUS_FILTERS.ACKNOWLEDGED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.RESOLVED'), name: ALERT_STATUS_FILTERS.RESOLVED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.IGNORED'), name: ALERT_STATUS_FILTERS.IGNORED },
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
    ])),
    selectedStatusFilter: 'OPEN',
    urgencyFields: computed<SelectDropdownMenuItem[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.ALL'), name: 'ALL' },
        { label: i18n.t('ALERT_MANAGER.ALERTS.HIGH'), name: ALERT_URGENCY.HIGH },
        { label: i18n.t('ALERT_MANAGER.ALERTS.LOW'), name: ALERT_URGENCY.LOW },
    ])),
    selectedUrgencyFilter: 'ALL',
    labelHandler: computed(() => makeDistinctValueHandler('alert_manager.Alert', 'labels')),
    selectedLabels: [] as SelectDropdownMenuItem[],
});

const queryTagHelper = useQueryTags({ keyItemSets: ALERT_MANAGEMENT_TABLE_HANDLER.keyItemSets });
const { queryTags } = queryTagHelper;

const queryClient = useQueryClient();
const { alertAPI } = useAlertApi();
const alertListApiQueryHelper = new ApiQueryHelper();
const { key: alertListBaseQueryKey } = useServiceQueryKey('alert-manager', 'alert', 'list');
const { key: alertListQueryKey, params: alertListQueryParams } = useServiceQueryKey('alert-manager', 'alert', 'list', {
    params: computed(() => {
        alertListApiQueryHelper
            .setPage(filterState.pageStart, filterState.pageLimit)
            .setSort(filterState.sortKey, filterState.sortDesc)
            .setFilters(queryTagHelper.filters.value);
        if (filterState.selectedStatusFilter === ALERT_STATUS_FILTERS.OPEN) {
            alertListApiQueryHelper.addFilter({ k: 'status', v: [ALERT_STATUS_FILTERS.TRIGGERED, ALERT_STATUS_FILTERS.ACKNOWLEDGED], o: '=' });
        } else if (filterState.selectedStatusFilter !== 'ALL') {
            alertListApiQueryHelper.addFilter({ k: 'status', v: filterState.selectedStatusFilter, o: '=' });
        }
        if (filterState.selectedUrgencyFilter !== 'ALL') {
            alertListApiQueryHelper.addFilter({ k: 'urgency', v: filterState.selectedUrgencyFilter, o: '=' });
        }
        if (filterState.selectedLabels.length > 0) {
            alertListApiQueryHelper.addFilter({ k: 'labels', v: filterState.selectedLabels.map((i) => i.name), o: '=' });
        }

        return ({
            query: alertListApiQueryHelper.data,
            asset_id: props.cloudServiceId,
        });
    }),
});
const { data: alertListData, isFetching: alertListLoading } = useScopedQuery({
    queryKey: alertListQueryKey,
    queryFn: async () => alertAPI.list(alertListQueryParams.value),
    select: (data) => ({
        results: (data.results ?? []).map((alert:AlertModel) => ({
            ...alert,
            created_at: iso8601Formatter(alert.created_at, storeState.timezone),
        })),
        totalCount: data.total_count ?? 0,
    }),
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 30,
}, ['DOMAIN', 'WORKSPACE']);
const refreshhAlertData = () => {
    queryClient.invalidateQueries({ queryKey: alertListBaseQueryKey.value });
};
const getCreatedByNames = (id: string): string => {
    if (id.includes('webhook')) {
        return referenceMap.alertManagerWebhook[id]?.label || id;
    }
    return id;
};
const handleClickSettings = () => {
    state.visibleCustomFieldModal = true;
};
const handleVisibleCustomFieldModal = (visible:boolean) => {
    state.visibleCustomFieldModal = visible;
};
const handleCustomFieldUpdate = (fields: DataTableFieldType[]) => {
    state.fields = fields;
};

const handleChange = async (options: any = {}) => {
    if (options.sortBy !== undefined) filterState.sortKey = options.sortBy;
    if (options.sortDesc !== undefined) filterState.sortDesc = options.sortDesc;
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);
    if (options.pageStart !== undefined) filterState.pageStart = options.pageStart;
    if (options.pageLimit !== undefined) filterState.pageLimit = options.pageLimit;
};

const handleSelectFilter = (type: 'status' | 'urgency', value: string) => {
    if (type === 'status') {
        filterState.selectedStatusFilter = value;
    } else {
        filterState.selectedUrgencyFilter = value;
    }
};

const handleExport = async () => {
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

watch(() => props.cloudServiceId, (after, before) => {
    if (after !== before) refreshhAlertData();
}, { immediate: true });
watch(alertListData, (d) => {
    if (!d || !d.totalCount || state.listTotalCount === d.totalCount) return;
    state.listTotalCount = d.totalCount || 0;
});
</script>

<template>
    <div class="alert-data-table">
        <p-heading class="pt-6 px-4"
                   heading-type="sub"
                   use-total-count
                   :title="$t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_ALERTS')"
                   :total-count="state.listTotalCount"
        />
        <p-toolbox-table class="toolbox"
                         searchable
                         sortable
                         exportable
                         search-type="query"
                         sort-by="created_at"
                         :sort-desc="true"
                         :query-tags="queryTags"
                         :loading="alertListLoading"
                         :total-count="state.listTotalCount"
                         :fields="state.fields"
                         :items="alertListData?.results"
                         :key-item-sets="ALERT_MANAGEMENT_TABLE_HANDLER.keyItemSets"
                         :value-handler-map="ALERT_MANAGEMENT_TABLE_HANDLER.valueHandlerMap"
                         settings-visible
                         @change="handleChange"
                         @click-settings="handleClickSettings"
                         @refresh="refreshhAlertData"
                         @export="handleExport"
        >
            <template #toolbox-bottom>
                <div class="quick-filter-wrapper flex flex-col mr-4 mb-4 ml-4 gap-2">
                    <div class="status-filter-wrapper">
                        <span class="label">{{ $t('ALERT_MANAGER.STATUS') }}</span>
                        <p-divider class="divider"
                                   vertical
                        />
                        <p-select-status v-for="(item, idx) in filterState.statusFields"
                                         :key="idx"
                                         :selected="filterState.selectedStatusFilter"
                                         :value="item.name"
                                         class="status"
                                         @change="handleSelectFilter('status', item.name)"
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
                                params: {
                                    alertId: item.alert_id,
                                }
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
                     :color="value === ALERT_URGENCY.HIGH ? red[400] : gray[200]"
                />
                <span>{{ state.urgencyLabels[value] }}</span>
            </template>
            <template #col-labels-format="{ value }">
                <div class="flex gap-2">
                    <p-badge v-for="(item, idx) in value?.slice(0, 3)"
                             :key="`labels-${idx}`"
                             badge-type="subtle"
                             style-type="gray200"
                             shape="square"
                             class="label-item"
                    >
                        <span>{{ item }}</span>
                    </p-badge>
                    <p-badge v-if="value?.length > 3"
                             badge-type="subtle"
                             style-type="blue200"
                    >
                        <span>+ {{ value?.length - 3 }}</span>
                    </p-badge>
                </div>
            </template>
            <template #col-triggered_by-format="{ value }">
                <span>{{ getCreatedByNames(value) }}</span>
            </template>
            <template #col-duration-format="{ item }">
                <span>{{ calculateTime(item?.created_at, storeState.timezone) }}</span>
            </template>
        </p-toolbox-table>
        <custom-field-modal :visible="state.visibleCustomFieldModal"
                            resource-type="cloudService.alert"
                            :default-field="ALERT_MANAGEMENT_TABLE_FIELDS"
                            @update:visible="handleVisibleCustomFieldModal"
                            @complete="refreshhAlertData"
                            @custom-field-loaded="handleCustomFieldUpdate"
        />
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-search-table */
:deep(.p-toolbox-table) {
    border-width: 0;
}

.alert-data-table {
    .toolbox {
        border-radius: 0.375rem;
    }
    .label-item {
        @apply truncate;
        max-width: 9.875rem;
    }
    .quick-filter-wrapper {
        .status-filter-wrapper {
            @apply flex items-center flex-wrap text-label-sm;
            gap: 0.75rem;
            padding-top: 0.125rem;
            padding-bottom: 0.125rem;
            .label {
                @apply font-bold;
            }
            .divider {
                height: 1rem;
                padding-top: 0.25rem;
                padding-bottom: 0.25rem;
            }
            .status {
                @apply text-label-md;
            }
        }

        @screen mobile {
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
}
</style>
