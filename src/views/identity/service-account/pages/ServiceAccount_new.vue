<template>
    <p-vertical-page-layout :min-width="270" :init-width="270" :max-width="400">
        <template #sidebar="{width}">
            <p class="sidebar-title">
                Service Providers
            </p>
            <p-hr class="sidebar-divider" />
            <div v-for="provider in providerState.items" :key="provider.provider" class="provider-list">
                <p-hr v-if="provider.provider && provider.provider !== 'aws'" class="provider-divider" />
                <img v-if="provider.icon"
                     :src="provider.icon"
                     :alt="provider.provider"
                     class="provider-icon"
                >
                <p-i v-else name="ic_provider_other"
                     class="provider-icon"
                />
                <span class="provider-name">{{ provider.label }}</span>
                <p-radio v-model="selectedProvider" :value="provider.provider" class="provider-radio-btn" />
            </div>
        </template>
        <template #default>
            <div class="page-navigation">
                <p-page-navigation :routes="route" />
            </div>
            <p-page-title :title="`${selectedProviderName} Accounts`"
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
                                {{ $t('BTN.ADD') }}
                            </p-icon-text-button>
                            <p-dropdown-menu-btn
                                class="left-toolbox-item mr-4"
                                :menu="tableState.dropdown"
                                @click-delete="clickDeleteServiceAccount"
                                @click-project="clickProject"
                            >
                                {{ $t('BTN.ACTION') }}
                            </p-dropdown-menu-btn>
                        </template>
                    </p-dynamic-layout>
                </template>
            </p-horizontal-layout>
            <p-tab v-if="tableState.selectedItems.length === 1"
                   :tabs="singleItemTabState.tabs"
                   :active-tab.sync="singleItemTabState.activeTab"
            >
                <template #detail>
                    <service-account-detail :selected-provider="selectedProvider"
                                            :service-account-id="tableState.selectedAccountIds[0]"
                    />
                </template>
                <template #tag>
                    <s-tags-panel :resource-id="tableState.selectedAccountIds[0]"
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
                    <p-data-table
                        :fields="tableState.multiFields"
                        :sortable="false"
                        :selectable="false"
                        :items="tableState.selectedItems"
                        :col-copy="true"
                    >
                        <template />
                    </p-data-table>
                </template>
            </p-tab>
            <div v-else class="empty-space">
                <p-empty>Select a Service Account above for details.</p-empty>
            </div>
            <p-double-check-modal
                :visible.sync="doubleCheckModalState.visible"
                :header-title="doubleCheckModalState.title"
                :sub-title="doubleCheckModalState.subTitle"
                :verification-text="doubleCheckModalState.verificationText"
                :theme-color="doubleCheckModalState.themeColor"
                :centered="true"
                @confirm="deleteServiceAccount"
            />
            <s-project-tree-modal :visible.sync="changeProjectState.visible"
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

/* components */
import PVerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import STagsPanel from '@/views/common/tags/tag-panel/TagsPanel.vue';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import PDoubleCheckModal from '@/components/organisms/modals/double-check-modal/PDoubleCheckModal.vue';
import SProjectTreeModal from '@/views/common/tree-api-modal/ProjectTreeModal.vue';

/* page modules */
import ServiceAccountDetail from '@/views/identity/service-account/modules/ServiceAccountDetail.vue';
import ServiceAccountCredentials from '@/views/identity/service-account/modules/ServiceAccountCredentials.vue';
import ServiceAccountMember from '@/views/identity/service-account/modules/ServiceAccountMember.vue';

/* utils */
import { replaceQuery } from '@/lib/router-query-string';
import { makeTrItems } from '@/lib/view-helper';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
import config from '@/lib/config';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';

/* types */
import {
    TableEventListeners,
    TableFetchOptions,
    TableTypeOptions,
} from '@/components/organisms/dynamic-layout/templates/table/type';
import { DynamicLayoutFieldHandler } from '@/components/organisms/dynamic-layout/type';
import { Reference } from '@/lib/reference/type';
import { store } from '@/store';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';

interface ProjectItemResp {
    id: string;
    name: string;
    // eslint-disable-next-line camelcase
    has_child: boolean;
    item_type: 'PROJECT_GROUP'|'PROJECT';
}

