<template>
    <p-vertical-page-layout :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <p-grid-layout
                class="provider-list"
                v-bind="providerListState.state"
                @card:click="selectProvider=$event.provider"
            >
                <template #card="{item}">
                    <div class="left">
                        <template>
                            <img v-if="item.tags&&item.tags.icon"
                                 width="32px" height="32px"
                                 :src="item.tags.icon"
                                 :alt="item.provider"
                            >
                            <p-i v-else name="ic_provider_other"
                                 width="32px"
                                 height="32px"
                            />
                        </template>
                        <div class="title">
                            {{ item.name }}
                        </div>
                    </div>
                    <div class="right">
                        <div
                            class="total-count"
                            :style="{'background-color': item.tags.color||'#3C2C84','border-color': item.tags.color||'#3C2C84'}"
                        >
                            {{ providerTotalCount[item.provider] }}
                        </div>
                    </div>
                </template>
            </p-grid-layout>
        </template>
        <template #default>
            <template v-if="!!selectProvider">
                <div class="w-full h-full">
                    <p-horizontal-layout>
                        <template #container="scope">
                            <div class="page-navigation">
                                <p-page-navigation :routes="route" />
                            </div>
                            <p-page-title
                                :use-selected-count="true" :use-total-count="true" :title="`${selectProviderItem ? selectProviderItem.name : ''} Account`"
                                :total-count="apiHandler.totalCount"
                                :selected-count="apiHandler.tableTS.selectState.selectItems.length"
                            />
                            <s-dynamic-layout type="table"
                                              :toolset="apiHandler"
                                              :options="{fields: accountFields}"
                                              :style="{
                                                  height: scope ? `${scope.height}px` : 'auto',
                                                  'overflow-y':'auto','overflow-x':'auto'
                                              }"
                                              :vbind="{
                                                  showTitle: false,
                                                  isShowGetData: false,
                                                  resourceType: 'identity.ServiceAccount'
                                              }"
                                              @search="onSearch"
                            >
                                <template #toolbox-left>
                                    <p-icon-text-button style-type="primary-dark"
                                                        name="ic_plus_bold"
                                                        @click="addServiceAccount"
                                    >
                                        {{ $t('BTN.ADD') }}
                                    </p-icon-text-button>

                                    <p-dropdown-menu-btn
                                        class="left-toolbox-item"
                                        :menu="dropdown"
                                        @click-delete="accountDeleteClick"
                                        @click-project="clickProject"
                                        @click-link="clickLink"
                                    >
                                        Action
                                    </p-dropdown-menu-btn>
                                </template>
                            </s-dynamic-layout>
                        </template>
                    </p-horizontal-layout>
                    <p-tab v-if="apiHandler.tableTS.selectState.isSelectOne" :tabs="singleItemTab.state.tabs" :active-tab.sync="singleItemTab.syncState.activeTab">
                        <template #detail>
                            <s-dynamic-layout
                                class="mb-8"
                                v-bind="saLayout"
                                :data="apiHandler.tableTS.selectState.firstSelectItem"
                            />
                        </template>
                        <template #tag>
                            <s-tags-panel :resource-id="apiHandler.tableTS.selectState.firstSelectItem.service_account_id"
                                          resource-type="identity.ServiceAccount"
                                          resource-key="service_account_id"
                            />
                        </template>
                        <template #credentials>
                            <s-dynamic-layout
                                type="table"
                                :name="$t('TAB.CREDENTIALS')"
                                :toolset="secretApiHandler"
                                :options="{fields: secretDataSource}"
                            />
                        </template>
                        <template #member>
                            <s-dynamic-layout :api="adminApi"
                                              :is-show="adminIsShow" :name="$t('TAB.MEMBER')"
                                              v-bind="defaultAdminLayout"
                            />
                        </template>
                    </p-tab>
                    <p-tab v-else-if="apiHandler.tableTS.selectState.isSelectMulti"
                           :tabs="multiItemTab.state.tabs"
                           :active-tab.sync="multiItemTab.syncState.activeTab"
                    >
                        <template #data>
                            <s-dynamic-layout
                                type="simple-table"
                                :options="{fields:accountFields}"
                                :data="apiHandler.tableTS.selectState.selectItems"
                                :vbind="{showTitle:false}"
                            />
                        </template>
                        <template #member>
                            <s-dynamic-layout :api="adminApi"
                                              :is-show="adminIsShow" :name="$t('TAB.MEMBER')"
                                              v-bind="defaultAdminLayout"
                            />
                        </template>
                    </p-tab>
                    <p-empty v-else style="height: auto; margin-top: 4rem;">
                        No Selected Item
                    </p-empty>
                </div>
            </template>
            <p-empty v-else class="header">
                No Selected Provider
            </p-empty>

            <p-double-check-modal
                v-bind="deleteTS.state"
                :visible.sync="deleteTS.syncState.visible"
                @confirm="deleteConfirm"
            />
            <s-project-tree-modal :visible.sync="changeProjectState.visible"
                                  :project-id="changeProjectState.projectId"
                                  :loading="changeProjectState.loading"
                                  @confirm="changeProject"
            />
            <s-secret-create-form-modal v-if="secretFormVisible" :visible.sync="secretFormVisible" :schema-names="secretSchemas"
                                        @confirm="secretFormConfirm($event)"
            />
        </template>
    </p-vertical-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/PHorizontalLayout.vue';
