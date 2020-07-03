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
            <template v-if="selectProvider">
                <div class="w-full h-full">
                    <p-horizontal-layout>
                        <template #container="{ height }">
                            <PPageTitle
                                :use-selected-count="true" :use-total-count="true" :title="selectProviderItem.name+' Account'"
                                :total-count="apiHandler.totalCount.value"
                                :selected-count="apiHandler.tableTS.selectState.selectItems.length"
                            />
                            <s-dynamic-layout type="table"
                                              :toolset="apiHandler"
                                              :options="{fields: accountFields}"
                                              :vbind="{
                                                  responsiveStyle:{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'},
                                                  showTitle:false,
                                                  isShowGetData:false,
                                              }"
                            >
                                <template #toolbox-left>
                                    <PIconTextButton style-type="primary-dark"
                                                     name="ic_plus_bold"
                                                     @click="addServiceAccount"
                                    >
                                        {{ $t('BTN.ADD') }}
                                    </PIconTextButton>

                                    <PDropdownMenuBtn
                                        class="left-toolbox-item"
                                        :menu="dropdown"
                                        @click-delete="accountDeleteClick"
                                        @click-project="clickProject"
                                        @click-link="clickLink"
                                    >
                                        Action
                                    </PDropdownMenuBtn>
                                </template>
                            </s-dynamic-layout>
                        </template>
                    </p-horizontal-layout>
                    <PTab v-if="apiHandler.tableTS.selectState.isSelectOne" :tabs="singleItemTab.state.tabs" :active-tab.sync="singleItemTab.syncState.activeTab">
                        <template #detail>
                            <s-dynamic-layout
                                class="mb-8"
                                v-bind="saLayout"
                                :data="apiHandler.tableTS.selectState.firstSelectItem"
                            />
                        </template>
                        <template #tag>
                            <s-tags-panel
                                :is-show="singleItemTab.syncState.activeTab==='tag'"
                                :resource-id="apiHandler.tableTS.selectState.firstSelectItem.service_account_id"
                                tag-page-name="serviceAccountTags"
                            />
                        </template>
                        <template #credentials>
                            <s-dynamic-layout
                                type="table"
                                :name="$t('TAB.CREDENTIALS')"
                                :toolset="secretApiHandler"
                                :options="{fields: secretDataSource}"
                                :vbind="{
                                    responsiveStyle:{ 'overflow-y':'auto','overflow-x':'auto'},
                                }"
                            >
                                <template #toolbox-left>
                                    <PIconTextButton style-type="primary-dark"
                                                     name="ic_plus_bold"
                                                     @click="clickSecretAddForm()"
                                    >
                                        {{ $t('BTN.ADD') }}
                                    </PIconTextButton>
                                    <p-button
                                        class="left-toolbox-item"
                                        style-type="alert"
                                        :disabled="secretApiHandler.tableTS.selectState.isNotSelected"
                                        @click="secretDeleteClick"
                                    >
                                        {{ $t('BTN.DELETE') }}
                                    </p-button>
                                </template>
                            </s-dynamic-layout>
                        </template>
                        <template #member>
                            <s-dynamic-layout :api="adminApi"
                                              :is-show="adminIsShow" :name="$t('TAB.MEMBER')"
                                              v-bind="defaultAdminLayout"
                            />
                        </template>
                    </PTab>
                    <PTab v-else-if="apiHandler.tableTS.selectState.isSelectMulti"
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
                    </PTab>
                    <p-empty v-else style="height: auto; margin-top: 4rem;">
                        No Selected Item
                    </p-empty>
                </div>
            </template>
            <p-empty v-else class="header">
                No Selected Provider
            </p-empty>
            <PDoubleCheckModal
                v-bind="deleteTS.state"
                :visible.sync="deleteTS.syncState.visible"
                @confirm="deleteConfirm"
            />
            <s-project-tree-modal :visible.sync="changeProjectState.visible"
                                  :project-id="changeProjectState.projectId"
                                  :loading="changeProjectState.loading"
                                  @confirm="changeProject"
            />
            <SSecretCreateFormModal v-if="secretFormVisible" :visible.sync="secretFormVisible" :schema-names="secretSchemas"
                                    @confirm="secretFormConfirm($event)"
            />
        </template>
    </p-vertical-page-layout>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout from '@/views/containers/page-layout/VerticalPageLayout.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import SDynamicLayout from '@/components/organisms/dynamic-view/dynamic-layout/SDynamicLayout.vue';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import { makeTrItems } from '@/lib/view-helper/index';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import SProjectTreeModal from '@/components/organisms/modals/tree-api-modal/ProjectTreeModal.vue';
