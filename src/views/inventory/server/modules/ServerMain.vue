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
                >
                    <template #toolbox-left>
                        <p-icon-text-button style-type="primary-dark"
                                            name="ic_plus_bold"
                                            :disabled="true"
                                            @click="onClickCollectData"
                        >
                            {{ $t('INVENTORY.SERVER.MAIN.COLLECT_DATA') }}
                        </p-icon-text-button>
                        <p-dropdown-menu-btn
                            id="server-dropdown-btn"
                            class="left-toolbox-item mr-4"
                            :menu="tableState.dropdown"
                            @click-delete="onClickDelete"
                            @click-project="onClickChangeProject"
                        >
                            {{ $t('INVENTORY.SERVER.MAIN.ACTION') }}
                        </p-dropdown-menu-btn>
                    </template>
                </p-dynamic-layout>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="tableState.selectedItems.length === 1"
               :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
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
                             :centered="true"
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
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { get } from 'lodash';
import { TranslateResult } from 'vue-i18n';
import dayjs from 'dayjs';

import {
    reactive,
    ComponentRenderProxy, getCurrentInstance, computed,
} from '@vue/composition-api';

import {
    PPageTitle, PHorizontalLayout, PDynamicLayout, PIconTextButton,
    PDropdownMenuBtn, PTab, PTableCheckModal, PEmpty,
} from '@spaceone/design-system';
import {
    QuerySearchTableFetchOptions,
    QuerySearchTableListeners, QuerySearchTableTypeOptions,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/templates/query-search-table/type';
import { DynamicLayoutFieldHandler } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type';
import { DynamicLayout } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import CollectModal from '@/common/modules/collect-modal/CollectModal.vue';
import ServerDetails from '@/views/inventory/server/modules/ServerDetails.vue';
import ServerMember from '@/views/inventory/server/modules/ServerMember.vue';
import ServerHistory from '@/views/inventory/server/modules/ServerHistory.vue';
import Monitoring from '@/common/modules/monitoring/Monitoring.vue';
import TagsPanel from '@/common/modules/tags-panel/TagsPanel.vue';
import ProjectTreeModal from '@/common/modules/ProjectTreeModal.vue';
import { MonitoringProps, MonitoringResourceType } from '@/common/modules/monitoring/type';

import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { QueryHelper } from '@/lib/query';
import { Reference } from '@/lib/reference/type';
import { ServerModel } from '@/models/inventory/server';
import { store } from '@/store';
import config from '@/lib/config';


interface ProjectItemResp {
    id: string;
    name: string;
    has_child: boolean;
    item_type: 'PROJECT_GROUP'|'PROJECT';
}

const DEFAULT_PAGE_SIZE = 15;
const STORAGE_PREFIX = 'inventory/server';
const serverStore = {
    getItem<T>(name: string, type = 'string'): T {
        const res = localStorage.getItem(`${STORAGE_PREFIX}/${name}`);
        switch (type) {
        case 'number': {
            if (res) return Number(res) as unknown as T;
            return undefined as unknown as T;
        }
        case 'object': {
            try {
                if (res) return JSON.parse(res) as unknown as T;
            } catch (e) {}
            return undefined as unknown as T;
        }
        default: return (res || undefined) as unknown as T;
        }
    },

    setItem(name: string, data: any, type = 'string') {
        let res;
        switch (type) {
        case 'number': {
            res = Number(data);
            break;
        }
        case 'object': {
            try {
                res = JSON.stringify(data);
            } catch (e) {}
            break;
        }
        default: {
            res = data;
            break;
        }
        }
        localStorage.setItem(`${STORAGE_PREFIX}/${name}`, res);
    },
};

export default {
    name: 'ServerMain',
    components: {
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
        PDropdownMenuBtn,
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

        const typeOptionState: Omit<QuerySearchTableTypeOptions, 'searchable'|'excelVisible'> = reactive({
            loading: true,
            totalCount: 0,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            selectIndex: [],
            selectable: true,
            keyItemSets: [],
            valueHandlerMap: {},
            colCopy: false,
        });
        const tableState = reactive({
            schema: null as null|DynamicLayout,
            items: [],
            selectedItems: computed(() => typeOptionState.selectIndex.map(d => tableState.items[d])),
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
                    target: 'blank',
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
        });
        const fetchOptionState: QuerySearchTableFetchOptions = reactive({
            pageStart: 1,
            pageLimit: serverStore.getItem<number>('pageLimit', 'number') || DEFAULT_PAGE_SIZE,
            sortDesc: true,
            sortBy: 'created_at',
            queryTags: [],
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
            resources: computed(() => tableState.selectedItems.map(d => ({
                id: get(d, 'server_id'),
                name: d.name,
            }))) as unknown as MonitoringResourceType[],
        });

        /* util */
        const timeFormatter = (value) => {
            let time = dayjs(dayjs.unix(value.seconds));
            if (typeOptionState.timezone !== 'UTC') {
                time = dayjs(dayjs.unix(value.seconds)).tz(typeOptionState.timezone);
            }
            return time.format('YYYY-MM-DD HH:mm:ss');
        };
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
                const res = await SpaceConnector.client.addOns.excel.export({
                    source: {
                        url: '/inventory/server/list',
                        param: { query: getQuery() },
                    },
                    template: {
                        options: {
                            fileType: 'xlsx',
                            timezone: typeOptionState.timezone,
                        },
                        data_source: tableState.schema.options.fields,
                    },
                });
                window.open(config.get('VUE_APP_API.ENDPOINT') + res.file_link);
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
                    apiQuery.setOnly(...res.options.fields.map((d) => {
                        if ((d.key as string).endsWith('.seconds')) return (d.key as string).replace('.seconds', '');
                        return d.key;
                    }), 'server_id', 'reference', 'primary_ip_address', 'collection_info.collectors');
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
        const fetchTableData: QuerySearchTableListeners['fetch'|'init'] = async (options, changed?: Partial<QuerySearchTableFetchOptions>) => {
            if (changed) {
                if (changed.sortBy !== undefined) {
                    fetchOptionState.sortBy = changed.sortBy;
                    fetchOptionState.sortDesc = !!changed.sortDesc;
                }
                if (changed.pageLimit !== undefined) {
                    fetchOptionState.pageLimit = changed.pageLimit;
                    serverStore.setItem('pageLimit', changed.pageLimit);
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
            } else {
                fetchOptionState.queryTags = options.queryTags;
            }
            await listServerData();
        };
        const onSelect: QuerySearchTableListeners['select'] = (selectIndex) => {
            typeOptionState.selectIndex = selectIndex;
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
            listServerData,
            fetchTableData,
            fieldHandler,

            /* Change Project */
            changeProjectState,
            onClickChangeProject,
            changeProject,

            /* Actions & Checking */
            checkTableModalState,
            onClickDelete,
            onClickCollectData,
            checkModalConfirm,

            /* Tabs */
            singleItemTabState,
            multiItemTabState,
            monitoringState,

            timeFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
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

>>> .p-dynamic-layout-query-search-table .p-query-search-table {
    border-width: 1px;
}
</style>
