<template>
    <div>
        <p-page-title :title="pageTitle"
                      use-total-count use-selected-count
                      :total-count="typeOptionState.totalCount"
                      :selected-count="tableState.selectedItems.length"
                      :child="isCloudService"
                      @goBack="$router.go(-1)"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <p-dynamic-layout v-if="tableState.schema"
                                  type="query-search-table"
                                  :options="tableState.schema.options"
                                  :data="tableState.items"
                                  :fetch-options="fetchOptionState"
                                  :type-options="typeOptionState"
                                  :style="{height: `${height}px`}"
                                  :field-handler="fieldHandler"
                                  @fetch="fetchTableData"
                                  @select="onSelect"
                                  @export="exportServerData"
                                  @click-settings="onClickSettings"
                >
                    <template #toolbox-left>
                        <div class="flex">
                            <p-icon-text-button style-type="primary-dark"
                                                name="ic_plus_bold"
                                                :disabled="true"
                                                @click="onClickCollectData"
                            >
                                {{ $t('INVENTORY.SERVER.MAIN.COLLECT_DATA') }}
                            </p-icon-text-button>
                            <p-select-dropdown class="left-toolbox-item"
                                               :items="tableState.dropdown"
                                               @select="onSelectDropdown"
                            >
                                {{ $t('INVENTORY.SERVER.MAIN.ACTION') }}
                            </p-select-dropdown>
                        </div>
                    </template>
                </p-dynamic-layout>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="tableState.selectedItems.length === 1"
               :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
               :class="singleItemTabState.activeTab"
        >
            <template #details>
                <server-details :server-id="tableState.selectedServerIds[0]" />
            </template>
            <template #tag>
                <tags-panel :resource-id="tableState.selectedServerIds[0]"
                            resource-type="inventory.Server"
                            resource-key="server_id"
                />
            </template>
            <template #member>
                <server-member :server-ids="tableState.selectedServerIds" />
            </template>
            <template #history>
                <server-history :server-id="tableState.selectedServerIds[0]" />
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
            <template #member>
                <server-member :server-ids="tableState.selectedServerIds" />
            </template>
            <template #monitoring>
                <monitoring :resource-type="monitoringState.resourceType"
                            :resources="monitoringState.resources"
                />
            </template>
        </p-tab>
        <div v-else class="empty-space">
            <p-empty>{{ $t('INVENTORY.SERVER.MAIN.NO_SELECTED_SERVER') }}</p-empty>
        </div>

        <p-table-check-modal v-if="!!checkTableModalState.visible"
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
        <collect-modal :visible.sync="tableState.collectModalVisible"
                       :resources="tableState.selectedItems"
                       id-key="server_id"
        />
        <custom-field-modal v-model="tableState.visibleCustomFieldModal"
                            resource-type="inventory.Server"
                            @complete="reloadTable"
        />
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { get } from 'lodash';
import { TranslateResult } from 'vue-i18n';

import {
    reactive,
    ComponentRenderProxy, getCurrentInstance, computed,
} from '@vue/composition-api';

