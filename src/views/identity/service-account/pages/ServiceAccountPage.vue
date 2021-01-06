<template>
    <p-vertical-page-layout :min-width="270" :init-width="270" :max-width="400">
        <template #sidebar="{width}">
            <p class="sidebar-title">
                {{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.PROVIDERS_TITLE') }}
            </p>
            <p-hr class="sidebar-divider" />
            <div v-for="provider in providerState.items" :key="provider.provider" class="provider-list">
                <p-hr v-if="provider.provider && provider.provider !== 'megazone'" class="provider-divider" />
                <p-radio v-model="selectedProvider" :value="provider.provider">
                    <template #radio-left>
                        <img v-if="provider.icon"
                             :src="provider.icon"
                             :alt="provider.provider"
                             class="provider-icon"
                        >
                        <p-i v-else name="ic_provider_other"
                             class="provider-icon"
                        />
                        <span class="provider-name">{{ provider.name }}</span>
                    </template>
                    <template #icon="{ iconName }">
                        <p-i class="radio-icon float-right" width="1.25rem" height="1.25rem"
                             :name="iconName"
                        />
                    </template>
                </p-radio>
            </div>
        </template>
        <template #default>
            <div class="page-navigation">
                <p-page-navigation :routes="route" />
            </div>
            <p-page-title :title="$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TITLE', {provider: selectedProviderName})"
                          class="page-title"
            />
            <p-horizontal-layout>
                <template #container="{ height }">
                    <p-dynamic-layout v-if="tableState.schema"
                                      type="table"
                                      :options="tableState.schema.options"
                                      :data="tableState.items"
                                      :fetch-options="fetchOptionState"
                                      :type-options="typeOptionState"
                                      :style="{height: `${height}px`}"
                                      :field-handler="fieldHandler"
                                      @fetch="fetchTableData"
                                      @select="onSelect"
                                      @export="exportServiceAccountData"
                    >
                        <template #toolbox-left>
                            <p-icon-text-button style-type="primary-dark"
                                                name="ic_plus_bold"
                                                class="mr-4"
                                                @click="clickAddServiceAccount"
                            >
                                {{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.ADD') }}
                            </p-icon-text-button>
                            <p-dropdown-menu-btn
                                class="left-toolbox-item mr-4"
                                :menu="tableState.dropdown"
                                @click-delete="clickDeleteServiceAccount"
                                @click-project="clickProject"
                            >
                                {{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.ACTION') }}
                            </p-dropdown-menu-btn>
                        </template>
                    </p-dynamic-layout>
                </template>
            </p-horizontal-layout>
            <p-tab v-if="typeOptionState.selectIndex.length === 1"
                   :tabs="singleItemTabState.tabs"
                   :active-tab.sync="singleItemTabState.activeTab"
            >
                <template #details>
                    <service-account-details :selected-provider="selectedProvider"
                                             :service-account-id="tableState.selectedAccountIds[0]"
                    />
                </template>
                <template #tag>
                    <tags-panel :resource-id="tableState.selectedAccountIds[0]"
                                resource-type="identity.ServiceAccount"
                                resource-key="service_account_id"
                    />
                </template>
                <template #credentials>
                    <service-account-credentials :service-account-id="tableState.selectedAccountIds[0]" />
                </template>
                <template #member>
                    <service-account-member :service-accounts="tableState.selectedAccountIds" />
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
            </p-tab>
            <div v-else class="empty-space">
                <p-empty>{{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.NO_SELECTED_ACCOUNT') }}</p-empty>
            </div>
            <p-double-check-modal :visible.sync="doubleCheckModalState.visible"
                                  :header-title="doubleCheckModalState.title"
                                  :sub-title="doubleCheckModalState.subTitle"
                                  :verification-text="doubleCheckModalState.verificationText"
                                  :theme-color="doubleCheckModalState.themeColor"
                                  :centered="true"
                                  @confirm="deleteServiceAccount"
            />
            <project-tree-modal :visible.sync="changeProjectState.visible"
                                :project-id="changeProjectState.projectId"
                                :loading="changeProjectState.loading"
                                @confirm="changeProject"
            />
        </template>
    </p-vertical-page-layout>
</template>
<script lang="ts">
/* external library */
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, ref, Ref, toRefs, watch,
} from '@vue/composition-api';
import { get } from 'lodash';
import { render } from 'ejs';

/* spaceone design system */
import {
    PRadio, PI, PHr, PPageNavigation, PPageTitle, PHorizontalLayout, PIconTextButton,
    PDropdownMenuBtn, PTab, PDataTable, PDynamicLayout, PEmpty, PDoubleCheckModal,
} from '@spaceone/design-system';
import {
    TableEventListeners,
    TableFetchOptions,
    TableTypeOptions,
} from '@spaceone/design-system/dist/src/organisms/dynamic-layout/templates/table/type';
import { DynamicLayoutFieldHandler } from '@spaceone/design-system/dist/src/organisms/dynamic-layout/type';
import { MenuItem } from '@spaceone/design-system/dist/src/organisms/context-menu/type';
import { TabItem } from '@spaceone/design-system/dist/src/organisms/tabs/tab/type';
import { DynamicLayout } from '@spaceone/design-system/dist/src/organisms/dynamic-layout/type/layout-schema';

/* components */
import PVerticalPageLayout from '@/views/common/components/page-layout/VerticalPageLayout.vue';
import TagsPanel from '@/views/common/components/tags/TagsPanel.vue';
import ProjectTreeModal from '@/views/common/components/tree-modal/ProjectTreeModal.vue';

/* page modules */
import ServiceAccountDetails from '@/views/identity/service-account/modules/ServiceAccountDetails.vue';
import ServiceAccountCredentials from '@/views/identity/service-account/modules/ServiceAccountCredentials.vue';
import ServiceAccountMember from '@/views/identity/service-account/modules/ServiceAccountMember.vue';

/* utils */
import { replaceUrlQuery } from '@/lib/router-query-string';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import config from '@/lib/config';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

/* types */
import { Reference } from '@/lib/reference/type';
import { store } from '@/store';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { TranslateResult } from 'vue-i18n';
import { QueryHelper } from '@/lib/query';

interface ProjectItemResp {
    id: string;
    name: string;
    // eslint-disable-next-line camelcase
    has_child: boolean;
    item_type: 'PROJECT_GROUP'|'PROJECT';
}

export default {
    name: 'ServiceAccountPage',
    components: {
        ProjectTreeModal,
        PDoubleCheckModal,
        PDropdownMenuBtn,
        PIconTextButton,
        ServiceAccountDetails,
        PEmpty,
        ServiceAccountMember,
        ServiceAccountCredentials,
        TagsPanel,
        PDynamicLayout,
        PDataTable,
        PHorizontalLayout,
        PPageTitle,
        PPageNavigation,
        PHr,
        PI,
        PRadio,
        PVerticalPageLayout,
        PTab,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);

        /** Provider(located at sidebar) & Page Title * */
        const selectedProvider: Ref<string> = ref('aws');
        const providerState = reactive({
            items: computed(() => Object.keys(store.state.resource.provider.items).map(k => ({
                provider: k,
                ...store.state.resource.provider.items[k],
            }))),
        });
        const selectedProviderName = computed(() => store.state.resource.provider.items[selectedProvider.value]?.label || selectedProvider.value);

        /** Page Navigation * */
        const routeState = reactive({
            route: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.SERVICE_ACCOUNT'), path: '/identity/service-account' },
            ])),
        });

        /** States for Dynamic Layout(search table type) * */
        const fetchOptionState: TableFetchOptions = reactive({
            pageStart: 1,
            pageLimit: 15,
            sortDesc: true,
            sortBy: 'created_at',
            searchText: queryHelper.apiQuery.keyword,
        });

        const typeOptionState: Omit<TableTypeOptions, 'searchable'|'excelVisible'> = reactive({
            loading: true,
            totalCount: 0,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            selectIndex: [],
            selectable: true,
            colCopy: false,
        });

        const tableState = reactive({
            items: [],
            selectedItems: computed(() => typeOptionState.selectIndex.map(d => tableState.items[d])),
            // consoleLink: computed(() => {
            //     const res = get(tableState.selectedItems[0], 'data.reference.link')
            //             || get(tableState.selectedItems[0], 'reference.external_link');
            //     return res;
            // }),
            consoleLink: '',
            dropdown: computed<MenuItem[]>(() => [
                {
                    name: 'delete', label: vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.DELETE'), type: 'item', disabled: tableState.selectedItems.length !== 1,
                },
                {
                    type: 'divider',
                },
                {
                    name: 'project', label: vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.CHANGE_PROJECT'), type: 'item', disabled: tableState.selectedItems.length === 0,
                },
                {
                    type: 'divider',
                },
                {
                    name: 'link', label: vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.CONSOLE'), type: 'item', disabled: !tableState.consoleLink, link: tableState.consoleLink, target: 'blank',
                },
            ]),
            selectedAccountIds: computed(() => tableState.selectedItems.map(d => d?.service_account_id)),
            schema: null as null|DynamicLayout,
            multiSchema: computed<null|DynamicLayout>(() => {
                if (!tableState.schema) return null;

                const res: DynamicLayout = { ...tableState.schema };
                if (tableState.schema.options.fields) {
                    res.options = {
                        ...tableState.schema.options,
                        fields: [{ name: 'Account ID', key: 'service_account_id' }, ...tableState.schema.options.fields],
                    };
                }

                return res;
            }),
        });

        const getLinkTemplate = (data) => {
            let linkTemplate: string | undefined;
            let link = '';
            switch (selectedProvider.value) {
            case 'aws':
                linkTemplate = providerState.items[0].linkTemplate;
                if (linkTemplate) link = render(linkTemplate as string, data);
                break;
            // case 'google_cloud':
            //     linkTemplate = providerState.items[1].linkTemplate;
            //     tableState.consoleLink = render(linkTemplate, data);
            //     break;
            default:
                break;
            }
            return link;
        };

        const getConsoleLink = () => {
            if (tableState.selectedItems.length === 1) {
                tableState.consoleLink = getLinkTemplate(tableState.selectedItems[0]);
            } else {
                tableState.consoleLink = '';
            }
        };

        const onSelect: TableEventListeners['select'] = (selectIndex) => {
            typeOptionState.selectIndex = selectIndex;
            getConsoleLink();
        };

        /** Handling API with SpaceConnector * */

        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
                .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
                .setFilters([{ k: 'provider', v: selectedProvider.value, o: '=' }])
                .addFilter(...queryHelper.filters);
            return apiQuery.data;
        };

        const serviceAccountListApi = SpaceConnector.client.identity.serviceAccount.list;
        const listServiceAccountData = async () => {
            typeOptionState.loading = true;
            try {
                const res = await serviceAccountListApi({ query: getQuery() });

                // filtering select index
                typeOptionState.selectIndex = typeOptionState.selectIndex.filter(d => !!res.results[d]);

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

        /** Change Detection of Main Table * */
        const fetchTableData: TableEventListeners['fetch'] = (options, changed) => {
            if (changed) {
                if (changed.sortBy !== undefined) {
                    fetchOptionState.sortBy = changed.sortBy;
                    fetchOptionState.sortDesc = !!changed.sortDesc;
                }
                if (changed.pageLimit !== undefined) {
                    fetchOptionState.pageLimit = changed.pageLimit;
                }
                if (changed.pageStart !== undefined) {
                    fetchOptionState.pageStart = changed.pageStart;
                }
                if (changed.searchText !== undefined) {
                    fetchOptionState.searchText = changed.searchText;
                    // sync updated query tags to url query string
                    queryHelper.setFilters([{ v: changed.searchText }]);
                    replaceUrlQuery('filters', queryHelper.rawQueryStrings);
                }
            }
            listServiceAccountData();
        };

        /** API for Excel export * */
        const exportApi = SpaceConnector.client.addOns.excel.export;
        const exportServiceAccountData = async () => {
            try {
                const res = await exportApi({
                    source: {
                        url: '/identity/service-account/list',
                        param: { query: getQuery() },
                    },
                    template: {
                        options: {
                            fileType: 'xlsx',
                            timezone: typeOptionState.timezone,
                        },
                        // eslint-disable-next-line camelcase
                        data_source: tableState.schema.options.fields,
                    },
                });
                window.open(config.get('VUE_APP_API.ENDPOINT') + res.file_link);
            } catch (e) {
                console.error(e);
            }
        };

        /** Field Handler for display formatting(project id -> project name)* */
        const fieldHandler: DynamicLayoutFieldHandler<Record<'reference', Reference>> = (field) => {
            if (field.extraData?.reference) {
                return referenceFieldFormatter(field.extraData.reference, field.data);
            }
            return {};
        };

        /** Add & Delete Service Accounts Action (Dropdown) * */
        const clickAddServiceAccount = () => {
            vm.$router.push({
                name: 'addServiceAccount',
                params: { provider: selectedProvider.value },
                query: { nextPath: vm.$route.fullPath },
            });
        };

        const doubleCheckModalState = reactive({
            visible: false,
            item: null,
            title: '' as TranslateResult,
            subTitle: '' as TranslateResult,
            verificationText: '',
            themeColor: '',
            api: null as any,
            params: null as any,
        });

        const deleteApi = SpaceConnector.client.identity.serviceAccount.delete;

        const clickDeleteServiceAccount = () => {
            const nameOfSelectedServiceAccount = tableState.selectedItems[0]?.name;
            doubleCheckModalState.visible = true;
            doubleCheckModalState.title = vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.CHECK_MODAL_DELETE_TITLE');
            doubleCheckModalState.subTitle = vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.CHECK_MODAL_DELETE_DESC', { account: nameOfSelectedServiceAccount });
            doubleCheckModalState.verificationText = nameOfSelectedServiceAccount;
            doubleCheckModalState.themeColor = 'alert';
            doubleCheckModalState.api = deleteApi;
        };

        const deleteServiceAccount = async () => {
            try {
                await doubleCheckModalState.api({
                    ...doubleCheckModalState,
                    // eslint-disable-next-line camelcase
                    service_account_id: tableState.selectedAccountIds[0],
                });
                showSuccessMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_S_DELETE_ACCOUNT'), '', vm.$root);
            } catch (e) {
                showErrorMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_E_DELETE_ACCOUNT'), e, vm.$root);
            } finally {
                doubleCheckModalState.visible = false;
                await listServiceAccountData();
            }
        };

        /** Change Project & Release Project Action */
        const changeProjectState = reactive({
            visible: false,
            loading: false,
            projectId: computed(() => {
                if (tableState.selectedItems.length > 1) return '';
                return get(tableState.selectedItems[0], 'project_info.project_id', '');
            }),
        });

        const clickProject = () => { changeProjectState.visible = true; };

        const releaseProject = async (action) => {
            try {
                await action({
                    // eslint-disable-next-line camelcase
                    service_accounts: tableState.selectedAccountIds,
                    // eslint-disable-next-line camelcase
                    release_project: true,
                });
                showSuccessMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_S_RELEASE_PROJECT'), '', vm.$root);
            } catch (e) {
                showErrorMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_E_RELEASE_PROJECT'), e, vm.$root);
            } finally {
                await listServiceAccountData();
            }
        };

        const changeProject = async (data?: ProjectItemResp|null) => {
            changeProjectState.loading = true;
            const action = SpaceConnector.client.identity.serviceAccount.changeProject;
            if (data) {
                try {
                    await action({
                        // eslint-disable-next-line camelcase
                        service_accounts: tableState.selectedAccountIds,
                        // eslint-disable-next-line camelcase
                        project_id: data.id,
                    });
                    showSuccessMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_S_CHANGE_PROJECT'), '', vm.$root);
                } catch (e) {
                    showErrorMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_E_CHANGE_PROJECT'), e, vm.$root);
                } finally {
                    await store.dispatch('resource/project/load');
                    await listServiceAccountData();
                }
            } else {
                await releaseProject(action);
            }
            changeProjectState.loading = false;
            changeProjectState.visible = false;
        };

        /** Tabs */
        const singleItemTabState = reactive({
            tabs: computed<TabItem[]>(() => [
                { name: 'details', label: vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_DETAILS') },
                { name: 'tag', label: vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_TAG') },
                { name: 'credentials', label: vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_CREDENTIALS') },
                { name: 'member', label: vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_MEMBER') },
            ]),
            activeTab: 'details',
        });

        const multiItemTabState = reactive({
            tabs: computed<TabItem[]>(() => [
                { name: 'data', label: vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.TAB_SELECTED_DATA') },
            ]),
            activeTab: 'data',
        });


        /** ******* Page Init ******* */
        const getTableSchema = async () => {
            const schema = await SpaceConnector.client.addOns.pageSchema.get({
                // eslint-disable-next-line camelcase
                resource_type: 'identity.ServiceAccount',
                schema: 'table',
                options: {
                    provider: selectedProvider.value,
                },
            });
            tableState.schema = schema;
        };

        const init = async () => {
            await Promise.all([
                store.dispatch('resource/project/load'),
                store.dispatch('resource/provider/load'),
                store.dispatch('resource/user/load'),
            ]);
            const providerFilter = Array.isArray(vm.$route.query.provider) ? vm.$route.query.provider[0] : vm.$route.query.provider;
            if (providerState.items.length > 0) {
                selectedProvider.value = providerFilter || providerState.items[0].provider;
                watch(selectedProvider, async (after, before) => {
                    if (after !== before) {
                        replaceUrlQuery('provider', after);
                        await getTableSchema();
                        await listServiceAccountData();
                    }
                }, { immediate: true });
            }
        };
        init();
        /** ************************* */

        return {
            selectedProvider,
            providerState,
            selectedProviderName,
            ...toRefs(routeState),

            tableState,
            fetchOptionState,
            typeOptionState,
            onSelect,
            exportServiceAccountData,
            listServiceAccountData,
            fetchTableData,
            fieldHandler,

            changeProjectState,
            clickProject,
            clickAddServiceAccount,

            doubleCheckModalState,
            deleteServiceAccount,
            clickDeleteServiceAccount,
            changeProject,

            singleItemTabState,
            multiItemTabState,
        };
    },
};
</script>
<style lang="postcss" scoped>
.sidebar-title {
    @apply text-gray-500 text-sm font-bold;
    padding-top: 2rem;
    padding-left: 1rem;
}
.sidebar-divider {
    @apply w-full;
    padding-left: 0;
    margin-top: 0.5625rem;
    margin-bottom: 1rem;
}
.provider-list {
    @apply justify-between text-sm;
    padding-left: 1rem;
    padding-right: 1.1875rem;
    line-height: 1.5rem;
    .provider-divider {
        @apply bg-gray-100;
        margin-top: 0.625rem;
        margin-bottom: 0.5625rem;
    }
    .provider-name {
        display: inline-block;
        cursor: pointer;
    }
    .provider-icon {
        @apply inline justify-start;
        width: 1.5rem;
        height: 1.5rem;
        cursor: pointer;
        margin-right: 0.5625rem;
    }
    .provider-radio-btn {
        @apply float-right;
    }
}
.selected-data-tab {
    @apply mt-8;
}
>>> .p-dynamic-layout-table .p-search-table {
    border-width: 1px;
}
</style>
