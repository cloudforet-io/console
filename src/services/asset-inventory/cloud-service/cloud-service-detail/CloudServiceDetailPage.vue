<template>
    <div>
        <p-page-title v-if="!isServerPage"
                      :title="name"
                      child
                      use-total-count
                      use-selected-count
                      :total-count="typeOptionState.totalCount"
                      :selected-count="tableState.selectedItems.length"
                      @goBack="$router.go(-1)"
        />
        <p-page-title v-else
                      :title="$t('INVENTORY.SERVER.MAIN.TITLE')"
                      use-total-count
                      use-selected-count
                      :total-count="typeOptionState.totalCount"
                      :selected-count="tableState.selectedItems.length"
                      @goBack="$router.go(-1)"
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
                        <template v-if="!isServerPage"
                                  #toolbox-bottom
                        >
                            <cloud-service-usage-overview :cloud-service-type-info="sidebarState.selectedItem"
                                                          :filters="tableState.searchFilters"
                                                          :period="overviewState.period"
                            />
                        </template>
                    </p-dynamic-layout>
                </template>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="tableState.selectedItems.length === 1"
               :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
               :class="singleItemTabState.activeTab"
        >
            <template #detail>
                <cloud-service-detail
                    :cloud-service-id="tableState.selectedCloudServiceIds[0]"
                    :cloud-service-group="group"
                    :cloud-service-type="name"
                    :is-server-page="isServerPage"
                />
            </template>

            <template #tag>
                <cloud-service-tags-panel :resource-id="tableState.selectedCloudServiceIds[0]"
                                          :disabled="!tableState.hasManagePermission"
                                          :provider="tableState.selectedItems[0].provider"
                />
            </template>
            <template #member>
                <cloud-service-admin :cloud-service-project-id="tableState.selectedItems[0].project_id" />
            </template>
            <template #history>
                <cloud-service-history :cloud-service-item="tableState.selectedItems[0]"
                                       :provider="tableState.selectedItems[0].provider"
                />
            </template>
            <template #monitoring>
                <monitoring :resources="monitoringState.resources" />
            </template>
        </p-tab>
        <p-tab v-else-if="typeOptionState.selectIndex.length > 1"
               :tabs="multiItemTabState.tabs"
               :active-tab.sync="multiItemTabState.activeTab"
               :class="multiItemTabState.activeTab"
        >
            <template #data>
                <p-dynamic-layout v-if="tableState.multiSchema"
                                  type="simple-table"
                                  :options="tableState.multiSchema.options"
                                  :type-options="{ colCopy: true, timezone: typeOptionState.timezone }"
                                  :data="tableState.selectedItems"
                                  :field-handler="fieldHandler"
                                  class="selected-data-tab"
                />
            </template>
            <template #monitoring>
                <monitoring :resources="monitoringState.resources" />
            </template>
        </p-tab>
        <p-empty v-else
                 style="height: auto; margin-top: 4rem;"
        >
            {{ $t('INVENTORY.CLOUD_SERVICE.PAGE.NO_SELECTED') }}
        </p-empty>
        <p-table-check-modal v-if="checkTableModalState.visible"
                             :visible.sync="checkTableModalState.visible"
                             :header-title="checkTableModalState.title"
                             :sub-title="checkTableModalState.subTitle"
                             :theme-color="checkTableModalState.themeColor"
                             size="lg"
                             :selectable="false"
                             @confirm="checkModalConfirm"
        >
            <p-dynamic-layout v-if="tableState.multiSchema"
                              type="simple-table"
                              :options="tableState.multiSchema.options"
                              :data="tableState.selectedItems"
                              :field-handler="fieldHandler"
            />
        </p-table-check-modal>
        <custom-field-modal v-model="tableState.visibleCustomFieldModal"
                            resource-type="inventory.CloudService"
                            :options="{provider, cloudServiceGroup: group, cloudServiceType: name}"
                            :is-server-page="isServerPage"
                            @complete="reloadTable"
        />
    </div>
</template>

<script lang="ts">

import { debouncedWatch } from '@vueuse/core';
import {
    reactive, computed, getCurrentInstance, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Vue } from 'vue/types/vue';

import {
    PHorizontalLayout, PTab, PDynamicLayout,
    PPageTitle, PEmpty, PTableCheckModal, PButton,
} from '@spaceone/design-system';
import type {
    DynamicLayoutEventListener,
    DynamicLayoutFieldHandler,
} from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type';
import type { DynamicLayout } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';
import dayjs from 'dayjs';
import { isEmpty, get } from 'lodash';

import { QueryHelper } from '@cloudforet/core-lib/query';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import { dynamicFieldsToExcelDataFields } from '@/lib/component-util/dynamic-layout';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import type { Reference } from '@/lib/reference/type';
import { objectToQueryString, queryStringToObject, replaceUrlQuery } from '@/lib/router-query-string';

