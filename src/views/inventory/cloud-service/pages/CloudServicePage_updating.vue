<template>
    <general-page-layout>
        <div class="page-navigation">
            <p-page-navigation :routes="routeState.route" />
        </div>
        <p-page-title :title="$route.params.name"
                      child
                      use-total-count
                      use-selected-count
                      :total-count="typeOptionState.totalCount"
                      :selected-count="tableState.selectedItems.length"
                      @goBack="$router.go(-1)"
        />
        <p-horizontal-layout>
            <template #container="{ height }">
                <!--                <s-dynamic-layout name="cloudService"-->
                <!--                                  type="query-search-table"-->
                <!--                                  :toolset="apiHandler"-->
                <!--                                  :options="options"-->
                <!--                                  :style="{'height': height+'px'}"-->
                <!--                                  :vbind="{-->
                <!--                                      showTitle: false,-->
                <!--                                      exportFields: mergeFields,-->
                <!--                                      resourceType: 'inventory.CloudService'-->
                <!--                                  }"-->
                <!--                >-->
                <!--                    <template #toolbox-left>-->
                <!--                        <p-icon-text-button style-type="primary-dark"-->
                <!--                                            name="ic_plus_bold"-->
                <!--                                            :disabled="apiHandler.tableTS.selectState.selectItems.length === 0"-->
                <!--                                            @click="clickCollectData"-->
                <!--                        >-->
                <!--                            {{ $t('BTN.COLLECT_DATA') }}-->
                <!--                        </p-icon-text-button>-->

                <!--                        <p-dropdown-menu-btn-->
                <!--                            class="left-toolbox-item mr-4"-->
                <!--                            :menu="csDropdownMenu"-->
                <!--                            @click-project="clickProject"-->
                <!--                            @click-link="apiHandler.tableTS.linkState.openLink()"-->
                <!--                        >-->
                <!--                            Action-->
                <!--                        </p-dropdown-menu-btn>-->
                <!--                    </template>-->
                <!--                </s-dynamic-layout>-->
                <div v-if="tableState.schema">
                    <p-dynamic-layout type="query-search-table"
                                      :options="tableState.schema.options"
                                      :data="tableState.items"
                                      :fetch-options="fetchOptionState"
                                      :type-options="typeOptionState"
                                      :style="{height: `${height}px`}"
                                      :field-handler="fieldHandler"
                                      @init="fetchTableData"
                                      @fetch="fetchTableData"
                                      @select="onSelect"
                                      @export="exportCloudServiceData"
                    >
                        <template #toolbox-left>
                            <p-icon-text-button style-type="primary-dark"
                                                name="ic_plus_bold"
                                                :disabled="tableState.selectedItems.length === 0"
                                                @click="clickCollectData"
                            >
                                {{ $t('BTN.COLLECT_DATA') }}
                            </p-icon-text-button>

                            <p-dropdown-menu-btn class="left-toolbox-item mr-4"
                                                 :menu="tableState.dropdown"
                                                 @click-project="clickProject"
                            >
                                {{ $t('BTN.ACTION') }}
                            </p-dropdown-menu-btn>
                        </template>
                    </p-dynamic-layout>
                </div>
            </template>
        </p-horizontal-layout>
        <p-tab v-if="tableState.selectedItems.length === 1" :tabs="singleItemTabState.tabs" :active-tab.sync="singleItemTabState.activeTab">
            <!--            <template #detail>-->
            <!--                <s-dynamic-sub-data-->
            <!--                    :layouts="mergeLayouts"-->
            <!--                    :resource-api="resourceApi"-->
            <!--                    :select-id="apiHandler.tableTS.selectState.firstSelectItem.cloud_service_id||''"-->
            <!--                    :is-show="subDataIsShow"-->
            <!--                />-->
            <!--            </template>-->

            <template #tag>
                <s-tags-panel :resource-id="tableState.selectedCloudServiceIds[0]"
                              resource-type="inventory.CloudService"
                              resource-key="cloud_service_id"
                />
            </template>
            <!--            <template #member>-->
            <!--                <s-dynamic-layout :api="adminApi"-->
            <!--                                  :is-show="adminIsShow" :name="$t('TAB.MEMBER')"-->
            <!--                                  v-bind="defaultAdminLayout"-->
            <!--                                  :style="{borderWidth: 0}"-->
            <!--                />-->
            <!--            </template>-->
            <!--            <template #history>-->
            <!--                <s-dynamic-layout :api="historyApi"-->
            <!--                                  :is-show="historyIsShow" :name="$t('TAB.HISTORY')"-->
            <!--                                  v-bind="defaultHistoryLayout"-->
            <!--                                  :style="{borderWidth: 0}"-->
            <!--                />-->
            <!--            </template>-->
            <template #monitoring>
                <s-monitoring v-bind="monitoringTS.state" />
            </template>
        </p-tab>
        <p-tab v-else-if="typeOptionState.selectIndex.length > 1"
               :tabs="multiItemTabState.tabs"
               :active-tab.sync="multiItemTabState.activeTab"
        >
            <!--            <template #data>-->
            <!--                <s-dynamic-layout-->
            <!--                    type="simple-table"-->
            <!--                    :options="options"-->
            <!--                    :data="apiHandler.tableTS.selectState.selectItems"-->
            <!--                    :vbind="{-->
            <!--                        showTitle:false,-->

            <!--                    }"-->
            <!--                />-->
            <!--            </template>-->
            <!--            <template #member>-->
            <!--                <s-dynamic-layout :api="adminApi"-->
            <!--                                  :is-show="adminIsShow" :name="$t('TAB.MEMBER')"-->
            <!--                                  v-bind="defaultAdminLayout"-->
            <!--                />-->
            <!--            </template>-->
            <template #monitoring>
                <s-monitoring v-bind="monitoringTS.state" />
            </template>
        </p-tab>
        <p-empty v-else style="height: auto; margin-top: 4rem;">
            No Selected Item
        </p-empty>
        <s-project-tree-modal :visible.sync="changeProjectState.visible"
                              :project-id="changeProjectState.projectId"
                              :loading="changeProjectState.loading"
                              @confirm="changeProject"
        />
        <s-collect-modal :visible.sync="tableState.collectModalVisible"
                         :resources="tableState.selectedItems"
                         id-key="cloud_service_id"
        />
    </general-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */

