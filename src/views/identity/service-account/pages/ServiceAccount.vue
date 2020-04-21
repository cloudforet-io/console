<template>
    <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
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
                            <p-dynamic-view view_type="table"
                                            :api-handler="apiHandler"
                                            :data_source="accountDataSource"
                                            :vbind="{
                                                responsiveStyle:{'height': height+'px', 'overflow-y':'auto','overflow-x':'auto'}
                                            }"
                                            :data="null"
                                            @clickExcel="exportToolSet.getData()"
                            >
                                <template #toolbox-left>
                                    <PIconTextButton style-type="primary-dark"
                                                     name="ic_plus_bold"
                                                     @click="clickOpenForm('add')"
                                    >
                                        {{ $t('BTN.ADD') }}
                                    </PIconTextButton>

                                    <PDropdownMenuBtn
                                        class="left-toolbox-item"
                                        :menu="dropdown"
                                        @click-delete="accountDeleteClick"
                                        @click-project="clickProject"
                                        @click-link="clickLink"
                                        @click-exportExcel="exportToolSet.getData()"
                                    >
                                        Action
                                    </PDropdownMenuBtn>
                                </template>
                            </p-dynamic-view>
                        </template>
                    </p-horizontal-layout>
                    <PTab v-if="apiHandler.tableTS.selectState.isSelectOne" :tabs="singleItemTab.state.tabs" :active-tab.sync="singleItemTab.syncState.activeTab">
                        <template #detail>
                            <PDynamicDetails
                                :details="accountDetails"
                                :data="apiHandler.tableTS.selectState.firstSelectItem"
                            />
                            <p-dict-panel :dict="apiHandler.tableTS.selectState.firstSelectItem.tags">
                                <template #extra>
                                    <p-button style-type="primary" @click="editTag">
                                        {{ $t('BTN.EDIT') }}
                                    </p-button>
                                </template>
                            </p-dict-panel>
                        </template>
                        <template #credentials>
                            <PPanelTop style="margin-bottom:-0.5rem;" :use-total-count="true" :total-count="secretApiHandler.totalCount.value">
                                {{ $t('TAB.SECRET') }}
                            </PPanelTop>
                            <p-dynamic-view view_type="table"
                                            :api-handler="secretApiHandler"
                                            :data_source="secretDataSource"
                                            :data="null"
                            >
                                <template #toolbox-left>
                                    <p-button
                                        style-type="primary-dark"
                                        @click="clickSecretAddForm()"
                                    >
                                        {{ $t('BTN.ADD') }}
                                    </p-button>
                                    <p-button
                                        class="left-toolbox-item"
                                        style-type="primary-dark"
                                        :disabled="secretApiHandler.tableTS.selectState.isNotSelected"
                                        @click="secretDeleteClick"
                                    >
                                        {{ $t('BTN.DELETE') }}
                                    </p-button>
                                </template>
                            </p-dynamic-view>
                        </template>
                        <template #admin>
                            <PPanelTop style="margin-bottom:-0.5rem;" :use-total-count="true" :total-count="adminApiHandler.totalCount.value">
                                {{ $t('TAB.ADMIN') }}
                            </PPanelTop>
                            <p-dynamic-view
                                view_type="table"
                                :api-handler="adminApiHandler"
                                :data_source="adminApiHandler.dataSource"
                                :data="null"
                            />
                        </template>
                    </PTab>
                    <PTab v-else-if="apiHandler.tableTS.selectState.isSelectMulti"
                          :tabs="multiItemTab.state.tabs"
                          :active-tab.sync="multiItemTab.syncState.activeTab"
                    >
                        <template #data>
                            <p-dynamic-view
                                view_type="simple-table"
                                :data_source="accountDataSource"
                                :data="apiHandler.tableTS.selectState.selectItems"
                            />
                        </template>
                        <template #admin>
                            <PPanelTop style="margin-bottom:-0.5rem;" :use-total-count="true" :total-count="adminApiHandler.totalCount.value">
                                {{ $t('TAB.ADMIN') }}
                            </PPanelTop>
                            <p-dynamic-view
                                view_type="table"
                                :api-handler="adminApiHandler"
                                :data_source="adminApiHandler.dataSource"
                            />
                        </template>
                    </PTab>
                    <p-empty v-else style="height: auto;margin-top:4rem ">
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
            <s-project-tree-modal :visible.sync="projectModalVisible" @confirm="changeProject" />
            <SServiceAccountFormModal v-if="formVisible" :visible.sync="formVisible" :schema="formSchema"
                                      @confirm="formConfirm($event)"
            />
            <SSecretCreateFormModal v-if="secretFormVisible" :visible.sync="secretFormVisible" :schema-names="secretSchemas"
                                    @confirm="secretFormConfirm($event)"
            />
        </template>
    </p-vertical-page-layout2>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout2 from '@/views/containers/page-layout/VerticalPageLayout2.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';