import { useQuerySearchPropsWithSearchSchema } from '@/common/composables/dynamic-layout';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';
import Monitoring from '@/common/modules/monitoring/Monitoring.vue';
import type { MonitoringProps, MonitoringResourceType } from '@/common/modules/monitoring/type';

import CloudServiceUsageOverview
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-usage-overview/CloudServiceUsageOverview.vue';
import CloudServiceAdmin from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceAdmin.vue';
import CloudServiceDetail from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceDetail.vue';
import CloudServiceHistory from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceHistory.vue';
import CloudServiceTagsPanel
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceTagsPanel.vue';
import CloudServicePeriodFilter from '@/services/asset-inventory/cloud-service/modules/CloudServicePeriodFilter.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { assetInventoryStore } from '@/services/asset-inventory/store';
import type { Period } from '@/services/cost-explorer/type';

const DEFAULT_PAGE_SIZE = 15;

// TODO: move this code to store
const STORAGE_PREFIX = ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME;
const TABLE_MIN_HEIGHT = 400;

export default {
    name: 'CloudServiceDetailPage',
    components: {
        CloudServiceTagsPanel,
        CloudServicePeriodFilter,
        CloudServiceUsageOverview,
        CustomFieldModal,
        CloudServiceDetail,
        CloudServiceHistory,
        CloudServiceAdmin,
        PDynamicLayout,
        PTableCheckModal,
        PHorizontalLayout,
        PPageTitle,
        PTab,
        PButton,
        PEmpty,
        Monitoring,
    },
    props: {
        provider: {
            type: String,
            default: '',
        },
        group: {
            type: String,
            default: '',
        },
        name: {
            type: String,
            default: '',
        },
        isServerPage: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const vm = getCurrentInstance()?.proxy as Vue;
        const queryHelper = new QueryHelper();
        /* Sidebar */
        const sidebarState = reactive({
            selectedItem: computed(() => assetInventoryStore.state.cloudServiceDetail.selectedItem),
        });

        /* Main Table */
        const fetchOptionState = reactive({
            pageStart: 1,
            pageLimit: store.getters['settings/getItem']('pageLimit', STORAGE_PREFIX) || DEFAULT_PAGE_SIZE,
            sortDesc: true,
            sortBy: 'created_at',
            queryTags: queryHelper.setFiltersAsRawQueryString(vm.$route.query.filters).queryTags,
        });

        const typeOptionState = reactive({
            loading: true,
            totalCount: 0,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            selectIndex: [] as number[],
        });

        const tableHeight = store.getters['settings/getItem']('tableHeight', STORAGE_PREFIX) ?? 0;
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
            searchFilters: computed<ConsoleFilter[]>(() => queryHelper.setFiltersAsQueryTag(fetchOptionState.queryTags).filters),
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

        const checkTableModalState = reactive({
            visible: false,
            item: null,
            title: '' as TranslateResult,
            subTitle: '' as TranslateResult,
            themeColor: undefined as string | undefined,
            api: null as any,
            params: null as any,
        });

        const overviewState = reactive({
            period: queryStringToObject(vm.$route.query.period) as Period|undefined,
        });

        const handleTableHeightChange = (height) => {
            tableState.tableHeight = height;
            store.dispatch('settings/setItem', {
                key: 'tableHeight',
                value: height,
                path: STORAGE_PREFIX,
            });
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

        const apiQuery = new ApiQueryHelper();
        const getQuery = (schema?) => {
            apiQuery.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
                .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
                .setFilters(tableState.searchFilters);

            if (props.isServerPage) {
                apiQuery.addFilter({ k: 'ref_cloud_service_type.labels', v: 'Server', o: '=' });
            } else {
                apiQuery.addFilter(
                    { k: 'provider', o: '=', v: props.provider },
                    { k: 'cloud_service_group', o: '=', v: props.group },
                    { k: 'cloud_service_type', o: '=', v: props.name },
                );
            }
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

        const fetchTableData = async (changed: any = {}) => {
            if (changed.sortBy !== undefined) {
                fetchOptionState.sortBy = changed.sortBy;
                fetchOptionState.sortDesc = !!changed.sortDesc;
            }
            if (changed.pageLimit !== undefined) {
                fetchOptionState.pageLimit = changed.pageLimit;
                await store.dispatch('settings/setItem', {
                    key: 'pageLimit',
                    value: changed.pageLimit,
                    path: STORAGE_PREFIX,
                });
            }
            if (changed.pageStart !== undefined) {
                fetchOptionState.pageStart = changed.pageStart;
            }
            if (changed.queryTags !== undefined) {
                fetchOptionState.queryTags = changed.queryTags;
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

        const replaceQueryHelper = new QueryHelper();
        watch(() => tableState.searchFilters, (searchFilters) => {
            replaceQueryHelper.setFilters(searchFilters);
            const filterQueryString = vm.$route.query.filters ?? '';
            if (replaceQueryHelper.rawQueryString !== JSON.stringify(filterQueryString)) {
                replaceUrlQuery('filters', replaceQueryHelper.rawQueryStrings);
            }
        });

        const exportCloudServiceData = async () => {
            await store.dispatch('file/downloadExcel', {
                url: '/inventory/cloud-service/list',
                param: {
                    query: getQuery(),
                    ...(overviewState.period && {
                        date_range: {
                            start: dayjs.utc(overviewState.period.start).format('YYYY-MM-DD'),
                            end: dayjs.utc(overviewState.period.end).add(1, 'day').format('YYYY-MM-DD'),
                        },
                    }),
                },
                fields: dynamicFieldsToExcelDataFields(tableState.schema.options.fields),
                file_name_prefix: FILE_NAME_PREFIX.cloudService,
            });
        };

        const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };

        const reloadTable = async () => {
            tableState.schema = await getTableSchema();
            await fetchTableData();
        };

        const handleClickSettings = () => {
            tableState.visibleCustomFieldModal = true;
        };

        /* Tabs */
        const singleItemTabState = reactive({
            tabs: computed(() => ([
                { name: 'detail', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_DETAILS') },
                { name: 'tag', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_TAG') },
                { name: 'member', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_MEMBER') },
                { name: 'history', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_HISTORY') },
                { name: 'monitoring', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_MONITORING') },
            ])),
            activeTab: 'detail',
        });

        const multiItemTabState = reactive({
            tabs: computed(() => ([
                { name: 'data', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_SELECTED_DATA') },
                { name: 'monitoring', label: i18n.t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_MONITORING') },
            ])),
            activeTab: 'data',
        });

        /* Actions */
        const handleClickConnectToConsole = () => { window.open(tableState.consoleLink, '_blank'); };

        const checkModalConfirm = async () => {
            const resetCheckTableModalState = () => {
                checkTableModalState.visible = false;
                checkTableModalState.title = '';
                checkTableModalState.subTitle = '';
                checkTableModalState.themeColor = undefined;
                checkTableModalState.api = null;
                checkTableModalState.params = null;
            };
            try {
                await checkTableModalState.api({
                    ...checkTableModalState.params,
                    cloud_services: tableState.selectedItems.map((item) => item.cloud_service_id),
                });
                showSuccessMessage(i18n.t('INVENTORY.CLOUD_SERVICE.MAIN.ALT_S_CHECK_MODAL', { action: checkTableModalState.title }), '');
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.CLOUD_SERVICE.MAIN.ALT_E_CHECK_MODAL', { action: checkTableModalState.title }));
            } finally {
                typeOptionState.selectIndex = [];
                resetCheckTableModalState();
                await fetchTableData();
                // await listCloudServiceTableData();
            }
        };

        /* Monitoring Tab */
        const monitoringState: MonitoringProps = reactive({
            resourceType: 'inventory.CloudService',
            resources: computed(() => tableState.selectedItems.map((d) => ({
                id: get(d, 'cloud_service_id'),
                name: d.name,
                provider: d.provider,
            }))) as unknown as MonitoringResourceType[],
        });

        /* Usage Overview */
        const handlePeriodUpdate = (period?: Period) => {
            overviewState.period = period;
            replaceUrlQuery('period', objectToQueryString(period));
        };

        const checkIsEmpty = (data) => isEmpty(data);

        /* Watchers */
        watch(() => keyItemSets.value, (after) => {
            // initiate queryTags with keyItemSets
            fetchOptionState.queryTags = queryHelper.setKeyItemSets(after).queryTags;
        }, { immediate: true });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        debouncedWatch([() => props.group, () => props.name], async () => {
            if (!props.isServerPage && !props.name) return;
            tableState.schema = await getTableSchema();
            await fetchTableData();
        }, { immediate: true, debounce: 200 });

        return {
            /* Sidebar */
            sidebarState,
            /* Main Table */
            tableState,
            fetchOptionState,
            typeOptionState,
            checkTableModalState,
            keyItemSets,
            valueHandlerMap,
            handleTableHeightChange,
            handleSelect,
            exportCloudServiceData,
            handleDynamicLayoutFetch,
            fieldHandler,
            reloadTable,
            handleClickSettings,
            TABLE_MIN_HEIGHT,

            /* Tabs */
            singleItemTabState,
            multiItemTabState,

            /* Actions */
            checkModalConfirm,
            handleClickConnectToConsole,

            /* Monitoring Tab */
            monitoringState,

            /* Usage Overview */
            overviewState,
            handlePeriodUpdate,
            checkIsEmpty,
        };
    },
};

</script>

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
