<template>
    <vertical-page-layout>
        <template #sidebar>
            <div class="sidebar-title">
                <p-lazy-img :src="assetUrlConverter(sidebarState.iconUrl)"
                            :loading="!sidebarState.cloudServiceTypeList[0]"
                            width="1.5rem" height="1.5rem"
                />
                <p class="sidebar-title-text">
                    {{ sidebarState.group }}
                </p>
            </div>
            <p-divider class="sidebar-divider" />
            <div v-for="(item) in sidebarState.cloudServiceTypeList" :key="item.cloud_service_type_id"
                 class="sidebar-list-item"
                 :class="{'selected': sidebarState.selectedItem && item.cloud_service_type_id === sidebarState.selectedItem.cloud_service_type_id}"
                 @click="onClickSidebarItem(item)"
            >
                <div>{{ item.name }}</div>
                <favorite-button :item-id="item.cloud_service_type_id || ''"
                                 favorite-type="cloudServiceType"
                                 resource-type="inventory.CloudServiceType"
                                 class="favorite-btn"
                                 scale="0.8"
                />
            </div>
        </template>
        <template #default>
            <div class="page-navigation">
                <p-breadcrumbs :routes="routeState.route" />
            </div>
            <server-main v-show="sidebarState.selectedItem && sidebarState.isServer"
                         :is-cloud-service="true"
                         :disabled="!sidebarState.selectedItem || !sidebarState.isServer"
                         :provider="provider"
                         :cloud-service-type="sidebarState.serverCloudServiceType"
                         :cloud-service-group="group"
                         :period="overviewState.period"
                         :min-height="TABLE_MIN_HEIGHT"
            >
                <template #period-filter>
                    <cloud-service-period-filter :period="overviewState.period"
                                                 @update:period="handlePeriodUpdate"
                    />
                </template>
                <template #usage-overview="{filters}">
                    <cloud-service-usage-overview :cloud-service-type-info="sidebarState.selectedItem"
                                                  :filters="filters"
                                                  :period="overviewState.period"
                                                  is-server
                                                  :disabled="!sidebarState.isServer"
                    />
                </template>
            </server-main>
            <div v-show="sidebarState.selectedItem && !sidebarState.isServer">
                <p-page-title :title="name"
                              child
                              use-total-count
                              use-selected-count
                              :total-count="typeOptionState.totalCount"
                              :selected-count="tableState.selectedItems.length"
                              @goBack="$router.go(-1)"
                />
                <cloud-service-period-filter :period="overviewState.period"
                                             @update:period="handlePeriodUpdate"
                />
                <p-horizontal-layout :min-height="TABLE_MIN_HEIGHT" :height="tableState.tableHeight" @drag-end="onTableHeightChange">
                    <template #container="{ height }">
                        <template v-if="tableState.schema">
                            <p-dynamic-layout type="query-search-table"
                                              :options="tableState.schema.options"
                                              :data="tableState.items"
                                              :fetch-options="fetchOptionState"
                                              :type-options="typeOptionState"
                                              :style="{height: `${height}px`}"
                                              :field-handler="fieldHandler"
                                              @fetch="fetchTableData"
                                              @select="onSelect"
                                              @export="exportCloudServiceData"
                                              @click-settings="onClickSettings"
                            >
                                <template #toolbox-left>
                                    <p-icon-text-button style-type="primary-dark"
                                                        name="ic_plus_bold"
                                                        disabled
                                                        @click="clickCollectData"
                                    >
                                        {{ $t('INVENTORY.CLOUD_SERVICE.PAGE.COLLECT_DATA') }}
                                    </p-icon-text-button>

                                    <p-select-dropdown class="left-toolbox-item mr-4"
                                                       :items="tableState.dropdown"
                                                       @select="onSelectDropdown"
                                    >
                                        {{ $t('INVENTORY.CLOUD_SERVICE.PAGE.ACTION') }}
                                    </p-select-dropdown>
                                </template>
                                <template #toolbox-bottom>
                                    <cloud-service-usage-overview :cloud-service-type-info="sidebarState.selectedItem"
                                                                  :filters="tableState.searchFilters"
                                                                  :period="overviewState.period"
                                                                  :disabled="sidebarState.isServer"
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
                            :provider="provider"
                            :cloud-service-group="group"
                            :cloud-service-type="name"
                        />
                    </template>

                    <template #tag>
                        <tags-panel :resource-id="tableState.selectedCloudServiceIds[0]"
                                    resource-type="inventory.CloudService"
                                    resource-key="cloud_service_id"
                        />
                    </template>
                    <template #member>
                        <cloud-service-admin :cloud-service-project-id="tableState.selectedItems[0].project_id" />
                    </template>
                    <template #history>
                        <cloud-service-history :cloud-service-id="tableState.selectedCloudServiceIds[0]" />
                    </template>
                    <template #monitoring>
                        <monitoring :resource-type="monitoringState.resourceType"
                                    :resources="monitoringState.resources"
                        />
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
                        <monitoring :resource-type="monitoringState.resourceType"
                                    :resources="monitoringState.resources"
                        />
                    </template>
                </p-tab>
                <p-empty v-else style="height: auto; margin-top: 4rem;">
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
                <project-tree-modal :visible.sync="changeProjectState.visible"
                                    :project-id="changeProjectState.projectId"
                                    :loading="changeProjectState.loading"
                                    @confirm="changeProject"
                />
                <s-collect-modal :visible.sync="tableState.collectModalVisible"
                                 :resources="tableState.selectedItems"
                                 id-key="cloud_service_id"
                />
                <custom-field-modal v-model="tableState.visibleCustomFieldModal"
                                    resource-type="inventory.CloudService"
                                    :options="{provider, cloudServiceGroup: group, cloudServiceType: name}"
                                    @complete="reloadTable"
                />
            </div>
        </template>
    </vertical-page-layout>