export default {
    name: 'ServiceAccount',
    components: {
        SProjectTreeModal,
        PDoubleCheckModal,
        PDropdownMenuBtn,
        PIconTextButton,
        ServiceAccountDetail,
        PEmpty,
        ServiceAccountMember,
        ServiceAccountCredentials,
        STagsPanel,
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
            route: [{ name: 'Identity', path: '/identity' }, { name: 'Service Accounts', path: '/identity/service-account' }],
        });

        /** States for Dynamic Layout(search table type) * */
        const fetchOptionState: TableFetchOptions = reactive({
            pageStart: 1,
            pageLimit: 15,
            sortDesc: true,
            sortBy: 'created_at',
            searchText: vm.$route.query.filters?.toString(),
        });

        const typeOptionState: TableTypeOptions = reactive({
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
            dropdown: computed(() => makeTrItems([
                ['delete', 'BTN.DELETE', { type: 'item', disabled: tableState.selectedItems.length !== 1 }],
                [null, null, { type: 'divider' }],
                ['project', 'COMMON.CHG_PRO'],
                [null, null, { type: 'divider' }],
                ['link', null, {
                    label: 'Console',
                    disabled: !tableState.consoleLink,
                    link: tableState.consoleLink,
                    target: 'blank',
                }],
            ],
            context.parent,
            { type: 'item', disabled: tableState.selectedItems.length === 0 })),
            multiFields: computed(() => makeTrItems([
                ['name', 'COMMON.NAME'],
            ],
            context.parent)),
            selectedAccountIds: computed(() => tableState.selectedItems.map(d => d.service_account_id)),
            schema: [],
        });

        const getLinkTemplate = (data) => {
            let linkTemplate: string | undefined;
            let link: string;
            switch (selectedProvider.value) {
            case 'aws':
                linkTemplate = providerState.items[0].linkTemplate;
                link = render(linkTemplate as string, data);
                break;
            // case 'google_cloud':
            //     linkTemplate = providerState.items[1].linkTemplate;
            //     tableState.consoleLink = render(linkTemplate, data);
            //     break;
            default:
                link = '';
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

        const getQuery = () => {
            const query = new QueryHelper();
            query.setSort(fetchOptionState.sortBy, fetchOptionState.sortDesc)
                .setPage(fetchOptionState.pageStart, fetchOptionState.pageLimit)
                .setFilter({ k: 'provider', v: [selectedProvider.value], o: 'in' })
                .setKeyword(fetchOptionState.searchText);
            return query.data;
        };

        const serviceAccountListApi = SpaceConnector.client.identity.serviceAccount.list;
        const listServiceAccountData = async () => {
            typeOptionState.loading = true;
            try {
                const res = await serviceAccountListApi({ query: getQuery() });
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
                    replaceQuery('filters', changed.searchText);
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
            title: '',
            subTitle: '',
            verificationText: '',
            themeColor: '',
            api: null as any,
            params: null as any,
        });

        const deleteApi = SpaceConnector.client.identity.serviceAccount.delete;

        const clickDeleteServiceAccount = () => {
            const selectedIndex = computed(() => typeOptionState.selectIndex).value as unknown as number;
            const nameOfSelectedServiceAccount = tableState.items[selectedIndex].name;
            doubleCheckModalState.visible = true;
            doubleCheckModalState.title = 'Delete Account';
            doubleCheckModalState.subTitle = `You will Permanently lose your [${nameOfSelectedServiceAccount}]`;
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
                showSuccessMessage('Success', 'Success to Delete Account', context.root);
            } catch (e) {
                showErrorMessage('Delete Failed', e, context.root);
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
                return get(tableState.selectedItems[0], 'project_id', '');
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
                showSuccessMessage('Success', 'Success to Release Project', context.root);
            } catch (e) {
                showErrorMessage('Fail to Release Project', e, context.root);
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
                    showSuccessMessage('Success', 'Project has been successfully changed.', context.root);
                } catch (e) {
                    showErrorMessage('Fail to Change Project', e, context.root);
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
            tabs: computed(() => makeTrItems([
                ['detail', 'TAB.DETAILS'],
                ['tag', 'TAB.TAG'],
                ['credentials', 'TAB.CREDENTIALS'],
                ['member', 'TAB.MEMBER'],
            ],
            context.parent)),
            activeTab: 'detail',
        });

        const multiItemTabState = reactive({
            tabs: makeTrItems([
                ['data', 'TAB.DATA'],
            ], context.parent),
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
            await Promise.all([store.dispatch('resource/project/load'), store.dispatch('resource/provider/load')]);
            const providerFilter = Array.isArray(vm.$route.query.provider) ? vm.$route.query.provider[0] : vm.$route.query.provider;
            if (providerState.items.length > 0) {
                selectedProvider.value = providerFilter || providerState.items[0].provider;
                watch(selectedProvider, async (after, before) => {
                    if (after !== before) {
                        replaceQuery('provider', after);
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
        }
        .provider-icon {
            @apply inline justify-start;
            width: 1.5rem;
            height: 1.5rem;
            margin-right: 0.5625rem;
        }
        .provider-radio-btn {
            @apply float-right;
        }
    }
    >>> .p-dynamic-layout-table .p-search-table {
        border-width: 1px;
    }
</style>
