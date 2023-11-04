<script setup lang="ts">
import { debouncedWatch } from '@vueuse/core';
import { reactive, computed, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PHorizontalLayout, PDynamicLayout, PHeading, PButton,
} from '@spaceone/design-system';
import type {
    DynamicLayoutEventListener, DynamicLayoutFetchOptions,
    DynamicLayoutFieldHandler,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type';
import type {
    DynamicLayout,
    DynamicLayoutOptions,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import dayjs from 'dayjs';
import { isEmpty, get } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import type { Reference } from '@/lib/reference/type';
import { objectToQueryString, queryStringToObject, replaceUrlQuery } from '@/lib/router-query-string';

import { useQuerySearchPropsWithSearchSchema } from '@/common/composables/dynamic-layout';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import { useQueryTags } from '@/common/composables/query-tags';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';

import CloudServiceUsageOverview
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-usage-overview/CloudServiceUsageOverview.vue';
import CloudServiceDetailTabs
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceDetailTabs.vue';
import ExcelExportOptionModal
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/ExcelExportOptionModal.vue';
import CloudServicePeriodFilter from '@/services/asset-inventory/cloud-service/modules/CloudServicePeriodFilter.vue';
import {
    TABLE_MIN_HEIGHT, useAssetInventorySettingsStore,
} from '@/services/asset-inventory/store/asset-inventory-settings-store';
import { useCloudServiceDetailPageStore } from '@/services/asset-inventory/store/cloud-service-detail-page-store';
import type { Period } from '@/services/cost-explorer/type';

interface Props {
    provider?: string;
    group?: string;
    name?: string;
    isServerPage?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    provider: '',
    group: '',
    name: '',
    isServerPage: false,
});


const cloudServiceDetailPageStore = useCloudServiceDetailPageStore();
const cloudServiceDetailPageState = cloudServiceDetailPageStore.$state;
const assetInventorySettingsStore = useAssetInventorySettingsStore();
assetInventorySettingsStore.initState();

const route = useRoute();

/* Main Table */
const queryTagsHelper = useQueryTags({});
queryTagsHelper.setURLQueryStringFilters(route.query.filters);
const { filters: searchFilters, urlQueryStringFilters } = queryTagsHelper;
const fetchOptionState = reactive({
    pageStart: 1,
    pageLimit: assetInventorySettingsStore.getCloudServiceTablePageLimit,
    sortDesc: true,
    sortBy: 'created_at',
    queryTags: computed(() => queryTagsHelper.queryTags.value),
});

const typeOptionState = reactive({
    loading: true,
    totalCount: 0,
    timezone: computed(() => store.state.user.timezone || 'UTC'),
    selectIndex: [] as number[],
});

const tableHeight = assetInventorySettingsStore.getCloudServiceTableHeight;
const tableState = reactive({
    hasManagePermission: useManagePermissionState(),
    schema: null as null|DynamicLayout,
    items: [],
    selectedItems: computed(() => typeOptionState.selectIndex.map((d) => tableState.items[d])),
    consoleLink: computed(() => get(tableState.selectedItems[0], 'reference.external_link')),
    multiSchema: computed<null|DynamicLayout>(() => {
        if (!tableState.schema) return null;

        const res: DynamicLayout = { ...tableState.schema };
        if (tableState.schema.options.fields) {
            res.options = {
                ...tableState.schema.options,
                fields: [{ name: 'ID', key: 'cloud_service_id' }, ...tableState.schema.options.fields],
            };
        }

        return res;
    }),
    selectedCloudServiceIds: computed(() => tableState.selectedItems.map((d) => d.cloud_service_id)),
    tableHeight: tableHeight > TABLE_MIN_HEIGHT ? tableHeight : TABLE_MIN_HEIGHT,
    visibleCustomFieldModal: false,
});

const schemaQueryHelper = new QueryHelper();
const { keyItemSets, valueHandlerMap, isAllLoaded } = useQuerySearchPropsWithSearchSchema(
    computed(() => tableState.schema?.options?.search ?? []),
    'inventory.CloudService',
    computed(() => (props.isServerPage
        ? schemaQueryHelper.setFilters([
            { k: 'ref_cloud_service_type.labels', v: 'Server', o: '=' },
        ]).apiQuery.filter
        : schemaQueryHelper.setFilters([
            { k: 'provider', o: '=', v: props.provider },
            { k: 'cloud_service_group', o: '=', v: props.group },
            { k: 'cloud_service_type', o: '=', v: props.name },
        ]).apiQuery.filter)),
);

const hiddenFilterHelper = new QueryHelper();
const hiddenFilters = computed<ConsoleFilter[]>(() => {
    hiddenFilterHelper.setFilters([]);
    if (props.isServerPage) {
        hiddenFilterHelper.addFilter({ k: 'ref_cloud_service_type.labels', v: 'Server', o: '=' });
    } else {
        hiddenFilterHelper.addFilter(
            { k: 'provider', o: '=', v: props.provider },
            { k: 'cloud_service_group', o: '=', v: props.group },
            { k: 'cloud_service_type', o: '=', v: props.name },
        );
    }
    return hiddenFilterHelper.filters;
});

const overviewState = reactive({
    period: queryStringToObject(route.query.period) as Period|undefined,
});

const handleTableHeightChange = (height) => {
    tableState.tableHeight = height;
    assetInventorySettingsStore.setCloudServiceTableHeight(height);
};

const handleSelect: DynamicLayoutEventListener['select'] = (selectIndex) => {
    typeOptionState.selectIndex = selectIndex;
};

const getTableSchema = async (): Promise<null|DynamicLayout> => {
    try {
        const params: Record<string, any> = {
            schema: 'table',
        };
        if (props.isServerPage) {
            params.resource_type = 'inventory.Server';
            // params.options = { is_default: false };
        } else {
            params.resource_type = 'inventory.CloudService';
            params.options = {
                provider: props.provider,
                cloud_service_group: props.group,
                cloud_service_type: props.name,
                // is_default: false,
            };
        }
        return await SpaceConnector.client.addOns.pageSchema.get(params);
    } catch (e) {
        ErrorHandler.handleError(e);
        return null;
    }
};

const resetSort = (schemaOptions: DynamicLayoutOptions) => {
    const defaultSort = schemaOptions.default_sort;
    if (defaultSort) {
        fetchOptionState.sortBy = defaultSort.key;
        fetchOptionState.sortDesc = defaultSort.desc ?? false;
    } else {
        fetchOptionState.sortBy = 'created_at';
        fetchOptionState.sortDesc = true;
    }
};

const apiQuery = new ApiQueryHelper();
const getQuery = (schema?) => {
    apiQuery.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
        .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
        .setFilters(hiddenFilters.value)
        .addFilter(...searchFilters.value);

    const fields = schema?.options?.fields || tableState.schema?.options?.fields;
    if (fields) {
        apiQuery.setOnly(...fields.map((d) => d.key).filter((d) => !d.startsWith('tags.')), 'reference.resource_id', 'reference.external_link', 'cloud_service_id', 'tags', 'provider');
    }

    return apiQuery.data;
};

const listCloudServiceTableData = async (schema?): Promise<{items: any[]; totalCount: number}> => {
    typeOptionState.loading = true;
    try {
        const res = await SpaceConnector.client.inventory.cloudService.list({
            query: getQuery(schema),
            ...(overviewState.period && {
                date_range: {
                    start: dayjs.utc(overviewState.period.start).format('YYYY-MM-DD'),
                    end: dayjs.utc(overviewState.period.end).add(1, 'day').format('YYYY-MM-DD'),
                },
            }),
        });

        // filtering select index
        typeOptionState.selectIndex = typeOptionState.selectIndex.filter((d) => !!res.results[d]);

        return { items: res.results, totalCount: res.total_count };
    } catch (e) {
        ErrorHandler.handleError(e);
        return { items: [], totalCount: 0 };
    } finally {
        typeOptionState.loading = false;
    }
};

const fetchTableData = async (changed: DynamicLayoutFetchOptions = {}) => {
    if (changed.sortBy !== undefined) {
        fetchOptionState.sortBy = changed.sortBy;
        fetchOptionState.sortDesc = !!changed.sortDesc;
    }
    if (changed.pageLimit !== undefined) {
        fetchOptionState.pageLimit = changed.pageLimit;
        assetInventorySettingsStore.setCloudServiceTablePageLimit(changed.pageLimit);
    }
    if (changed.pageStart !== undefined) {
        fetchOptionState.pageStart = changed.pageStart;
    }
    if (changed.queryTags !== undefined) {
        queryTagsHelper.setQueryTags(changed.queryTags);
    }

    const { items, totalCount } = await listCloudServiceTableData();
    tableState.items = items;
    typeOptionState.totalCount = totalCount;
    typeOptionState.selectIndex = [];
};

const handleDynamicLayoutFetch = (changed) => {
    if (tableState.schema === null || !isAllLoaded.value) return;
    fetchTableData(changed);
};

watch(urlQueryStringFilters, (queryStringFilters) => {
    const filterQueryString = route.query.filters ?? '';
    if (queryStringFilters !== JSON.stringify(filterQueryString)) {
        replaceUrlQuery('filters', queryStringFilters);
    }
});

// excel
const excelState = reactive({
    visible: false,
});
const exportCloudServiceData = () => {
    excelState.visible = true;
};

const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
    if (field.extraData?.reference) {
        return referenceFieldFormatter(field.extraData.reference, field.data);
    }
    return {};
};