import {
    PPageTitle, PHorizontalLayout, PDynamicLayout, PIconTextButton,
    PTab, PTableCheckModal, PEmpty, PSelectDropdown,
} from '@spaceone/design-system';
import {
    DynamicLayoutEventListener,
    DynamicLayoutFieldHandler,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type';
import { DynamicLayout } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import CollectModal from '@/common/modules/collection/collect-modal/CollectModal.vue';
import ServerDetails from '@/services/inventory/server/modules/ServerDetails.vue';
import ServerMember from '@/services/inventory/server/modules/ServerMember.vue';
import ServerHistory from '@/services/inventory/server/modules/ServerHistory.vue';
import Monitoring from '@/services/monitoring/modules/monitoring/Monitoring.vue';
import TagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';
import ProjectTreeModal from '@/common/modules/project/ProjectTreeModal.vue';
import { MonitoringProps, MonitoringResourceType } from '@/services/monitoring/modules/monitoring/type';

import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { replaceUrlQuery } from '@/lib/router-query-string';
import {
    dynamicFieldsToExcelDataFields,
    makeQuerySearchPropsWithSearchSchema,
} from '@/lib/component-util/dynamic-layout';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { showErrorMessage, showLoadingMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { Reference } from '@/lib/reference/type';
import { store } from '@/store';
import { KeyItemSet, ValueHandlerMap } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import { QueryTag } from '@spaceone/design-system/dist/src/inputs/search/query-search-tags/type';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';


interface ProjectItemResp {
    id: string;
    name: string;
    has_child: boolean;
    item_type: 'PROJECT_GROUP'|'PROJECT';
}

const DEFAULT_PAGE_SIZE = 15;
const STORAGE_PREFIX = 'inventory/server';

export default {
    name: 'ServerMain',
    components: {
        CustomFieldModal,
        PPageTitle,
        CollectModal,
        ServerDetails,
        ServerMember,
        ServerHistory,
        Monitoring,
        TagsPanel,
        ProjectTreeModal,
        PTableCheckModal,
        PTab,
        PSelectDropdown,
        PIconTextButton,
        PDynamicLayout,
        PHorizontalLayout,
        PEmpty,
    },
    props: {
        isCloudService: {
            type: Boolean,
            default: false,
        },
        provider: {
            type: String,
            default: undefined,
        },
        cloudServiceGroup: {
            type: String,
            default: undefined,
        },
        cloudServiceType: {
            type: String,
            default: undefined,
        },
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);
        const apiQuery = new ApiQueryHelper();
        const pageTitle = computed(() => (props.isCloudService ? props.cloudServiceType : vm.$t('INVENTORY.SERVER.MAIN.TITLE')));

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
        const tableState = reactive({
            schema: null as null|DynamicLayout,
            items: [],
            selectedItems: computed(() => typeOptionState.selectIndex.map(d => tableState.items[d]).filter(d => d !== undefined)),
            consoleLink: computed(() => get(tableState.selectedItems[0], 'reference.external_link')),
            dropdown: computed<MenuItem[]>(() => [
                {
                    name: 'delete', label: vm.$t('INVENTORY.SERVER.MAIN.DELETE') as string, type: 'item', disabled: tableState.selectedItems.length === 0,
                }, {
                    name: 'null', type: 'divider',
                }, {
                    name: 'project', label: vm.$t('INVENTORY.SERVER.MAIN.CHANGE_PROJECT') as string, type: 'item', disabled: tableState.selectedItems.length === 0,
                }, {
                    name: 'null', type: 'divider',
                }, {
                    name: 'link',
                    label: vm.$t('INVENTORY.SERVER.MAIN.CONSOLE') as string,
                    type: 'item',
                    disabled: !tableState.consoleLink || tableState.selectedItems.length > 1,
                    link: tableState.consoleLink,
                    target: '_blank',
                },
            ]),
            collectModalVisible: false,
            multiSchema: computed<null|DynamicLayout>(() => {
                if (!tableState.schema) return null;

                const res: DynamicLayout = { ...tableState.schema };
                if (tableState.schema.options.fields) {
                    res.options = {
                        ...tableState.schema.options,
                        fields: [{ name: 'Server ID', key: 'server_id' }, ...tableState.schema.options.fields],
                    };
                }

                return res;
            }),
            selectedServerIds: computed(() => tableState.selectedItems.map(d => d.server_id)),
            visibleCustomFieldModal: false,
        });
        const fetchOptionState = reactive({
            pageStart: 1,
            pageLimit: store.getters['settings/getItem']('pageLimit', STORAGE_PREFIX) || DEFAULT_PAGE_SIZE,
            sortDesc: true,
            sortBy: 'created_at',
            queryTags: [] as QueryTag[],
        });
        const checkTableModalState = reactive({
            visible: false,
            item: null,
            title: '' as TranslateResult,
            subTitle: '' as TranslateResult,
            themeColor: '',
            api: null as any,
            params: null as any,
        });
        const changeProjectState = reactive({
            visible: false,
            loading: false,
            projectId: computed(() => {
                if (tableState.selectedItems.length > 1) return '';
                return get(tableState.selectedItems[0], 'project_id', '');
            }),
        });
        // tabs
        const singleItemTabState = reactive({
            tabs: computed(() => [
                {
                    name: 'details', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_DETAILS') as string, type: 'item',
                }, {
                    name: 'tag', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_TAG') as string, type: 'item',
                }, {
                    name: 'member', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_MEMBER') as string, type: 'item',
                }, {
                    name: 'history', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_HISTORY') as string, type: 'item',
                }, {
                    name: 'monitoring', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_MONITORING') as string, type: 'item',
                },
            ]),
            activeTab: 'details',
        });
        const multiItemTabState = reactive({
            tabs: computed(() => [
                {
                    name: 'data', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_SELECTED_DATA') as string, type: 'item',
                }, {
                    name: 'member', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_MEMBER') as string, type: 'item',
                }, {
                    name: 'monitoring', label: vm.$t('INVENTORY.SERVER.MAIN.TAB_MONITORING') as string, type: 'item',
                },
            ]),
            activeTab: 'data',
        });
        const monitoringState: MonitoringProps = reactive({
            resourceType: 'inventory.Server',
            resources: computed<MonitoringResourceType[]>(() => tableState.selectedItems.map(d => ({
                id: get(d, 'server_id'),
                name: d.name,
                provider: d.provider,
            }))),
        });

        /* util */
        const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };

        /* api */
        const getQuery = () => {
            apiQuery.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
                .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
                .setFilters(queryHelper.filters);

            if (props.isCloudService) {
                apiQuery.addFilter({ k: 'provider', o: '=', v: props.provider },
                    { k: 'cloud_service_type', o: '=', v: props.cloudServiceType },
                    { k: 'cloud_service_group', o: '=', v: props.cloudServiceGroup });
            }
            return apiQuery.data;
        };
        const listServerData = async () => {
            typeOptionState.loading = true;
            try {
                const res = await SpaceConnector.client.inventory.server.list({ query: getQuery() });
                tableState.items = res.results;
                typeOptionState.totalCount = res.total_count;
            } catch (e) {
                console.error(e);
                tableState.items = [];
                typeOptionState.totalCount = 0;
            } finally {
                typeOptionState.loading = false;
            }
        };
        const exportServerData = async () => {
            try {
                showLoadingMessage(vm.$t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '', vm.$root);
                await store.dispatch('file/downloadExcel', {
                    url: '/inventory/server/list',
                    param: { query: getQuery() },
                    fields: dynamicFieldsToExcelDataFields(tableState.schema.options.fields),
                    file_name_prefix: FILE_NAME_PREFIX.server,
                });
            } catch (e) {
                console.error(e);
            }
        };
        const getTableSchema = async () => {
            try {
                const res = await SpaceConnector.client.addOns.pageSchema.get({
                    resource_type: 'inventory.Server',
                    schema: 'table',
                });

                // declare keyItemSets and valueHandlerMap with search schema
                if (res?.options?.search) {
                    const searchProps = makeQuerySearchPropsWithSearchSchema(res.options.search, 'inventory.Server');
                    typeOptionState.keyItemSets = searchProps.keyItemSets;
                    typeOptionState.valueHandlerMap = searchProps.valueHandlerMap;
                }
                // set api query to get only a few specified data
                if (res?.options?.fields) {
                    apiQuery.setOnly(...res.options.fields.map(d => d.key).filter(d => !d.startsWith('tags.')),
                        'server_id', 'reference.external_link', 'primary_ip_address', 'collection_info.collectors', 'tags', 'provider');
                }

                // initiate queryTags with keyItemSets
                fetchOptionState.queryTags = queryHelper.setKeyItemSets(typeOptionState.keyItemSets).queryTags;

                // set schema to tableState -> create dynamic layout
                tableState.schema = res;
            } catch (e) {
                console.error(e);
            }
        };
        const changeProject = async (data?: ProjectItemResp|null) => {
            changeProjectState.loading = true;

            const api = SpaceConnector.client.inventory.server.changeProject;
            const params: any = {
                servers: tableState.selectedServerIds,
            };
            if (data) {
                try {
                    params.project_id = data.id;
                    await api(params);
                    showSuccessMessage(vm.$t('INVENTORY.SERVER.MAIN.ALT_S_CHANGE_PROJECT_TITLE'), '', context.root);
                } catch (e) {
                    showErrorMessage(vm.$t('INVENTORY.SERVER.MAIN.ALT_E_CHANGE_PROJECT_TITLE'), e, context.root);
                } finally {
                    await store.dispatch('resource/project/load');
                    await listServerData();
                }
            } else {
                try {
                    params.release_project = true;
                    await api(params);
                    showSuccessMessage(vm.$t('INVENTORY.SERVER.MAIN.ALT_S_RELEASE_PROJECT_TITLE'), '', context.root);
                } catch (e) {
                    showErrorMessage(vm.$t('INVENTORY.SERVER.MAIN.ALT_E_RELEASE_PROJECT_TITLE'), e, context.root);
                } finally {
                    await listServerData();
                }
            }
            changeProjectState.loading = false;
            changeProjectState.visible = false;
        };

        /* event */
        const fetchTableData: DynamicLayoutEventListener['fetch'] = async (changed) => {
            if (changed) {
                if (changed.sortBy !== undefined) {
                    fetchOptionState.sortBy = changed.sortBy;
                    fetchOptionState.sortDesc = !!changed.sortDesc;
                }
                if (changed.pageLimit !== undefined) {
                    fetchOptionState.pageLimit = changed.pageLimit;
                    store.dispatch('settings/setItem', {
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
                    /* api query setting */
                    queryHelper.setFiltersAsQueryTag(changed.queryTags);
                    /* sync updated query tags to url query string */
                    await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
                }
            }

            await listServerData();
        };
        const onSelect: DynamicLayoutEventListener['select'] = (selectIndex) => {
            typeOptionState.selectIndex = selectIndex;
        };
        const onClickSettings = () => {
            tableState.visibleCustomFieldModal = true;
        };
        const onClickChangeProject = () => { changeProjectState.visible = true; };
        const onClickDelete = () => {
            checkTableModalState.title = vm.$tc('INVENTORY.SERVER.MAIN.CHECK_MODAL_DELETE_TITLE', tableState.selectedItems.length);
            checkTableModalState.subTitle = vm.$tc('INVENTORY.SERVER.MAIN.CHECK_MODAL_DELETE_DESC', tableState.selectedItems.length);
            checkTableModalState.themeColor = 'alert';
            checkTableModalState.visible = true;
            checkTableModalState.api = SpaceConnector.client.inventory.server.delete;
            checkTableModalState.params = {};
        };
        const onClickCollectData = () => {
            tableState.collectModalVisible = true;
        };
        const checkModalConfirm = async () => {
            const resetCheckTableModalState = () => {
                checkTableModalState.visible = false;
                checkTableModalState.title = '';
                checkTableModalState.subTitle = '';
                checkTableModalState.themeColor = '';
                checkTableModalState.api = null;
                checkTableModalState.params = null;
            };
            try {
                await checkTableModalState.api({
                    ...checkTableModalState.params,
                    servers: tableState.selectedItems.map(item => item.server_id),
                });
                showSuccessMessage(vm.$t('INVENTORY.SERVER.MAIN.ALT_S_CHECK_MODAL', { action: checkTableModalState.title }), '', context.root);
            } catch (e) {
                showErrorMessage(vm.$t('INVENTORY.SERVER.MAIN.ALT_E_CHECK_MODAL', { action: checkTableModalState.title }), e, context.root);
            } finally {
                typeOptionState.selectIndex = [];
                resetCheckTableModalState();
                await listServerData();
            }
        };
        const onSelectDropdown = (name) => {
            switch (name) {
            case 'delete': onClickDelete(); break;
            case 'project': onClickChangeProject(); break;
            default: break;
            }
        };

        const reloadTable = async () => {
            await getTableSchema();
            await listServerData();
        };

        /* init */
        const init = async () => {
            await getTableSchema();
            await listServerData();
        };
        init();

        return {
            /* Server Table */
            pageTitle,
            tableState,
            fetchOptionState,
            typeOptionState,
            onSelect,
            exportServerData,
            onClickSettings,
            listServerData,
            fetchTableData,
            fieldHandler,
            reloadTable,

            /* Change Project */
            changeProjectState,
            changeProject,

            /* Actions & Checking */
            checkTableModalState,
            onClickCollectData,
            checkModalConfirm,
            onSelectDropdown,

            /* Tabs */
            singleItemTabState,
            multiItemTabState,
            monitoringState,
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

.empty-space {
    @apply text-primary2 mt-6;
    text-align: center;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
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
</style>