import { DataSourceItem, fluentApi } from '@/lib/fluent-api';
import {
    SearchTableFluentAPI, TabSearchTableFluentAPI,
    defaultAdminLayout, DefaultQSTableQSProps,
    RouteSearchTableFluentAPI,
} from '@/lib/api/table';
import {
    DefaultQSGridQSProps,
    RouteSearchGridFluentAPI,
} from '@/lib/api/grid';
import {
    propsCopy,
} from '@/lib/router-query-string';
import {
    SelectGridLayoutToolSet,
    DefaultSingleItemSelectGridQSProps,
    DefaultMultiItemSelectGridQSProps,
    GridLayoutState, makeSelectGridQSProps, DefaultSingleItemSelectGridQSPropsName,
} from '@/components/molecules/layouts/grid-layout/toolset';
import {
    DefaultMultiItemTabBarQSProps, DefaultMultiItemTabBarQSPropsName,
    DefaultSingleItemTabBarQSProps, RouterTabBarToolSet,
    TabBarState,
} from '@/components/molecules/tabs/tab-bar/toolset';
import { ProviderModel } from '@/lib/fluent-api/identity/provider';
import { DoubleCheckModalState } from '@/components/organisms/modals/double-check-modal/toolset';
import PDoubleCheckModal from '@/components/organisms/modals/double-check-modal/DoubleCheckModal.vue';
import { ProjectNode } from '@/lib/api/tree';
import { ProjectItemResp } from '@/lib/fluent-api/identity/project';
import { ExcelExportAPIToolSet } from '@/lib/api/add-on';
import { idField as serviceAccountID, ServiceAccountListResp } from '@/lib/fluent-api/identity/service-account';
import { useStore } from '@/store/toolset';
import { AxiosResponse } from 'axios';
import { createAtVF } from '@/lib/data-source';
import SSecretCreateFormModal from '@/views/identity/service-account/modules/SecretCreateFormModal.vue';
import nunjucks from 'nunjucks';
import _, { get, zipObject } from 'lodash';

import PGridLayout from '@/components/molecules/layouts/grid-layout/GridLayout.vue';
import PPageTitle from '@/components/organisms/title/page-title/PageTitle.vue';
import STagsPanel from '@/components/organisms/panels/tag-panel/STagsPanel.vue';
import { DynamicLayoutApiProp } from '@/components/organisms/dynamic-view/dynamic-layout/toolset';
import { showErrorMessage } from '@/lib/util';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';

enum providerQsName{
    select = 'provider'
}

const providerQsNameProps = makeSelectGridQSProps(providerQsName);

