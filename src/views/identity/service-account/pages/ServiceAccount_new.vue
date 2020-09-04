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
                <span class="provider-name">{{ provider.name }}</span>
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
                    <p-dynamic-layout type="table"
                                      :options="tableState.schema.options"
                                      :data="tableState.items"
                                      :fetch-options="fetchOptionState"
                                      :type-options="extraOptionState"
                                      :style="{height: `${height}px`}"
                                      :field-handler="fieldHandler"
                                      @init="fetchTableData"
                                      @fetch="fetchTableData"
                                      @select="onSelect"
                                      @export="exportServiceAccountData"
                    />
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
            <p-tab v-else-if="extraOptionState.selectIndex.length > 1"
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
        </template>
    </p-vertical-page-layout>
</template>
<script lang="ts">
import PVerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import { ProviderStoreType, useStore } from '@/store/toolset';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, ref, Ref, toRefs, watch,
} from '@vue/composition-api';
import PRadio from '@/components/molecules/forms/radio/PRadio.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PHr from '@/components/atoms/hr/PHr.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import {
    makeQueryStringComputed, replaceQuery,
} from '@/lib/router-query-string';
import { get } from 'lodash';
import { makeTrItems } from '@/lib/view-helper';
import { QueryHelper, SpaceConnector } from '@/lib/space-connector';
// import tableSchema from '@/views/inventory/server/default-schema/base-table.json';
import config from '@/lib/config';
import { DynamicFieldHandler } from '@/components/organisms/dynamic-field/type';
import { referenceRouter } from '@/lib/reference/referenceRouter';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';
import { fluentApi } from '@/lib/fluent-api';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import PDataTable from '@/components/organisms/tables/data-table/PDataTable.vue';
import PDynamicLayout from '@/components/organisms/dynamic-layout/PDynamicLayout.vue';
import STagsPanel from '@/views/common/tags/tag-panel/TagsPanel.vue';
import ServiceAccountCredentials from '@/views/identity/service-account/modules/ServiceAccountCredentials.vue';
import ServiceAccountMember from '@/views/identity/service-account/modules/ServiceAccountMember.vue';
import {
    TableEventListeners,
    TableFetchOptions,
    TableTypeOptions,
} from '@/components/organisms/dynamic-layout/templates/table/type';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import ServiceAccountDetail from '@/views/identity/service-account/modules/ServiceAccountDetail.vue';

export default {
    name: 'ServiceAccount',
    components: {
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
        const {
            provider, project, secret, user,
        } = useStore();
        const providerStore: ProviderStoreType = provider;
        // providerStore.getProvider();
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const selectedProvider: Ref<string> = ref('aws');

        const providerState = reactive({
            items: computed(() => {
                const result = [] as any;
                if (providerStore.state.providers) {
                    result.push(...Object.entries(providerStore.state.providers).map(([key, value]) => ({ provider: key, ...value })));
                }
                return result;
            }),
        });
        const selectedProviderName = computed(() => {
            let name = '';
            providerState.items.forEach((d) => {
                if (d.provider === selectedProvider.value) {
                    name = d.name;
                }
            });
            return name;
        });
        const routeState = reactive({
            route: [{ name: 'Identity', path: '/identity' }, { name: 'Service Accounts', path: '/identity/service-account' }],
        });
        const fetchOptionState: TableFetchOptions = reactive({
            pageStart: 1,
            pageLimit: 15,
            sortDesc: true,
            sortBy: 'created_at',
            searchText: '',
        });

        const extraOptionState: TableTypeOptions = reactive({
            loading: true,
            totalCount: 0,
            timezone: computed(() => user.state.timezone || 'UTC'),
            selectIndex: [],
            selectable: true,
        });

        const tableState = reactive({
            items: [],
            selectedItems: computed(() => extraOptionState.selectIndex.map(d => tableState.items[d])),
            providers: computed(() => provider.state.providers || {}),
            consoleLink: computed(() => {
                const res = get(tableState.selectedItems[0], 'data.reference.link')
                    || get(tableState.selectedItems[0], 'reference.external_link');
                return res;
            }),
            dropdown: computed(() => makeTrItems([
                ['delete', 'BTN.DELETE'],
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

        const onSelect: TableEventListeners['select'] = (selectIndex) => {
            extraOptionState.selectIndex = selectIndex;
        };

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
            extraOptionState.loading = true;
            try {
                const res = await serviceAccountListApi({ query: getQuery() });
                tableState.items = res.results;
                extraOptionState.totalCount = res.total_count;
            } catch (e) {
                console.error(e);
                tableState.items = [];
                extraOptionState.totalCount = 0;
            } finally {
                extraOptionState.loading = false;
            }
        };

        const fetchTableData: TableEventListeners['fetch'] = (options, changed?) => {
            if (changed) {
                if (changed.sortBy && changed.sortDesc) {
                    fetchOptionState.sortBy = changed.sortBy;
                    fetchOptionState.sortDesc = changed.sortDesc;
                }
                if (changed.pageLimit) {
                    fetchOptionState.pageLimit = changed.pageLimit;
                }
                if (changed.pageStart) {
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
                            timezone: extraOptionState.timezone,
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
            const schema = await SpaceConnector.client.addOns.pageSchema.get({
                resource_type: 'identity.ServiceAccount',
                schema: 'table',
                options: {
                    provider: selectedProvider.value,
                },
            });
            tableState.schema = schema;
        };

        const fieldHandler: DynamicFieldHandler = (item) => {
            if (item.extraData?.reference) {
                switch (item.extraData.reference.resource_type) {
                case 'identity.Project': {
                    item.data = project.state.projects[item.data];
                    item.options.link = referenceRouter(
                        item.extraData.reference.resource_type,
                        item.data,
                    );
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
            // TODO: SpaceConnector로 변경하기
            const changeAction = fluentApi.identity().serviceAccount().changeProject().clone()
                .setSubIds(tableState.selectedAccountIds);
            if (data) {
                try {
                    await changeAction.setId(data.id).execute();
                    showSuccessMessage('Success', 'Project has been successfully changed.', context.root);
                } catch (e) {
                    showErrorMessage('Fail to Change Project', e, context.root);
                } finally {
                    await project.getProject(true);
                    await listServiceAccountData();
                }
            } else {
                try {
                    await changeAction.setReleaseProject().execute();
                    showSuccessMessage('Success', 'Success to Release Project', context.root);
                } catch (e) {
                    showErrorMessage('Fail to Release Project', e, context.root);
                } finally {
                    await listServiceAccountData();
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

        /** Query String */
        const queryRefs = {
            provider: makeQueryStringComputed(selectedProvider, { key: 'provider' }),
        };

        /** ******* Page Init ******* */
        project.getProject(true);
        provider.getProvider(true);
        secret.getSecrets(true);

        const init = async () => {
            const providerFilter = queryRefs.provider.value;
            if (providerState.items.length > 0) {
                selectedProvider.value = providerFilter || providerState.items[0].provider;
                watch(selectedProvider, async (after, before) => {
                    if (after !== before) {
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

            // tableSchema,
            tableState,
            fetchOptionState,
            extraOptionState,
            onSelect,
            exportServiceAccountData,
            listServiceAccountData,
            fetchTableData,
            fieldHandler,

            changeProjectState,
            clickProject,
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
</style>