const reloadTable = async () => {
    tableState.schema = await getTableSchema();
    resetSort(tableState.schema.options);
    await fetchTableData();
};

const handleClickSettings = () => {
    tableState.visibleCustomFieldModal = true;
};


/* Actions */
const handleClickConnectToConsole = () => { window.open(tableState.consoleLink, '_blank'); };


/* Usage Overview */
const handlePeriodUpdate = (period?: Period) => {
    overviewState.period = period;
    replaceUrlQuery('period', objectToQueryString(period));
};

const checkIsEmpty = (data) => isEmpty(data);

const handleUpdateVisible = (visible) => {
    excelState.visible = visible;
};

/* Watchers */
watch(() => keyItemSets.value, (after) => {
    // initiate queryTags with keyItemSets
    queryTagsHelper.setKeyItemSets(after);
}, { immediate: true });
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
debouncedWatch([() => props.group, () => props.name], async () => {
    if (!props.isServerPage && !props.name) return;
    tableState.schema = await getTableSchema();
    resetSort(tableState.schema.options);
    await fetchTableData();
}, { immediate: true, debounce: 200 });


</script>

<template>
    <div>
        <p-heading v-if="!props.isServerPage"
                   :title="props.name"
                   show-back-button
                   use-total-count
                   use-selected-count
                   :total-count="typeOptionState.totalCount"
                   :selected-count="tableState.selectedItems.length"
                   @click-back-button="$router.go(-1)"
        />
        <p-heading v-else
                   :title="$t('INVENTORY.SERVER.MAIN.TITLE')"
                   use-total-count
                   use-selected-count
                   :total-count="typeOptionState.totalCount"
                   :selected-count="tableState.selectedItems.length"
                   @click-back-button="$router.go(-1)"
        />
        <div v-if="!checkIsEmpty(overviewState.period)"
             class="filter-wrapper"
        >
            <span class="filter-title">{{ $t('INVENTORY.CLOUD_SERVICE.MAIN.FILTER') }}</span>
            <cloud-service-period-filter :period="overviewState.period"
                                         @update:period="handlePeriodUpdate"
            />
        </div>
        <p-horizontal-layout :min-height="TABLE_MIN_HEIGHT"
                             :height="tableState.tableHeight"
                             @resize-end="handleTableHeightChange"
        >
            <template #container="{ height }">
                <template v-if="tableState.schema">
                    <p-dynamic-layout type="query-search-table"
                                      :options="tableState.schema.options"
                                      :data="tableState.items"
                                      :fetch-options="fetchOptionState"
                                      :type-options="{
                                          loading: typeOptionState.loading,
                                          totalCount: typeOptionState.totalCount,
                                          timezone: typeOptionState.timezone,
                                          selectIndex: typeOptionState.selectIndex,
                                          selectable: true,
                                          colCopy: false,
                                          settingsVisible: true,
                                          keyItemSets: keyItemSets,
                                          valueHandlerMap: valueHandlerMap
                                      }"
                                      :style="{height: `${height}px`}"
                                      :field-handler="fieldHandler"
                                      @fetch="handleDynamicLayoutFetch"
                                      @select="handleSelect"
                                      @export="exportCloudServiceData"
                                      @click-settings="handleClickSettings"
                    >
                        <template #toolbox-left>
                            <p-button style-type="primary"
                                      :disabled="!tableState.consoleLink || tableState.selectedItems.length > 1"
                                      @click="handleClickConnectToConsole"
                            >
                                {{ $t('INVENTORY.SERVER.MAIN.CONSOLE') }}
                            </p-button>
                        </template>
                        <template v-if="!props.isServerPage"
                                  #toolbox-bottom
                        >
                            <cloud-service-usage-overview :cloud-service-type-info="cloudServiceDetailPageState.selectedCloudServiceType"
                                                          :filters="searchFilters"
                                                          :hidden-filters="hiddenFilters"
                                                          :period="overviewState.period"
                                                          :key-item-sets="keyItemSets"
                            />
                        </template>
                    </p-dynamic-layout>
                </template>
            </template>
        </p-horizontal-layout>
        <cloud-service-detail-tabs :table-state="tableState"
                                   :field-handler="fieldHandler"
                                   :group="props.group"
                                   :name="props.name"
                                   :is-server-page="props.isServerPage"
                                   :selected-index="typeOptionState.selectIndex.length ?? 0"
                                   :timezone="typeOptionState.timezone ?? 'UTC'"
        />
        <custom-field-modal v-model="tableState.visibleCustomFieldModal"
                            resource-type="inventory.CloudService"
                            :options="{provider: props.provider, cloudServiceGroup: props.group, cloudServiceType: props.name}"
                            :is-server-page="props.isServerPage"
                            @complete="reloadTable"
        />
        <excel-export-option-modal :visible="excelState.visible"
                                   :cloud-service-id="tableState.items[0]?.cloud_service_id"
                                   :is-server-page="props.isServerPage"
                                   @update:visible="handleUpdateVisible"
        />
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-horizontal-layout */
:deep(.p-horizontal-layout) .horizontal-contents {
    overflow: unset;
}

.filter-wrapper {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.filter-title {
    @apply text-gray-600;
    font-size: 0.875rem;
    margin-right: 0.5rem;
}

.left-toolbox-item {
    margin-left: 1rem;
    &:last-child {
        flex-grow: 1;
    }
}

.selected-data-tab {
    @apply mt-8;
}

/* custom design-system component - p-dynamic-layout */

/* custom design-system component - p-dynamic-layout-query-search-table */
:deep(.p-dynamic-layout-query-search-table) .p-toolbox-table {
    @apply border border-gray-200 rounded-lg;
    .p-data-table {
        min-height: unset;
    }
}

/* custom design-system component - p-tab */
:deep(.p-tab) {
    @apply rounded-lg;
    &.monitoring {
        .tab-pane {
            @apply bg-secondary2;
        }
    }
}

@screen mobile {
    /* custom design-system component - p-horizontal-layout */
    :deep(.p-horizontal-layout) {
        .horizontal-contents {
            height: 50rem !important;
        }
    }

    /* custom design-system component - p-dynamic-layout */

    /* custom design-system component - p-dynamic-layout-query-search-table */
    :deep(.p-dynamic-layout-query-search-table) {
        height: 50rem !important;
    }
}
</style>