export default {
    name: 'ServiceAccount',
    components: {
        PVerticalPageLayout,
        PHorizontalLayout,
        PTab,
        PButton,
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
    },
    props: {
        ...providerQsNameProps,
        ...DefaultQSTableQSProps,
        ...DefaultSingleItemTabBarQSProps,
        ...DefaultMultiItemTabBarQSProps,
    },
    setup(props, context) {
        const { project } = useStore();
        project.getProject();
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
        const vm = getCurrentInstance() as ComponentInstance;


        const selectProvider = ref<string>('');
        const providers = ref<{[key in string]: ProviderModel}>({});
        const selectProviderItem = computed<ProviderModel>(() => providers.value[selectProvider.value]);
        const providerTotalCount = ref({});

        const providerListState = new SelectGridLayoutToolSet(vm,
            providerQsName,
            undefined,
            selectProvider,
            undefined,
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
            });

        // onMounted(async () => {
        //     const resp = await providerListAPI.execute();
        //     const prs = resp.data.results.map(item => item.provider);
        //     providers.value = zipObject(prs, resp.data.results);
        //     providerTotalCount.value = reactive<any>(zipObject(
        //         prs,
        //         Array(prs.length),
        //     ));
        //     selectProvider.value = prs[0];
        //
        //     prs.forEach((key) => {
        //         resourceCountAPI.setFilter({ key: 'provider', operator: '=', value: key }).execute().then((res) => {
        //             providerTotalCount.value[key] = res.data.total_count;
        //         });
        //     });
        // });


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
                    item.console_force_data = { project: item.project_info ? project.state.projects[item.project_info.project_id] || item.project_info.project_id : '' };
                    return item;
                });
                return result;
            });

        const ACHandlerMeta = {
            handlerClass: QuerySearchTableACHandler,
            args: {
                keys: ['name'],
                suggestKeys: ['name'],
            },
        };

        const apiHandler = new RouteSearchTableFluentAPI(ListAction, {
            shadow: true,
            border: true,
            padding: true,
            selectable: true,
            excelVisible: true,
        },
        undefined,
        vm, undefined, undefined);
        const exportAction = fluentApi.addons().excel().export();
        const exportToolSet = new ExcelExportAPIToolSet(exportAction, apiHandler);

        // watch(selectProvider, (after, before) => {
        //     if (after && after !== before) {
        //         apiHandler.resetAll();
        //         apiHandler.action = ListAction.setFixFilter(
        //             { key: 'provider', operator: '=', value: after },
        //         );
        //         apiHandler.getData();
        //         exportToolSet.action = exportAction.setDataSource(originDataSource.value);
        //     }
        // });

        const singleItemTab = new RouterTabBarToolSet(
            vm,
            undefined,
            computed(() => apiHandler.tableTS.selectState.isSelectOne),
            {
                tabs: makeTrItems([
                    ['detail', 'TAB.DETAILS'],
                    ['tag', 'TAB.TAG'],
                    ['credentials', 'TAB.CREDENTIALS'],
                    ['member', 'TAB.MEMBER'],
                ]),
            },
        );
        singleItemTab.syncState.activeTab = 'detail';

        const multiItemTab = new RouterTabBarToolSet(
            vm,
            DefaultMultiItemTabBarQSPropsName,
            computed(() => apiHandler.tableTS.selectState.isSelectMulti),
            {
                tabs: makeTrItems([
                    ['data', 'TAB.SELECTED_DATA'],
                    ['member', 'TAB.MEMBER'],
                ]),
            },
        );
        multiItemTab.syncState.activeTab = 'data';

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
                await action.setId(data.id).execute()
                    .then(() => {
                        context.root.$notify({
                            group: 'noticeTopRight',
                            type: 'success',
                            title: 'Success',
                            text: 'Project has been successfully changed.',
                            duration: 2000,
                            speed: 1000,
                        });
                    }).catch((e) => {
                        showErrorMessage('Fail to Change Project', e, context.root);
                    });
            } else {
                await action.setReleaseProject().execute()
                    .then(() => {
                        context.root.$notify({
                            group: 'noticeTopRight',
                            type: 'success',
                            title: 'Success',
                            text: 'Release Project Success',
                            duration: 2000,
                            speed: 1000,
                        });
                    }).catch((e) => {
                        showErrorMessage('Fail to Release Project', e, context.root);
                    });
            }

            changeProjectState.loading = false;
            changeProjectState.visible = false;
            await apiHandler.getData();
        };


        const secretIsShow = computed(() => apiHandler.tableTS.selectState.isSelectOne && singleItemTab.syncState.activeTab === 'credentials');

        const secretListAction = fluentApi.secret().secret().list();
        const secretApiHandler = new TabSearchTableFluentAPI(
            secretListAction,
            secretIsShow,
            {
                striped: true,
                border: false,
                shadow: false,
                padding: false,
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
            secretFormState.secretSchemas = selectProviderItem.value.capability.supported_schema;
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
            vm?.$router.push({
                name: 'addServiceAccount',
                params: { provider: selectProvider.value },
                query: { nextPath: vm.$route.fullPath },
            });
        };

        apiHandler.getData();
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
        // const saApi = computed(() => {
        //     const id = apiHandler.tableTS.selectState.firstSelectItem.service_account_id;
        //     return {
        //         resource: fluentApi.identity().serviceAccount().get().setId(id),
        //     };
        // });
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

        const setFixFilter = (provider: string, handler: RouteSearchTableFluentAPI<any, any>, reset = true) => {
            handler.action = ListAction.setFixFilter(
                { key: 'provider', operator: '=', value: provider },
            );
            exportToolSet.action = exportAction.setDataSource(originDataSource.value);
            if (reset) {
                handler.resetAll();
            }
        };

        const routerHandler = async () => {
            const prop = propsCopy(props);
            await requestProvider();
            if (prop[providerQsName.select]) {
                providerListState.applyDisplayRouter(prop);
            } else {
                providerListState.select.value = providerListState.state.items[0]?.provider;
                providerListState.isReady.value = true;
            }
            setFixFilter(providerListState.select.value, apiHandler, false);
            apiHandler.applyAPIRouter(prop);
            await apiHandler.getData();
            apiHandler.applyDisplayRouter(prop);
            singleItemTab.applyDisplayRouter(prop);
            multiItemTab.applyDisplayRouter(prop);
        };

        onMounted(async () => {
            await routerHandler();
            // const getData = _.debounce(() => apiHandler.getData(), 50);
            let ready = false;
            watch(selectProvider, async (after, before) => {
                if (ready && after && after !== before) {
                    setFixFilter(after, apiHandler);
                    await apiHandler.getData();
                }
            });
            ready = true;
        });


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
            secretFormConfirm,
            providerListState,
            selectProvider,
            providerTotalCount,
            addServiceAccount,
            clickLink,
            adminIsShow,
            defaultAdminLayout,
            // saApi,
            saLayout,
            routerHandler,
        };
    },
};

</script>

<style lang="postcss" scoped>
    .left-toolbox-item{
        @apply mx-4;
        &:last-child {
            flex-grow: 1;
        }
    }
    .provider-list{
        @apply w-full px-4 pt-6;

    }
    >>> .provider-card-item{
        @apply px-4 py-3 flex items-center justify-between bg-transparent;

        .left{
            @apply flex items-center;
            .title {
                @apply ml-4 text-base;
            }
        }
        .right{
            .total-count{
                @apply w-10 flex h-6 ml-2 justify-center items-center text-white;
                border-radius: 6.25rem;
                border-width: 0.0625rem;

            }
        }
        &.selected{
            @apply border-blue-500 bg-blue-200 text-blue-500;
            .left{
                .title{
                    @apply text-blue-500;
                }
            }
        }

    }

</style>