import {
    reactive, toRefs, computed, watch, getCurrentInstance, ComponentRenderProxy,
} from '@vue/composition-api';
import { getValue, showErrorMessage, showSuccessMessage } from '@/lib/util';
import { makeTrItems } from '@/lib/view-helper';

import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';

import SProjectTreeModal from '@/views/common/tree-api-modal/ProjectTreeModal.vue';
import { useStore } from '@/store/toolset';
import SCollectModal from '@/views/common/collect-modal/CollectModal.vue';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import STagsPanel from '@/views/common/tags/tag-panel/TagsPanel.vue';
import SMonitoring from '@/views/common/monitoring/Monitoring.vue';

import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import { get, forEach } from 'lodash';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import {
    queryStringToQueryTags,
    queryTagsToQueryString, replaceQuery,
} from '@/lib/router-query-string';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import { makeQuerySearchPropsWithSearchSchema } from '@/lib/component-utils/dynamic-layout';
import {
    QuerySearchTableFetchOptions, QuerySearchTableListeners,
    QuerySearchTableTypeOptions,
} from '@/components/organisms/dynamic-layout/templates/query-search-table/type';
import { getFiltersFromQueryTags } from '@/lib/api/query-search';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import config from '@/lib/config';
import { DynamicFieldHandler, DynamicFieldProps } from '@/components/organisms/dynamic-field/type';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { MonitoringProps, MonitoringResourceType } from '@/views/common/monitoring/type';
import { DynamicLayout } from '@/components/organisms/dynamic-layout/type/layout-schema';
import { makeDistinctValueHandlerMap } from '@/lib/component-utils/query-search';
import { DynamicLayoutFieldHandler } from '@/components/organisms/dynamic-layout/type';

const DEFAULT_PAGE_SIZE = 15;