</template>

<script lang="ts">
import { get, find } from 'lodash';
import dayjs from 'dayjs';

import {
    reactive, computed, getCurrentInstance, ComponentRenderProxy, watch,
} from '@vue/composition-api';

import {
    PHorizontalLayout, PSelectDropdown, PTab, PDynamicLayout,
    PPageTitle, PLazyImg, PBreadcrumbs, PIconTextButton, PEmpty, PDivider, PTableCheckModal,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import {
    DynamicLayoutEventListener,
    DynamicLayoutFieldHandler,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type';
import { DynamicLayout } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';

import ServerMain from '@/services/asset-inventory/server/modules/ServerMain.vue';
import VerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import ProjectTreeModal from '@/common/modules/project/ProjectTreeModal.vue';
import Monitoring from '@/common/modules/monitoring/Monitoring.vue';
import CloudServiceDetail from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceDetail.vue';
import CloudServiceAdmin from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceAdmin.vue';
import CloudServiceHistory from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/CloudServiceHistory.vue';
import SCollectModal from '@/common/modules/collection/collect-modal/CollectModal.vue';
import TagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';
import { MonitoringProps, MonitoringResourceType } from '@/common/modules/monitoring/type';
import { ProjectItemResp } from '@/services/project/type';

import { objectToQueryString, queryStringToObject, replaceUrlQuery } from '@/lib/router-query-string';
import {
    dynamicFieldsToExcelDataFields,
    makeQuerySearchPropsWithSearchSchema,
} from '@/lib/component-util/dynamic-layout';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { Reference } from '@/lib/reference/type';
import { store } from '@/store';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { QueryTag } from '@spaceone/design-system/dist/src/inputs/search/query-search-tags/type';
import { KeyItemSet, ValueHandlerMap } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import { TranslateResult } from 'vue-i18n';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import ErrorHandler from '@/common/composables/error/errorHandler';
import CloudServiceUsageOverview
    from '@/services/asset-inventory/cloud-service/cloud-service-detail/modules/cloud-service-usage-overview/CloudServiceUsageOverview.vue';
import { CloudServiceTypeInfo } from '@/services/asset-inventory/cloud-service/cloud-service-detail/type';
import { QueryStoreFilter } from '@spaceone/console-core-lib/query/type';
import CloudServicePeriodFilter from '@/services/asset-inventory/cloud-service/modules/CloudServicePeriodFilter.vue';
import { Period } from '@/services/cost-explorer/type';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

const DEFAULT_PAGE_SIZE = 15;

// TODO: move this code to store
const STORAGE_PREFIX = 'inventory/cloudService';
const TABLE_MIN_HEIGHT = 400;

type SidebarItemType = {
    id?: string;
    name: string;
    type?: string;
}

export default {
    name: 'CloudServiceDetailPage',
    components: {
        CloudServicePeriodFilter,
        CloudServiceUsageOverview,
        CustomFieldModal,
        ServerMain,
        PLazyImg,
        PDivider,
        VerticalPageLayout,
        CloudServiceDetail,
        CloudServiceHistory,
        CloudServiceAdmin,
        PDynamicLayout,
        PTableCheckModal,
        PHorizontalLayout,
        PBreadcrumbs,
        PPageTitle,
        PIconTextButton,
        PTab,
        TagsPanel,
        PSelectDropdown,
        PEmpty,
        ProjectTreeModal,
        SCollectModal,
        Monitoring,
        FavoriteButton,
    },
    props: {
        provider: {
            type: String,
            required: true,
        },
        group: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper();

        /** Breadcrumb */
        const routeState = reactive({
            route: computed(() => ([
                { name: 'Asset Inventory', to: { name: ASSET_INVENTORY_ROUTE._NAME } },
                { name: 'Cloud Service', to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME } },
                { name: `${props.group}`, to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME, params: { provider: props.provider, group: props.group, name: props.name } } },
                { name: `${props.name}` },
            ])),
        });

        /** Sidebar */
        const sidebarState = reactive({
            cloudServiceTypeList: [] as CloudServiceTypeInfo[],
            group: computed(() => sidebarState.cloudServiceTypeList[0]?.group),
            iconUrl: computed<string>(() => get(sidebarState.cloudServiceTypeList[0], ['tags', 'spaceone:icon'], '')),
            selectedItem: undefined as CloudServiceTypeInfo|undefined,
            isServer: computed<boolean>(() => sidebarState.selectedItem?.resource_type === 'inventory.Server'),
            serverCloudServiceType: computed<string|undefined>(() => find(sidebarState.cloudServiceTypeList, { resource_type: 'inventory.Server' })?.name),
        });

        /** Main Table */
        const fetchOptionState = reactive({
            pageStart: 1,
            pageLimit: store.getters['settings/getItem']('pageLimit', STORAGE_PREFIX) || DEFAULT_PAGE_SIZE,
            sortDesc: true,
            sortBy: 'created_at',
            queryTags: queryHelper.setFiltersAsRawQueryString(vm.$route.query.filters).queryTags as QueryTag[],
        });

        const typeOptionState = reactive({
            loading: true,
            totalCount: 0,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            selectIndex: [] as number[],
            selectable: true,
            keyItemSets: [] as KeyItemSet[],
            valueHandlerMap: {} as ValueHandlerMap,
            colCopy: false,
            settingsVisible: true,
        });

        const tableHeight = store.getters['settings/getItem']('tableHeight', STORAGE_PREFIX) ?? 0;
        const tableState = reactive({
            schema: null as null|DynamicLayout,
            items: [],
            selectedItems: computed(() => typeOptionState.selectIndex.map(d => tableState.items[d])),
            consoleLink: computed(() => get(tableState.selectedItems[0], 'reference.external_link')),
            dropdown: computed(() => ([
                // {
                //     type: 'item',
                //     name: 'delete',
                //     label: vm.$t('INVENTORY.CLOUD_SERVICE.PAGE.DELETE'),
                //     disabled: tableState.selectedItems.length === 0,
                // },
                { type: 'divider' },
                {
                    type: 'item',
                    name: 'project',
                    label: vm.$t('INVENTORY.CLOUD_SERVICE.PAGE.CHANGE_PROJECT'),
                    disabled: tableState.selectedItems.length === 0,
                },
                { type: 'divider' },
                {
                    name: 'link',
                    label: vm.$t('INVENTORY.CLOUD_SERVICE.PAGE.CONSOLE'),
                    type: 'item',
                    disabled: !tableState.consoleLink || tableState.selectedItems.length > 1,
                    link: tableState.consoleLink,
                    target: '_blank',
                },
            ] as MenuItem[])),
            collectModalVisible: false,
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
            selectedCloudServiceIds: computed(() => tableState.selectedItems.map(d => d.cloud_service_id)),
            tableHeight: tableHeight > TABLE_MIN_HEIGHT ? tableHeight : TABLE_MIN_HEIGHT,
            visibleCustomFieldModal: false,
            searchFilters: computed<QueryStoreFilter[]>(() => queryHelper.setFiltersAsQueryTag(fetchOptionState.queryTags).filters),
        });

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

        const onTableHeightChange = (height) => {
            tableState.tableHeight = height;
            store.dispatch('settings/setItem', {
                key: 'tableHeight',
                value: height,
                path: STORAGE_PREFIX,
            });
        };

        const onSelect: DynamicLayoutEventListener['select'] = (selectIndex) => {
            typeOptionState.selectIndex = selectIndex;
        };

        const schemaQueryHelper = new QueryHelper();
        const getTableSchema = async (): Promise<null|DynamicLayout> => {
            try {
                const schema = await SpaceConnector.client.addOns.pageSchema.get({
                    resource_type: 'inventory.CloudService',
                    schema: 'table',
                    options: {
                        provider: props.provider,
                        cloud_service_group: props.group,
                        cloud_service_type: props.name,
                    },
                });

                schemaQueryHelper.setFilters([
                    { k: 'provider', o: '=', v: props.provider },
                    { k: 'cloud_service_group', o: '=', v: props.group },
                    { k: 'cloud_service_type', o: '=', v: props.name },
                ]);

                // declare keyItemSets and valueHandlerMap with search schema
                if (schema?.options?.search) {
                    const searchProps = makeQuerySearchPropsWithSearchSchema(schema.options.search, 'inventory.CloudService', schemaQueryHelper.apiQuery.filter);
                    typeOptionState.keyItemSets = searchProps.keyItemSets;
                    typeOptionState.valueHandlerMap = searchProps.valueHandlerMap;
                }

                // initiate queryTags with keyItemSets
                fetchOptionState.queryTags = queryHelper.setKeyItemSets(typeOptionState.keyItemSets).queryTags;

                // return schema
                return schema;
            } catch (e) {
                ErrorHandler.handleError(e);
                return null;
            }
        };

        const apiQuery = new ApiQueryHelper();
        const getQuery = (schema?) => {
            apiQuery.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
                .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
                .setFilters(tableState.searchFilters)
                .addFilter(
                    { k: 'provider', o: '=', v: props.provider },
                    { k: 'cloud_service_group', o: '=', v: props.group },
                    { k: 'cloud_service_type', o: '=', v: props.name },
                );

            const fields = schema?.options?.fields || tableState.schema?.options?.fields;
            if (fields) {
                apiQuery.setOnly(...fields.map(d => d.key).filter(d => !d.startsWith('tags.')), 'reference.external_link', 'cloud_service_id', 'tags', 'provider');
            }

            return apiQuery.data;
        };

        const getCloudServiceTableData = async (schema?): Promise<{items: any[]; totalCount: number}> => {
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
                typeOptionState.selectIndex = typeOptionState.selectIndex.filter(d => !!res.results[d]);

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

            const { items, totalCount } = await getCloudServiceTableData();
            tableState.items = items;
            typeOptionState.totalCount = totalCount;
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
                param: { query: getQuery() },
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

        const cloudServiceTypeQuery = new ApiQueryHelper()
            .setOnly('cloud_service_type_id', 'name', 'group', 'provider', 'tags', 'is_primary', 'resource_type')
            .setMultiSort([{ key: 'is_primary', desc: true }, { key: 'name', desc: false }]);


        const getCloudServiceTypeQuery = () => {
            cloudServiceTypeQuery.setFilters([
                { k: 'provider', v: props.provider, o: '=' },
                { k: 'group', v: props.group, o: '=' },
            ]);
            return cloudServiceTypeQuery.data;
        };

        const listCloudServiceTypeData = async () => {
            try {
                const res = await SpaceConnector.client.inventory.cloudServiceType.list({
                    query: getCloudServiceTypeQuery(),
                });
                sidebarState.cloudServiceTypeList = res.results;
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };

        const onClickSidebarItem = async (item: CloudServiceTypeInfo) => {
            if (sidebarState.selectedItem?.name !== item.name) {
                await vm.$router.replace({
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                    params: {
                        provider: props.provider,
                        group: props.group,
                        name: item.name,
                    },
                    query: vm.$route.query,
                });

                sidebarState.selectedItem = item;

                if (item.resource_type !== 'inventory.Server') {
                    typeOptionState.loading = true;
                    const schema = await getTableSchema();
                    const { items, totalCount } = await getCloudServiceTableData(schema);
                    tableState.schema = schema;
                    tableState.items = items;
                    typeOptionState.totalCount = totalCount;
                }
            }
        };

        const reloadTable = async () => {
            tableState.schema = await getTableSchema();
            await fetchTableData();
        };

        const onClickSettings = () => {
            tableState.visibleCustomFieldModal = true;
        };

        /** Change Project */
        const changeProjectState = reactive({
            visible: false,
            loading: false,
            projectId: computed(() => {
                if (tableState.selectedItems.length > 1) return '';
                return get(tableState.selectedItems[0], 'project_id', '');
            }),
        });
        const clickProject = () => { changeProjectState.visible = true; };
        const changeProject = async (data?: ProjectItemResp|null) => {
            changeProjectState.loading = true;

            const api = SpaceConnector.client.inventory.cloudService.changeProject;
            const params: any = {
                cloud_services: tableState.selectedCloudServiceIds,
            };

            if (data) {
                try {
                    params.project_id = data.id;
                    await api(params);
                    showSuccessMessage(vm.$t('INVENTORY.CLOUD_SERVICE.PAGE.ALT_S_CHANGE_PROJECT'), '', root);
                } catch (e) {
                    ErrorHandler.handleRequestError(e, vm.$t('INVENTORY.CLOUD_SERVICE.PAGE.ALT_E_CHANGE_PROJECT'));
                } finally {
                    await store.dispatch('reference/project/load');
                    const { items, totalCount } = await getCloudServiceTableData();
                    tableState.items = items;
                    typeOptionState.totalCount = totalCount;
                }
            } else {
                try {
                    params.release_project = true;
                    await api(params);
                    showSuccessMessage(vm.$t('INVENTORY.CLOUD_SERVICE.PAGE.ALT_S_RELEASE_PROJECT_TITLE'), '', root);
                } catch (e) {
                    ErrorHandler.handleRequestError(e, vm.$t('INVENTORY.CLOUD_SERVICE.PAGE.ALT_E_RELEASE_PROJECT_TITLE'));
                } finally {
                    const { items, totalCount } = await getCloudServiceTableData();
                    tableState.items = items;
                    typeOptionState.totalCount = totalCount;
                }
            }
            changeProjectState.loading = false;
            changeProjectState.visible = false;
        };


        /** Tabs */
        const singleItemTabState = reactive({
            tabs: computed(() => ([
                { name: 'detail', label: vm.$t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_DETAILS') },
                { name: 'tag', label: vm.$t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_TAG') },
                { name: 'member', label: vm.$t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_MEMBER') },
                { name: 'history', label: vm.$t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_HISTORY') },
                { name: 'monitoring', label: vm.$t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_MONITORING') },
            ])),
            activeTab: 'detail',
        });

        const multiItemTabState = reactive({
            tabs: computed(() => ([
                { name: 'data', label: vm.$t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_SELECTED_DATA') },
                { name: 'monitoring', label: vm.$t('INVENTORY.CLOUD_SERVICE.PAGE.TAB_MONITORING') },
            ])),
            activeTab: 'data',
        });

        /** Actions */
        const clickCollectData = () => {
            tableState.collectModalVisible = true;
        };

        const clickDelete = () => {
            checkTableModalState.title = vm.$tc('INVENTORY.CLOUD_SERVICE.MAIN.CHECK_MODAL_DELETE_TITLE', tableState.selectedItems.length);
            checkTableModalState.subTitle = vm.$tc('INVENTORY.CLOUD_SERVICE.MAIN.CHECK_MODAL_DELETE_DESC', tableState.selectedItems.length);
            checkTableModalState.themeColor = 'alert';
            checkTableModalState.visible = true;
            checkTableModalState.api = SpaceConnector.client.inventory.cloudService.delete;
            checkTableModalState.params = {};
        };
        const onSelectDropdown = (name) => {
            switch (name) {
            case 'delete': clickDelete(); break;
            case 'project': clickProject(); break;
            default: break;
            }
        };

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
                    cloud_services: tableState.selectedItems.map(item => item.cloud_service_id),
                });
                showSuccessMessage(vm.$t('INVENTORY.CLOUD_SERVICE.MAIN.ALT_S_CHECK_MODAL', { action: checkTableModalState.title }), '', root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, vm.$t('INVENTORY.CLOUD_SERVICE.MAIN.ALT_E_CHECK_MODAL', { action: checkTableModalState.title }));
            } finally {
                typeOptionState.selectIndex = [];
                resetCheckTableModalState();
                await fetchTableData();
                // await getCloudServiceTableData();
            }
        };


        /** Monitoring Tab */
        const monitoringState: MonitoringProps = reactive({
            resourceType: 'inventory.CloudService',
            resources: computed(() => tableState.selectedItems.map(d => ({
                id: get(d, 'cloud_service_id'),
                name: d.name,
                provider: d.provider,
            }))) as unknown as MonitoringResourceType[],
        });


        /** Usage Overview */
        const handlePeriodUpdate = (period?: Period) => {
            overviewState.period = period;
            replaceUrlQuery('period', objectToQueryString(period));
        };


        /** ******* Page Init ******* */
        const initSidebar = async () => {
            await listCloudServiceTypeData();
            sidebarState.selectedItem = find(sidebarState.cloudServiceTypeList, { name: props.name });
        };

        const routeFirstItem = async () => {
            await vm.$router.replace({
                name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
                params: {
                    provider: props.provider,
                    group: props.group,
                    name: sidebarState.cloudServiceTypeList[0].name,
                },
                query: vm.$route.query,
            });
            sidebarState.selectedItem = sidebarState.cloudServiceTypeList[0];
        };

        watch([() => props.group, () => props.name], async () => {
            await initSidebar();
            await store.dispatch('favorite/cloudServiceType/load');
            if (!props.name) await routeFirstItem();
            tableState.schema = await getTableSchema();
            await fetchTableData();
        }, { immediate: true });

        return {
            /* Breadcrumb */
            routeState,
            /* Sidebar */
            sidebarState,
            /* Main Table */
            tableState,
            fetchOptionState,
            typeOptionState,
            checkTableModalState,
            onTableHeightChange,
            onSelect,
            exportCloudServiceData,
            fetchTableData,
            fieldHandler,
            reloadTable,
            onClickSettings,
            TABLE_MIN_HEIGHT,


            /* Change Project */
            changeProjectState,
            changeProject,

            /* Tabs */
            singleItemTabState,
            multiItemTabState,

            /* Actions */
            onClickSidebarItem,
            clickCollectData,
            onSelectDropdown,
            checkModalConfirm,

            /* Monitoring Tab */
            monitoringState,

            /* Usage Overview */
            overviewState,
            handlePeriodUpdate,

            /* Helper */
            assetUrlConverter,
        };
    },
};

</script>

<style lang="postcss" scoped>
>>> .p-horizontal-layout .horizontal-contents {
    overflow: unset;
}

.left-toolbox-item {
    margin-left: 1rem;
    &:last-child {
        flex-grow: 1;
    }
}

.sidebar-title {
    display: flex;
    align-items: center;
    margin-top: 2rem;
    margin-left: 1rem;
    margin-bottom: 0.4375rem;
    .sidebar-title-text {
        @apply font-bold;
        font-size: 0.875rem;
        line-height: 140%;
        margin-left: 0.5rem;
    }
}
.sidebar-divider {
    @apply w-full;
    margin-bottom: 0.75rem;
}

.sidebar-list-item {
    @apply truncate rounded flex justify-between items-center;
    height: 2rem;
    margin: 0 0.75rem;
    padding: 0.375rem 1rem;
    font-size: 0.875rem;
    line-height: 140%;
    .favorite-btn {
        display: none;
    }
    &:hover {
        @apply bg-blue-100 cursor-pointer;
        .favorite-btn {
            display: block;
        }
    }
    &::v-deep {
        .favorite-btn {
            &.active {
                display: block;
            }
        }
    }
    &:active {
        @apply bg-blue-200 text-blue-600 cursor-pointer;
    }
    &.selected {
        @apply bg-blue-200 text-blue-600 cursor-pointer;
    }
}

.selected-data-tab {
    @apply mt-8;
}

>>> .p-dynamic-layout-query-search-table .p-toolbox-table {
    @apply border border-gray-200 rounded-lg;
    .p-data-table {
        min-height: unset;
    }
}
.p-tab::v-deep {
    @apply rounded-lg;
    &.monitoring {
        .tab-pane {
            @apply bg-secondary2;
        }
    }
}

@screen mobile {
    ::v-deep {
        .horizontal-contents {
            height: 50rem !important;
            .p-dynamic-layout-query-search-table {
                height: 50rem !important;
            }
        }
    }
}
</style>