import PI from '@/components/atoms/icons/PI.vue';

import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/DropdownMenuBtn.vue';
import { makeTrItems } from '@/lib/view-helper/index';
import PEmpty from '@/components/atoms/empty/Empty.vue';
import SProjectTreeModal from '@/components/organisms/modals/tree-api-modal/ProjectTreeModal.vue';
import { DataSourceItem, fluentApi } from '@/lib/fluent-api';
import { AdminFluentAPI, SearchTableFluentAPI, TabSearchTableFluentAPI } from '@/lib/api/table';
import { TabBarState } from '@/components/molecules/tabs/tab-bar/toolset';
import PSelectableList from '@/components/organisms/lists/selectable-list/SelectableList.vue';
import { SelectableListToolset } from '@/components/organisms/lists/selectable-list/SelectableList.toolset';
import { ProviderModel } from '@/lib/fluent-api/identity/provider';
import { DoubleCheckModalState } from '@/components/organisms/modals/double-check-modal/toolset';
import PDoubleCheckModal from '@/components/organisms/modals/double-check-modal/DoubleCheckModal.vue';
import { ProjectNode } from '@/lib/api/tree';
import { ExcelExportAPIToolSet } from '@/lib/api/add-on';
import { idField as serviceAccountID, ServiceAccountListResp } from '@/lib/fluent-api/identity/service-account';
import { ProviderStoreType, useStore } from '@/store/toolset';
import { AxiosResponse } from 'axios';
import { createAtVF } from '@/lib/data-source';
import SServiceAccountFormModal from '@/views/identity/service-account/modules/ServiceAccountFormModal.vue';
import { DictPanelAPI } from '@/lib/api/dict';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import SSecretCreateFormModal from '@/views/identity/service-account/modules/SecretCreateFormModal.vue';
import nunjucks from 'nunjucks';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import PPanelTop from '@/components/molecules/panel/panel-top/PanelTop.vue';
import _ from 'lodash';
import { GridLayoutState } from '@/components/molecules/layouts/grid-layout/toolset';
import PGridLayout from '@/components/molecules/layouts/grid-layout/GridLayout.vue';