import SDynamicLayout from '@/views/common/dynamic-layout/SDynamicLayout.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PI from '@/components/atoms/icons/PI.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import { makeTrItems } from '@/lib/view-helper/index';
import PEmpty from '@/components/atoms/empty/PEmpty.vue';
import SProjectTreeModal from '@/views/common/tree-api-modal/ProjectTreeModal.vue';
import { DataSourceItem, fluentApi } from '@/lib/fluent-api';
import {
    SearchTableFluentAPI, TabSearchTableFluentAPI,
    defaultAdminLayout,
} from '@/lib/api/table';
import {
    makeQueryStringComputed,
    makeQueryStringComputeds,
    queryStringToNumberArray,
    selectIndexAutoReplacer,
} from '@/lib/router-query-string';
import {
    GridLayoutState,
} from '@/components/molecules/layouts/grid-layout/PGridLayout.toolset';
import {
    TabBarState,
} from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';
import { ProviderModel } from '@/lib/fluent-api/identity/provider';
import { DoubleCheckModalState } from '@/components/organisms/modals/double-check-modal/PDoubleCheckModal.toolset';
import PDoubleCheckModal from '@/components/organisms/modals/double-check-modal/PDoubleCheckModal.vue';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';
import { idField as serviceAccountID, ServiceAccountListResp } from '@/lib/fluent-api/identity/service-account';
import { AxiosResponse } from 'axios';
import { createAtVF } from '@/lib/data-source';
import SSecretCreateFormModal from '@/views/identity/service-account/modules/SecretCreateFormModal.vue';
import nunjucks from 'nunjucks';
import {
    get, zipObject,
} from 'lodash';

import PGridLayout from '@/components/molecules/layouts/grid-layout/PGridLayout.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import STagsPanel from '@/views/common/tags/tag-panel/TagsPanel.vue';
import { DynamicLayoutApiProp } from '@/views/common/dynamic-layout/toolset';
import { showErrorMessage } from '@/lib/util';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import { useStore } from '@/store/toolset';

