<template>
    <p-vertical-page-layout>
        <template #sidebar="{width}">
            <div class="relative h-full">
                <p class="sidebar-title">
                    {{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.PROVIDERS_TITLE') }}
                </p>
                <p-divider class="sidebar-divider" />
                <p-radio v-for="provider in providerState.items"
                         :key="provider.provider"
                         v-model="selectedProvider"
                         :value="provider.provider"
                         class="provider-wrapper"
                >
                    <template #radio-left>
                        <p-lazy-img :src="provider.icon || ''"
                                    error-icon="ic_provider_other"
                                    :alt="provider.provider"
                                    width="1.5rem" height="1.5rem"
                        />
                        <span class="provider-name">{{ provider.label }}</span>
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
                <p-breadcrumbs :routes="route" />
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
                                      @click-settings="onClickSettings"
                    >
                        <template #toolbox-left>
                            <p-icon-text-button style-type="primary-dark"
                                                name="ic_plus_bold"
                                                class="mr-4"
                                                @click="clickAddServiceAccount"
                            >
                                {{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.ADD') }}
                            </p-icon-text-button>
                            <p-select-dropdown class="left-toolbox-item"
                                               :items="tableState.dropdown"
                                               @select="onSelectDropdown"
                            >
                                {{ $t('IDENTITY.SERVICE_ACCOUNT.MAIN.ACTION') }}
                            </p-select-dropdown>
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
                                  size="sm"
                                  @confirm="deleteServiceAccount"
            />
            <project-tree-modal :visible.sync="changeProjectState.visible"
                                :project-id="changeProjectState.projectId"
                                :loading="changeProjectState.loading"
                                @confirm="changeProject"
            />
            <custom-field-modal v-model="tableState.visibleCustomFieldModal"
                                resource-type="identity.ServiceAccount"
                                :options="{provider: selectedProvider}"
                                @complete="reloadTable"
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
import { TranslateResult } from 'vue-i18n';

/* spaceone design system */
import {
    PRadio, PI, PDivider, PBreadcrumbs, PPageTitle, PHorizontalLayout, PIconTextButton,
    PTab, PDynamicLayout, PEmpty, PDoubleCheckModal, PLazyImg, PSelectDropdown,
} from '@spaceone/design-system';
import {
    DynamicLayoutEventListener,
    DynamicLayoutFieldHandler,
} from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import { DynamicLayout } from '@spaceone/design-system/dist/src/data-display/dynamic/dynamic-layout/type/layout-schema';

/* components */
import PVerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';
import TagsPanel from '@/common/modules/tags/tags-panel/TagsPanel.vue';
import ProjectTreeModal from '@/common/modules/project/ProjectTreeModal.vue';

/* page modules */
import ServiceAccountDetails from '@/services/identity/service-account/modules/ServiceAccountDetails.vue';
import ServiceAccountCredentials from '@/services/identity/service-account/modules/ServiceAccountCredentials.vue';
import ServiceAccountMember from '@/services/identity/service-account/modules/ServiceAccountMember.vue';
import CustomFieldModal from '@/common/modules/custom-table/custom-field-modal/CustomFieldModal.vue';

/* utils */
import { replaceUrlQuery } from '@/lib/router-query-string';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { assetUrlConverter } from '@/lib/helper/asset-helper';
import {
    showErrorMessage, showSuccessMessage, showLoadingMessage,
} from '@/lib/helper/notice-alert-helper';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { dynamicFieldsToExcelDataFields } from '@/lib/component-util/dynamic-layout';
import { referenceFieldFormatter } from '@/lib/reference/referenceFieldFormatter';
import { store } from '@/store';
import { IDENTITY_ROUTE } from '@/services/identity/routes';

/* types */
import { Reference } from '@/lib/reference/type';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';


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
        CustomFieldModal,
        ProjectTreeModal,
        PDoubleCheckModal,
        PSelectDropdown,
        PIconTextButton,
        ServiceAccountDetails,
        PEmpty,
        ServiceAccountMember,
        ServiceAccountCredentials,
        TagsPanel,
        PDynamicLayout,
        PHorizontalLayout,
        PPageTitle,
        PBreadcrumbs,
        PDivider,
        PI,
        PRadio,
        PVerticalPageLayout,
        PTab,
        PLazyImg,
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper().setFiltersAsRawQueryString(vm.$route.query.filters);

        /** Provider(located at sidebar) & Page Title * */
        const selectedProvider: Ref<string> = ref('aws');
        const providerState = reactive({
            items: computed(() => Object.keys(store.state.resource.provider.items).map(k => ({
                ...store.state.resource.provider.items[k],
                provider: k,
                icon: assetUrlConverter(store.state.resource.provider.items[k].icon),
            }))),
        });
        const selectedProviderName = computed(() => store.state.resource.provider.items[selectedProvider.value]?.label || selectedProvider.value);

        /** Page Navigation * */
        const routeState = reactive({
            route: computed(() => ([
                { name: vm.$t('MENU.IDENTITY.IDENTITY'), path: '/identity' },
                { name: vm.$t('MENU.IDENTITY.SERVICE_ACCOUNT') },
            ])),
        });

        /** States for Dynamic Layout(search table type) * */
        const fetchOptionState = reactive({
            pageStart: 1,
            pageLimit: 15,
            sortDesc: true,
            sortBy: 'created_at',
            searchText: queryHelper.apiQuery.keyword,
        });

        const typeOptionState = reactive({
            loading: true,
            totalCount: 0,
            timezone: computed(() => store.state.user.timezone || 'UTC'),
            selectIndex: [] as number[],
            selectable: true,
            colCopy: false,
            settingsVisible: true,
        });

        const tableState = reactive({
            items: [],
            selectedItems: computed(() => typeOptionState.selectIndex.map(d => tableState.items[d])),
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
                    name: 'link', label: vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.CONSOLE'), type: 'item', disabled: !tableState.consoleLink, link: tableState.consoleLink, target: '_blank',
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
            visibleCustomFieldModal: false,
        });

        const getLinkTemplate = (data) => {
            let link = '';
            const providerInfo = providerState.items.map(d => ({
                provider: d.provider,
                template: d.linkTemplate,
            }));
            const linkTemplate = providerInfo.find(item => item.provider === selectedProvider.value)?.template;
            if (linkTemplate !== undefined) link = render(linkTemplate, data);
            return link;
        };

        const getConsoleLink = () => {
            if (tableState.selectedItems.length === 1) {
                tableState.consoleLink = getLinkTemplate(tableState.selectedItems[0]);
            } else {
                tableState.consoleLink = '';
            }
        };

        const onSelect: DynamicLayoutEventListener['select'] = (selectIndex) => {
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

            const fields = tableState.schema?.options?.fields;
            if (fields) {
                apiQuery.setOnly(...fields.map(d => d.key).filter(d => !d.startsWith('tags.')), 'service_account_id', 'tags');
            }
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
        const fetchTableData: DynamicLayoutEventListener['fetch'] = (changed) => {
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
            listServiceAccountData();
        };

        /** API for Excel export * */
        const exportServiceAccountData = async () => {
            try {
                showLoadingMessage(vm.$t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '', vm.$root);
                await store.dispatch('file/downloadExcel', {
                    url: '/identity/service-account/list',
                    param: { query: getQuery() },
                    fields: dynamicFieldsToExcelDataFields(tableState.schema.options.fields),
                    file_name_prefix: FILE_NAME_PREFIX.serviceAccount,
                });
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
                name: IDENTITY_ROUTE.SERVICE_ACCOUNT.ADD._NAME,
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
                showErrorMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_E_DELETE_ACCOUNT'), e);
            } finally {
                doubleCheckModalState.visible = false;
                await listServiceAccountData();
            }
        };

        const onClickSettings = () => {
            tableState.visibleCustomFieldModal = true;
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
                showErrorMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_E_RELEASE_PROJECT'), e);
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
                    showErrorMessage(vm.$t('IDENTITY.SERVICE_ACCOUNT.MAIN.ALT_E_CHANGE_PROJECT'), e);
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

        const onSelectDropdown = (name) => {
            switch (name) {
            case 'delete': clickDeleteServiceAccount(); break;
            case 'project': clickProject(); break;
            default: break;
            }
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
            try {
                const schema = await SpaceConnector.client.addOns.pageSchema.get({
                    // eslint-disable-next-line camelcase
                    resource_type: 'identity.ServiceAccount',
                    schema: 'table',
                    options: {
                        provider: selectedProvider.value,
                    },
                });
                tableState.schema = schema;
            } catch (e) {
                tableState.schema = null;
            }
        };

        const reloadTable = async () => {
            await getTableSchema();
            await listServiceAccountData();
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
                        typeOptionState.selectIndex = [];
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
            reloadTable,
            onClickSettings,
            onSelectDropdown,

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
    @apply text-gray-900 text-sm font-bold;
    padding-top: 2rem;
    padding-left: 1rem;
}
.sidebar-divider {
    @apply w-full;
    padding-left: 0;
    margin-top: 0.5625rem;
    margin-bottom: 1rem;
}
.provider-wrapper {
    @apply border-b border-gray-100;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 0.5rem 0.5rem 0.5rem 0.25rem;
    margin: 0 0.75rem;
    &:first-of-type {
        margin-top: -0.69rem;
    }
    &:last-of-type {
        @apply border-b-0;
    }
    .provider-name {
        display: inline-block;
        margin-left: 0.5rem;
        flex-grow: 1;
        font-size: 0.875rem;
        line-height: 1.5;
    }
}
.selected-data-tab {
    @apply mt-8;
}
.empty-space {
    @apply text-primary2 mt-6;
    text-align: center;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
}
>>> .p-dynamic-layout-table .p-toolbox-table {
    @apply border border-gray-200 rounded-lg;
    .p-data-table {
        min-height: unset;
    }
}
</style>