export default {
    name: 'ServiceAccount',
    components: {
        PVerticalPageLayout2,
        PHorizontalLayout,
        PDynamicView,
        PTab,
        PButton,
        PDropdownMenuBtn,
        PDynamicDetails,
        PEmpty,
        SProjectTreeModal,
        PDictPanel,
        PDoubleCheckModal,
        SServiceAccountFormModal,
        SSecretCreateFormModal,
        PIconTextButton,
        PPanelTop,
        PGridLayout,
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


        const selectProvider = ref<string>('');
        const providers = ref<{[key in string]: ProviderModel}>({});
        const selectProviderItem = computed<ProviderModel>(() => providers.value[selectProvider.value]);
        const providerTotalCount = ref({});

        const vm = getCurrentInstance();
        const providerListState = new GridLayoutState({
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

        onMounted(async () => {
            const resp = await providerListAPI.execute();
            const prs = resp.data.results.map(item => item.provider);
            providers.value = _.zipObject(prs, resp.data.results);
            providerTotalCount.value = reactive<any>(_.zipObject(
                prs,
                Array(prs.length),
            ));
            selectProvider.value = prs[0];

            prs.forEach((key) => {
                resourceCountAPI.setFilter({ key: 'provider', operator: '=', value: key }).execute().then((res) => {
                    providerTotalCount.value[key] = res.data.total_count;
                });
            });
        });


        const originDataSource = computed<any[]>(() => {
            if (selectProviderItem.value) {
                const properties = selectProviderItem.value.template.service_account.schema.properties || {};
                if (selectProviderItem) {
                    return [
                        { name: 'name', key: 'name' },
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

        const accountDataSource = computed<any[]>(() => [
            ...originDataSource.value,
            {
                name: 'project', key: 'console_force_data.project', view_type: 'text', view_option: {},
            },
            createAtVF,
        ]);

        const singleItemTab = new TabBarState({
            tabs: makeTrItems([
                ['detail', 'TAB.DETAILS'],
                ['credentials', 'TAB.SECRET'],
                ['admin', 'TAB.ADMIN'],
            ]),
        });
        singleItemTab.syncState.activeTab = 'detail';

        const multiItemTab = new TabBarState({
            tabs: makeTrItems([
                ['data', 'TAB.DATA'],
                ['admin', 'TAB.ADMIN'],
            ]),
        });
        multiItemTab.syncState.activeTab = 'data';


        const ListAction = fluentApi.identity().serviceAccount().list()
            .setTransformer((resp: AxiosResponse<ServiceAccountListResp>) => {
                const result = resp;
                result.data.results = resp.data.results.map((item) => {
                    item.console_force_data = { project: item.project_info ? project.state.projects[item.project_info.project_id] || item.project_info.project_id : '' };
                    return item;
                });
                return result;
            });

        const apiHandler = new SearchTableFluentAPI(ListAction, {
            shadow: true,
            border: true,
            padding: true,
            selectable: true,
            dragable: true,
            excelVisible: true,
        });
        const exportAction = fluentApi.addons().excel().export();
        const exportToolSet = new ExcelExportAPIToolSet(exportAction, apiHandler);

        watch(selectProvider, (after, before) => {
            if (after && after !== before) {
                apiHandler.resetAll();
                apiHandler.action = ListAction.setFixFilter(
                    { key: 'provider', operator: '=', value: after },
                );
                apiHandler.getData();
                exportToolSet.action = exportAction.setDataSource(originDataSource.value);
            }
        });

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

        const projectModalVisible = ref(false);
        const clickProject = () => {
            projectModalVisible.value = true;
        };
        const changeProjectAction = fluentApi.identity().serviceAccount().changeProject();
        const changeProject = async (node?: ProjectNode|null) => {
            const action = changeProjectAction.setSubIds(apiHandler.tableTS.selectState.selectItems.map(item => item.service_account_id));

            if (node) {
                await action.setId(node.data.id).execute();
            } else {
                await action.setReleaseProject().execute();
            }

            await apiHandler.getData();
            projectModalVisible.value = false;
        };


        const accountDetails = computed(() => [
            {
                name: 'Base Information',
                data_source: accountDataSource.value,
            },
        ]);

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
                    result = singleItemTab.syncState.activeTab === 'admin';
                }

                if (apiHandler.tableTS.selectState.isSelectMulti) {
                    result = multiItemTab.syncState.activeTab === 'admin';
                }
            }
            return result;
        });
        const adminApiHandler = new AdminFluentAPI(
            fluentApi.identity().serviceAccount().memberList(),
            adminIsShow,
            serviceAccountID,
            apiHandler,
            {
                striped: true,
                border: false,
                shadow: false,
                padding: false,
                multiSelect: false,
            },
        );

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
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'Deleted Success',
                        duration: 2000,
                        speed: 1000,
                    });
                }).catch(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Deleted Fail',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .finally(() => {
                    deleteTargetHandler.value.getData();
                });
            deleteTS.syncState.visible = false;
        };


        const secretDataSource: DataSourceItem[] = [
            { name: 'Secret', key: 'secret_id' },
            { name: 'Name', key: 'name' },
            {
                name: 'Created at',
                key: 'created_at.seconds',
                view_type: 'datetime',
                view_option: {
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
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'Add Success',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .catch(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Add Fail',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .finally(() => {
                    secretApiHandler.getData();
                });
            secretFormState.secretFormVisible = false;
        };


        const formState = reactive({
            mode: 'add' as 'add'|'update',
            formVisible: false,
            formSchema: {} as any,
        });


        const clickOpenForm = (mode: 'add'|'update') => {
            formState.mode = mode;
            formState.formSchema = selectProviderItem.value.template.service_account.schema;
            formState.formVisible = true;
        };
        const formConfirm = (item) => {
            if (formState.mode === 'add') {
                const param = {
                    provider: selectProvider.value,
                    ...item,
                };
                fluentApi.identity().serviceAccount().create().setParameter(param)
                    .execute()
                    .then(() => {
                        context.root.$notify({
                            group: 'noticeBottomRight',
                            type: 'success',
                            title: 'Add Success',
                            duration: 2000,
                            speed: 1000,
                        });
                    })
                    .catch(() => {
                        context.root.$notify({
                            group: 'noticeBottomRight',
                            type: 'alert',
                            title: 'Add Fail',
                            duration: 2000,
                            speed: 1000,
                        });
                    })
                    .finally(() => {
                        apiHandler.getData();
                    });
            }
            formState.formVisible = false;
        };

        const tagsApi = new DictPanelAPI(fluentApi.identity().serviceAccount());

        watch(() => apiHandler.tableTS.selectState.firstSelectItem, async (item) => {
            tagsApi.setId(item.service_account_id);
            tagsApi.ts.toReadMode();
            await tagsApi.getData();
        });

        const clickLink = () => {
            const linkTemplate = selectProviderItem.value?.tags?.external_link_template;
            const link = nunjucks.renderString(linkTemplate, apiHandler.tableTS.selectState.firstSelectItem);
            console.debug(linkTemplate, link);
            window.open(link);
        };
        apiHandler.getData();
        const editTag = () => {
            vm?.$router.push({ name: 'serviceAccountTags', params: { resourceId: apiHandler.tableTS.selectState.firstSelectItem.service_account_id } });
        };
        return {
            apiHandler,
            accountDataSource,
            singleItemTab,
            multiItemTab,
            accountDetails,
            secretApiHandler,
            secretDataSource,
            deleteTS,
            accountDeleteClick,
            deleteConfirm,
            secretDeleteClick,
            dropdown,
            clickProject,
            changeProject,
            projectModalVisible,
            exportToolSet,
            adminApiHandler,
            clickOpenForm,
            formConfirm,
            clickSecretAddForm,
            ...toRefs(formState),
            ...toRefs(secretFormState),
            secretFormConfirm,
            tagsApi,
            clickLink,
            editTag,
            providerListState,
            selectProvider,
            providerTotalCount,
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
        @apply w-full px-4 pt-4;

    }
    >>> .provider-card-item{
        @apply px-4 py-3 flex items-center justify-between bg-transparent;

        .left{
            @apply flex items-center;
            .title{
                @apply ml-4 text-base;
                font-family: "Noto Sans";

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
            @apply border-blue-600 bg-blue-200 text-blue-600;
            .left{
                .title{
                    @apply text-blue-600;
                }
            }
        }

    }

</style>