export default {
    name: 'ServiceAccount',
    components: {
        PI,
        PVerticalPageLayout,
        PHorizontalLayout,
        PTab,
        PDropdownMenuBtn,
        PEmpty,
        SProjectTreeModal,
        PDoubleCheckModal,
        SSecretCreateFormModal,
        PIconTextButton,
        PGridLayout,
        PPageTitle,
        STagsPanel,
        SDynamicLayout,
        PPageNavigation,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const projectState = reactive({
            project: {},
        });
        const { project } = useStore();

        const resourceCountAPI = fluentApi.identity().serviceAccount().list().setCountOnly();
        const providerListAPI = fluentApi.identity().provider().list().setOnly(
            'name',
            'provider',
            'tags.icon',
            'tags.color',
            'tags.external_link_template',
            'template.service_account.schema',
            'capability.supported_schema',
        );

        const selectProvider = ref<string>('');
        const providers = ref<{[key in string]: ProviderModel}>({});
        const selectProviderItem = computed<ProviderModel|null>(() => (selectProvider.value ? providers.value[selectProvider.value] : null));
        const providerTotalCount = ref({});

        const routeState = reactive({
            route: [{ name: 'Identity', path: '/identity' }, { name: 'Service Account', path: '/identity/service-account' }],
        });

        const providerListState = new GridLayoutState(
            {
                items: computed(() => Object.values(providers.value)),
                cardClass: (item) => {
                    const _class = ['provider-card-item', 'card-item'];
                    if (item.provider === selectProvider.value) {
                        _class.push('selected');
                    }
                    return _class;
                },
                cardMinWidth: '14.125rem',
                cardHeight: '3.5rem',
                columnGap: '0.5rem',
                rowGap: '0.5rem',
                fixColumn: 1,
            },
        );

        const originDataSource = computed<any[]>(() => {
            if (selectProviderItem.value) {
                const properties = selectProviderItem.value.template.service_account.schema.properties || {};
                if (selectProviderItem) {
                    return [
                        { name: 'ID', key: 'service_account_id' },
                        { name: 'Name', key: 'name' },
                        ...Object.entries(properties).map(([key, item]) => ({
                            key: `data.${key}`,
                            name: item.title,
                            view_type: 'text',
                        })),
                    ];
                }
            }
            return [] as DataSourceItem[];
        });

        const accountFields = computed<any[]>(() => [
            ...originDataSource.value,
            {
                name: 'Project', key: 'console_force_data.project', type: 'text', option: {},
            },
            createAtVF,
        ]);

        const ListAction = fluentApi.identity().serviceAccount().list()
            .setTransformer((resp: AxiosResponse<ServiceAccountListResp>) => {
                const result = resp;
                result.data.results = resp.data.results.map((item) => {
                    item.console_force_data = { project: item.project_info ? projectState.project[item.project_info.project_id] : '' };
                    // item.console_force_data = { project: projectFormatter(item.project_info.project_id) };
                    return item;
                });
                return result;
            });


        const apiHandler = new SearchTableFluentAPI(ListAction, {
            shadow: true,
            border: true,
            selectable: true,
            excelVisible: true,
        },
        undefined);

        const singleItemTab = new TabBarState(
            {
                tabs: makeTrItems([
                    ['detail', 'TAB.DETAILS'],
                    ['tag', 'TAB.TAG'],
                    ['credentials', 'TAB.CREDENTIALS'],
                    ['member', 'TAB.MEMBER'],
                ]),
            },
            {
                activeTab: 'detail',
            },
        );

        const multiItemTab = new TabBarState(
            {
                tabs: makeTrItems([
                    ['data', 'TAB.SELECTED_DATA'],
                    ['member', 'TAB.MEMBER'],
                ]),
            }, {
                activeTab: 'data',
            },
        );

        const isNotSelected = computed(() => apiHandler.tableTS.selectState.isNotSelected);
        const isNotSelectOne = computed(() => !apiHandler.tableTS.selectState.isSelectOne);
        const hasLink = computed(() => (!!(isNotSelectOne.value || !selectProviderItem.value?.tags?.external_link_template)));
        const dropdown = reactive({
            ...makeTrItems([
                ['delete', 'BTN.DELETE', { disabled: isNotSelectOne }],
                [null, null, { type: 'divider' }],
                ['project', 'COMMON.CHG_PRO'],
                [null, null, { type: 'divider' }],
                ['link', null, { label: 'Console', disabled: hasLink }],
            ],
            context.parent,
            { type: 'item', disabled: isNotSelected }),
        });

        const changeProjectState = reactive({
            visible: false,
            loading: false,
            projectId: computed(() => {
                if (apiHandler.tableTS.selectState.selectItems.length > 1) return '';
                return get(apiHandler, 'tableTS.selectState.firstSelectItem.project_info.project_id', '');
            }),
        });
        const clickProject = () => { changeProjectState.visible = true; };
        const changeProject = async (data?: ProjectItemResp|null) => {
            changeProjectState.loading = true;
            const action = fluentApi.identity().serviceAccount().changeProject().clone()
                .setSubIds(apiHandler.tableTS.selectState.selectItems.map(item => item.service_account_id));

            if (data) {
                try {
                    await action.setId(data.id).execute();

                    context.root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'Success',
                        text: 'Project has been successfully changed.',
                        duration: 2000,
                        speed: 1000,
                    });
                } catch (e) {
                    showErrorMessage('Fail to Change Project', e, context.root);
                } finally {
                    await project.getProject(true);
                    projectState.project = project.state.projects;
                    await apiHandler.getData();
                }
            } else {
                try {
                    await action.setReleaseProject().execute();
                    context.root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'Success',
                        text: 'Release Project Success',
                        duration: 2000,
                        speed: 1000,
                    });
                } catch (e) {
                    showErrorMessage('Fail to Release Project', e, context.root);
                } finally {
                    await apiHandler.getData();
                }
            }

            changeProjectState.loading = false;
            changeProjectState.visible = false;
        };


        const secretIsShow = computed(() => apiHandler.tableTS.selectState.isSelectOne && singleItemTab.syncState.activeTab === 'credentials');

        const secretListAction = fluentApi.secret().secret().list().setOnly(
            'secret_id', 'name', 'schema', 'created_at',
        );
        const secretApiHandler = new TabSearchTableFluentAPI(
            secretListAction,
            secretIsShow,
            {
                selectable: false,
                striped: true,
                border: false,
                shadow: false,
                multiSelect: false,
            },
        );

        watch(() => apiHandler.tableTS.selectState.firstSelectItem, (item, before) => {
            if (item && item[serviceAccountID] && item[serviceAccountID] !== before[serviceAccountID]) {
                secretApiHandler.resetAll();
                secretApiHandler.action = secretListAction.setFixFilter(
                    { key: serviceAccountID, operator: '=', value: item[serviceAccountID] },
                );
                if (secretIsShow.value) {
                    secretApiHandler.getData();
                }
            }
        });
        const adminIsShow = computed(() => {
            let result = false;
            if (selectProvider.value) {
                if (apiHandler.tableTS.selectState.isSelectOne) {
                    result = singleItemTab.syncState.activeTab === 'member';
                }

                if (apiHandler.tableTS.selectState.isSelectMulti) {
                    result = multiItemTab.syncState.activeTab === 'member';
                }
            }
            return result;
        });
        const adminApi = computed<DynamicLayoutApiProp>(() => {
            let ids: string[] = [];
            if (apiHandler.tableTS.selectState.isSelectOne) {
                ids = [apiHandler.tableTS.selectState.firstSelectItem[serviceAccountID]];
            } else {
                ids = apiHandler.tableTS.selectState.selectItems.map(it => it[serviceAccountID]);
            }
            return {
                resource: fluentApi.identity().serviceAccount().memberList().setIds(ids),
            };
        });


        const deleteTS = new DoubleCheckModalState();
        const deleteAction = ref<any>(null);
        const deleteTargetHandler = ref<any>(null);
        const accountDeleteAction = fluentApi.identity().serviceAccount().delete();

        const accountDeleteClick = () => {
            const name = apiHandler.tableTS.selectState.firstSelectItem.name;
            deleteAction.value = accountDeleteAction.setId(apiHandler.tableTS.selectState.firstSelectItem[serviceAccountID]);
            deleteTargetHandler.value = apiHandler;
            deleteTS.state.headerTitle = 'Delete Account';
            deleteTS.state.subTitle = `You will Permanently lose your [${name}]`;
            deleteTS.state.verificationText = name;
            deleteTS.syncState.visible = true;
        };

        const secretDeleteAction = fluentApi.secret().secret().delete();

        const secretDeleteClick = () => {
            const name = secretApiHandler.tableTS.selectState.firstSelectItem.name;
            deleteAction.value = secretDeleteAction.setId(secretApiHandler.tableTS.selectState.firstSelectItem.secret_id);
            deleteTargetHandler.value = secretApiHandler;
            deleteTS.state.headerTitle = 'Delete Secret';
            deleteTS.state.subTitle = `You will Permanently lose your [${name}]`;
            deleteTS.state.verificationText = name;
            deleteTS.syncState.visible = true;
        };
        const deleteConfirm = () => {
            deleteAction.value.execute()
                .then(() => {
                    context.root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'Deleted Success',
                        text: 'Delete Secret Success',
                        duration: 2000,
                        speed: 1000,
                    });
                }).catch((e) => {
                    showErrorMessage('Delete Failed', e, context.root);
                })
                .finally(() => {
                    deleteTargetHandler.value.getData();
                });
            deleteTS.syncState.visible = false;
        };

        const secretDataSource: DataSourceItem[] = [
            { name: 'Secret', key: 'secret_id' },
            { name: 'Name', key: 'name' },
            { name: 'Schema', key: 'schema' },
            {
                name: 'Created',
                key: 'created_at.seconds',
                type: 'datetime',
                options: {
                    source_type: 'timestamp',
                    source_format: 'seconds',
                },
            },
        ];
        const secretFormState = reactive({
            secretFormVisible: false,
            secretSchemas: [] as string[],
        });
        const clickSecretAddForm = () => {
            secretFormState.secretSchemas = selectProviderItem.value?.capability.supported_schema as string[];
            secretFormState.secretFormVisible = true;
        };
        const secretFormConfirm = (item) => {
            fluentApi.secret().secret().create().setParameter({
                ...item,
                secret_type: 'CREDENTIALS',
                service_account_id: apiHandler.tableTS.selectState.firstSelectItem.service_account_id,
            })
                .execute()
                .then(() => {
                    context.root.$notify({
                        group: 'noticeTopRight',
                        type: 'success',
                        title: 'Add Success',
                        text: 'Add Secret Success',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .catch((e) => {
                    showErrorMessage('Fail to Add Credentials', e, context.root);
                })
                .finally(() => {
                    secretApiHandler.getData();
                });
            secretFormState.secretFormVisible = false;
        };

        const addServiceAccount = () => {
            vm.$router.push({
                name: 'addServiceAccount',
                params: { provider: selectProvider.value },
                query: { nextPath: vm.$route.fullPath },
            });
        };

        const clickLink = () => {
            const linkTemplate = selectProviderItem.value?.tags?.external_link_template;
            const link = nunjucks.renderString(linkTemplate, apiHandler.tableTS.selectState.firstSelectItem);
            window.open(link);
        };

        const saLayout = computed(() => {
            const fields = accountFields.value;
            return {
                name: 'Base Information',
                type: 'item',
                options: {
                    fields,
                },
            };
        });

        const requestProvider = async () => {
            const resp = await providerListAPI.execute();
            const prs = resp.data.results.map(item => item.provider);
            providers.value = zipObject(prs, resp.data.results);
            providerTotalCount.value = reactive<any>(zipObject(
                prs,
                Array(prs.length),
            ));
            prs.forEach((key) => {
                resourceCountAPI.setFilter({ key: 'provider', operator: '=', value: key }).setCountOnly().execute().then((res) => {
                    providerTotalCount.value[key] = res.data.total_count;
                });
            });
        };


        /** Query String */
        const queryRefs = {
            provider: makeQueryStringComputed(selectProvider, { key: 'provider' }),
            ...makeQueryStringComputeds(apiHandler.tableTS.syncState, {
                pageSize: { key: 'ps', setter: Number },
                thisPage: { key: 'p', setter: Number },
                sortBy: { key: 'sb' },
                sortDesc: { key: 'sd', setter: Boolean },
                selectIndex: {
                    key: 'sl',
                    setter: queryStringToNumberArray,
                    autoReplacer: selectIndexAutoReplacer,
                },
            }),
            ...makeQueryStringComputeds(multiItemTab.syncState, {
                activeTab: { key: 'mt' },
            }),
            ...makeQueryStringComputeds(singleItemTab.syncState, {
                activeTab: { key: 'st' },
            }),
            t_se: makeQueryStringComputed(ref(undefined), { key: 't_se' }),
        };

        // apply search keyword to query string only when search event occurred
        const onSearch = (e) => { queryRefs.t_se.value = e || undefined; };

        /** Init */
        const init = async () => {
            await requestProvider();
            // useStore();
            await project.getProject(true);
            projectState.project = project.state.projects;

            // init search text by query string
            apiHandler.tableTS.searchText.value = vm.$route.query.t_se as string;

            if (providerListState.state.items.length > 0) {
                // set selected provider
                const provider = queryRefs.provider.value;
                selectProvider.value = provider || providerListState.state.items[0].provider;

                watch(selectProvider, async (after, before) => {
                    if (after !== before) {
                        apiHandler.action = ListAction.setFixFilter(
                            { key: 'provider', operator: '=', value: after },
                        );
                        await apiHandler.getData();
                    }
                }, { immediate: true });
            }
        };

        init();

        return {
            apiHandler,
            accountFields,
            singleItemTab,
            multiItemTab,
            secretApiHandler,
            secretDataSource,
            selectProviderItem,
            deleteTS,
            accountDeleteClick,
            deleteConfirm,
            secretDeleteClick,
            dropdown,
            changeProjectState,
            clickProject,
            changeProject,
            adminApi,
            clickSecretAddForm,
            ...toRefs(secretFormState),
            ...toRefs(projectState),
            ...toRefs(routeState),
            secretFormConfirm,
            providerListState,
            selectProvider,
            providerTotalCount,
            addServiceAccount,
            clickLink,
            adminIsShow,
            defaultAdminLayout,
            saLayout,
            onSearch,
        };
    },
};

</script>

<style lang="postcss" scoped>
    .left-toolbox-item {
        @apply mx-4;
        &:last-child {
            flex-grow: 1;
        }
    }
    .provider-list {
        @apply w-full px-4 pt-6;
    }
    >>> .provider-card-item {
        @apply px-4 py-3 flex items-center justify-between bg-transparent;

        .left {
            @apply flex items-center;
            .title {
                @apply ml-4 text-base;
            }
        }
        .right {
            .total-count {
                @apply w-10 flex h-6 ml-2 justify-center items-center text-white;
                border-radius: 6.25rem;
                border-width: 0.0625rem;
            }
        }
        &.selected {
            @apply border-blue-500 bg-blue-200 text-blue-500;
            .left {
                .title {
                    @apply text-blue-500;
                }
            }
        }
    }
</style>