// TODO: move this code to store
const STORAGE_PREFIX = 'inventory/cloudService';
const cloudServiceStore = {
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
    name: 'CloudServicePage',
    filters: {
        getValue,
    },
    components: {
        PDynamicLayout,
        GeneralPageLayout,
        PHorizontalLayout,
        PPageNavigation,
        PPageTitle,
        PIconTextButton,
        PTab,
        STagsPanel,
        PDropdownMenuBtn,
        PEmpty,
        SProjectTreeModal,
        SCollectModal,
        SMonitoring,
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
            required: true,
        },
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        // TODO: Change to new store
        const {
            project, provider, serviceAccount, secret, collector, user,
        } = useStore();


        /** Breadcrumb */
        const routeState = reactive({
            route: [{ name: 'Inventory', path: '/inventory' }, { name: 'Cloud Service', path: '/inventory/cloud-service' },
                { name: `${props.name}`, path: `/inventory/cloud-service/${props.provider}/${props.group}/${props.name}` }],
        });


        /** Main Table */
        // TODO: Remove it after change to new provider store
        const providerSchemaOptions = {};

        const fetchOptionState: QuerySearchTableFetchOptions = reactive({
            pageStart: 1,
            pageLimit: cloudServiceStore.getItem<number>('pageLimit', 'number') || DEFAULT_PAGE_SIZE,
            sortDesc: true,
            sortBy: 'created_at',
            queryTags: [],
        });

        const typeOptionState: QuerySearchTableTypeOptions = reactive({
            loading: true,
            totalCount: 0,
            timezone: computed(() => user.state.timezone || 'UTC'),
            selectIndex: [],
            selectable: true,
            keyItems: [],
            valueHandlerMap: {},
        });

        const tableState = reactive({
            schema: null as null|DynamicLayout,
            items: [],
            selectedItems: computed(() => typeOptionState.selectIndex.map(d => tableState.items[d])),
            providers: computed(() => provider.state.providers || {}),
            consoleLink: computed(() => {
                const res = get(tableState.selectedItems[0], 'data.reference.link')
                    || get(tableState.selectedItems[0], 'reference.external_link');
                return res;
            }),
            dropdown: computed(() => makeTrItems([
                ['add', 'BTN.CREATE'],
                ['update', 'BTN.UPDATE'],
                ['delete', 'BTN.DELETE'],
                [null, null, { type: 'divider' }],
                ['project', 'COMMON.CHG_PRO', { disabled: tableState.selectedItems.length === 0 }],
                ['region', 'BTN.CHG_REGION'],
                [null, null, { type: 'divider' }],
                ['link', null, {
                    label: 'Console',
                    disabled: !tableState.consoleLink,
                    link: tableState.consoleLink,
                    target: 'blank',
                }],
            ],
            context.parent,
            { type: 'item', disabled: true })),
            collectModalVisible: false,
            multiFields: computed(() => makeTrItems([
                ['name', 'COMMON.NAME'],
                ['state', 'COMMON.STATE'],
                ['primary_ip_address', 'COMMON.IP'],
                ['os_type', 'COMMON.O_TYPE'],
            ],
            context.parent)),
            selectedCloudServiceIds: computed(() => tableState.selectedItems.map(d => d.cloud_service_id)),
        });

        const onSelect: QuerySearchTableListeners['select'] = (selectIndex) => {
            typeOptionState.selectIndex = selectIndex;
        };

        const getTableSchema = async () => {
            try {
                // const schema = await SpaceConnector.client.addOns.pageSchema.get({
                //     resource_type: 'inventory.CloudService',
                //     schema: 'table',
                //     options: {
                //         provider: props.provider,
                //         group: props.group,
                //         name: props.name,
                //     },
                // });

                // TODO: Change it to above code after new api is ready
                const res = await SpaceConnector.client.inventory.cloudServiceType.list({
                    query: {
                        only: ['metadata.view.table.layout', 'metadata.view.search'],
                        filter: [
                            { key: 'provider', operator: 'eq', value: props.provider },
                            { key: 'group', operator: 'eq', value: props.group },
                            { key: 'name', operator: 'eq', value: props.name },
                        ],
                    },
                });
                const schema = res.results[0]?.metadata?.view?.table?.layout;
                if (schema?.options && res.results[0]?.metadata?.view?.search) {
                    schema.options.fields = [
                        ...schema.options.fields,
                        {
                            key: 'collection_info.state',
                            name: 'Collection State',
                            type: 'enum',
                            options: {
                                ACTIVE: {
                                    type: 'state',
                                    options: {
                                        icon: {
                                            image: 'ic_state_active',
                                        },
                                    },
                                },
                                DUPLICATED: {
                                    type: 'state',
                                    options: {
                                        icon: {
                                            image: 'ic_state_duplicated',
                                        },
                                    },
                                },
                                DISCONNECTED: {
                                    type: 'state',
                                    options: {
                                        icon: {
                                            image: 'ic_state_disconnected',
                                        },
                                    },
                                },
                                MANUAL: {
                                    type: 'state',
                                    options: {
                                        icon: {
                                            image: 'ic_state_manual',
                                        },
                                    },
                                },
                            },
                        }, {
                            key: 'provider',
                            name: 'Provider',
                            type: 'enum',
                            reference: {
                                resource_type: 'identity.Provider',
                                reference_key: 'provider',
                            },
                        }, {
                            key: 'project_id',
                            name: 'Project',
                            reference: {
                                resource_type: 'identity.Project',
                                reference_key: 'project_id',
                            },
                        }, {
                            key: 'updated_at.seconds',
                            name: 'Updated',
                            type: 'datetime',
                            options: {
                                source_type: 'timestamp',
                                source_format: 'seconds',
                            },
                        },
                    ];
                    schema.options.search = {
                        items: [
                            ...res.results[0]?.metadata?.view?.search,
                            {
                                key: 'collection_info.state',
                                name: 'Collection State',
                                enums: {
                                    ACTIVE: {
                                        label: 'Active',
                                    },
                                    DISCONNECTED: {
                                        label: 'Disconnected',
                                    },
                                    MANUAL: {
                                        label: 'Manual',
                                    },
                                },
                            }, {
                                key: 'provider',
                                name: 'Provider',
                                enums: {
                                    aws: {
                                        label: 'AWS',
                                    },
                                    google_cloud: {
                                        label: 'Google Cloud',
                                    },
                                    azure: {
                                        label: 'Azure',
                                    },
                                    openstack: {
                                        label: 'OpenStack',
                                    },
                                    vmware: {
                                        label: 'VMWare',
                                    },
                                },
                            }, {
                                key: 'project_id',
                                name: 'Project',
                                reference: 'identity.Project',
                            }, { key: 'updated_at', name: 'Updated', data_type: 'datetime' },
                        ],
                    };
                }


                // declare keyItems and valueHandlerMap with search schema
                if (schema?.options?.search) {
                    const searchProps = makeQuerySearchPropsWithSearchSchema(schema.options.search, 'inventory.CloudService');
                    typeOptionState.keyItems = searchProps.keyItems;
                    typeOptionState.valueHandlerMap = searchProps.valueHandlerMap;

                // declare keyItems and valueHandlerMap with table fields
                } else if (schema?.options?.fields) {
                    typeOptionState.keyItems = schema.options.fields.map(d => ({ label: d.name, name: d.key }));
                    typeOptionState.valueHandlerMap = makeDistinctValueHandlerMap(typeOptionState.keyItems, 'inventory.CloudService');
                }

                // initiate queryTags with keyItems
                fetchOptionState.queryTags = queryStringToQueryTags(vm.$route.query.filters, typeOptionState.keyItems);

                // set schema to tableState -> create dynamic layout
                tableState.schema = schema;
            } catch (e) {
                console.error(e);
                await vm.$router.push({ name: 'error' });
            }
        };

        const getQuery = () => {
            const { andFilters, orFilters, keywords } = getFiltersFromQueryTags(fetchOptionState.queryTags);

            andFilters.push(
                { k: 'provider', o: 'eq', v: props.provider },
                { k: 'cloud_service_group', o: 'eq', v: props.group },
                { k: 'cloud_service_type', o: 'eq', v: props.name },
            );

            const query = new QueryHelper();
            query.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
                .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
                .setOnly(...typeOptionState.keyItems.map(d => d.name))
                .setFilter(...andFilters)
                .setFilterOr(...orFilters)
                .setKeyword(...keywords);

            return query.data;
        };

        const cloudServiceListApi = SpaceConnector.client.inventory.cloudService.list;
        const listCloudServiceData = async () => {
            typeOptionState.loading = true;
            try {
                const res = await cloudServiceListApi({ query: getQuery() });
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

        const fetchTableData: QuerySearchTableListeners['fetch'|'init'] = async (options, changed?: Partial<QuerySearchTableFetchOptions>) => {
            if (changed) {
                if (changed.sortBy !== undefined) {
                    fetchOptionState.sortBy = changed.sortBy;
                    fetchOptionState.sortDesc = !!changed.sortDesc;
                }
                if (changed.pageLimit !== undefined) {
                    fetchOptionState.pageLimit = changed.pageLimit;
                    cloudServiceStore.setItem('pageLimit', changed.pageLimit);
                }
                if (changed.pageStart !== undefined) {
                    fetchOptionState.pageStart = changed.pageStart;
                }
                if (changed.queryTags !== undefined) {
                    fetchOptionState.queryTags = changed.queryTags;
                    // sync updated query tags to url query string
                    replaceQuery('filters', queryTagsToQueryString(changed.queryTags));
                }
            } else {
                // init
                fetchOptionState.queryTags = options.queryTags;
            }

            listCloudServiceData();
        };

        const exportApi = SpaceConnector.client.addOns.excel.export;
        const exportCloudServiceData = async () => {
            try {
                const res = await exportApi({
                    source: {
                        url: '/inventory/cloud-service/list',
                        param: { query: getQuery() },
                    },
                    template: {
                        options: {
                            fileType: 'xlsx',
                            timezone: typeOptionState.timezone,
                        },
                        data_source: tableState.schema.options?.fields,
                    },
                });
                window.open(config.get('VUE_APP_API.ENDPOINT') + res.file_link);
            } catch (e) {
                console.error(e);
            }
        };

        // TODO: make it as helper
        const fieldHandler: DynamicLayoutFieldHandler = (field) => {
            const item: Partial<DynamicFieldProps> = {};
            if (field.extraData?.reference) {
                switch (field.extraData.reference.resource_type) {
                case 'identity.Project': {
                    item.options = {
                        ...field.options,
                        link: referenceRouter(
                            field.extraData.reference.resource_type,
                            field.data,
                        ),
                    };
                    item.data = project.state.projects[field.data];
                    break;
                }
                case 'identity.Provider': {
                    item.data = provider.state.providers[field.data]?.name || field.data;
                    item.options = providerSchemaOptions;
                    break;
                }
                default: break;
                }
            }
            return item;
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
                    showSuccessMessage('Success', 'Project has been successfully changed.', context.root);
                } catch (e) {
                    showErrorMessage('Fail to Change Project', e, context.root);
                } finally {
                    await project.getProject(true);
                    await listCloudServiceData();
                }
            } else {
                try {
                    params.release_project = true;
                    await api(params);
                    showSuccessMessage('Success', 'Release Project Success', context.root);
                } catch (e) {
                    showErrorMessage('Fail to Release Project', e, context.root);
                } finally {
                    await listCloudServiceData();
                }
            }
            changeProjectState.loading = false;
            changeProjectState.visible = false;
        };


        /** Tabs */
        const singleItemTabState = reactive({
            tabs: computed(() => makeTrItems([
                ['detail', 'TAB.DETAILS'],
                ['tag', 'TAB.TAG'],
                ['member', 'TAB.MEMBER'],
                ['history', 'TAB.HISTORY'],
                ['monitoring', 'TAB.MONITORING'],
            ],
            context.parent)),
            activeTab: 'detail',
        });

        const multiItemTabState = reactive({
            tabs: makeTrItems([
                ['data', 'TAB.SELECTED_DATA'],
                ['member', 'TAB.MEMBER'],
                ['monitoring', 'TAB.MONITORING'],
            ], context.parent),
            activeTab: 'data',
        });

        /** Actions */
        const clickCollectData = () => {
            tableState.collectModalVisible = true;
        };


        /** Monitoring Tab */
        const monitoringState: MonitoringProps = reactive({
            resourceType: 'inventory.CloudService',
            resources: computed(() => tableState.selectedItems.map(d => ({
                id: get(d, 'cloud_service_id'),
                name: d.name,
            }))) as unknown as MonitoringResourceType[],
        });


        /** ******* Page Init ******* */
        const init = async () => {
            // TODO: Remove it after change to new store
            await Promise.all([
                project.getProject(true),
                provider.getProvider(true),
                serviceAccount.getServiceAccounts(true),
                secret.getSecrets(true),
                collector.getCollectors(true),
            ]);

            // TODO: move this code to provider store
            forEach(provider.state.providers, (d) => {
                providerSchemaOptions[d.name] = {
                    type: 'badge',
                    options: {
                        background_color: d.color,
                    },
                };
            });

            await getTableSchema();
        };

        init();
        /** ************************* */


        return {
            /* Breadcrumb */
            routeState,

            /* Main Table */
            tableState,
            fetchOptionState,
            typeOptionState,
            onSelect,
            exportCloudServiceData,
            listCloudServiceData,
            fetchTableData,
            fieldHandler,

            /* Change Project */
            changeProjectState,
            clickProject,
            changeProject,

            /* Tabs */
            singleItemTabState,
            multiItemTabState,

            /* Actions */
            clickCollectData,

            /* Monitoring Tab */
            monitoringState,
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

    #empty-space {
        @apply text-primary2;
        text-align: center;
        margin-bottom: 0.5rem;
    }

    >>> .p-dynamic-layout-query-search-table .p-query-search-table {
        border-width: 1px;
    }
</style>
