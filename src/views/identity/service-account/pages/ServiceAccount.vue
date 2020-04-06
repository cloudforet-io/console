<template>
    <p-vertical-page-layout2 :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <PSelectableList
                class="w-full"
                v-bind="listToolset.state"
                :selected-indexes.sync="listToolset.syncState.selectedIndexes"
            />
        </template>
        <template #default>
            <template v-if="!listToolset.selectState.isNotSelected">
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
                            >
                                <template #toolbox-left>
                                    <p-button style-type="primary-dark" @click="clickOpenForm('add')">
                                        {{ $t('BTN.ADD') }}
                                    </p-button>
                                    <PDropdownMenuBtn
                                        class="left-toolbox-item"
                                        :menu="dropdown"
                                        @click-delete="accountDeleteClick"
                                        @click-project="clickProject"
                                        @click-link="apiHandler.tableTS.linkState.openLink()"
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
                            <p-dict-panel :dict.sync="tagsApi.ts.syncState.dict"
                                          :edit-mode.sync="tagsApi.ts.syncState.editMode"
                                          v-on="tagsApi.ts.listeners"
                            />
                        </template>
                        <template #credentials>
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
    computed, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout2 from '@/views/containers/page-layout/VerticalPageLayout2.vue';
import PHorizontalLayout from '@/components/organisms/layouts/horizontal-layout/HorizontalLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';


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
import { useStore } from '@/store/toolset';
import { AxiosResponse } from 'axios';
import { createAtVF } from '@/lib/data-source';
import SServiceAccountFormModal from '@/views/identity/service-account/modules/ServiceAccountFormModal.vue';
import { DictPanelAPI } from '@/components/organisms/panels/dict-panel/dict';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import SSecretCreateFormModal from '@/views/identity/service-account/modules/SecretCreateFormModal.vue';

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
        PSelectableList,
        PDoubleCheckModal,
        SServiceAccountFormModal,
        SSecretCreateFormModal,
    },
    setup(props, context) {
        const { project } = useStore();
        project.getProject();

        const listToolset = new SelectableListToolset<unknown, unknown, ProviderModel>();
        listToolset.state.mapper.iconUrl = 'tags.icon';
        listToolset.state.mapper.key = 'proivder';
        listToolset.state.mapper.title = 'name';

        const providerListAPI = fluentApi.identity().provider().list().setOnly(
            'name',
            'provider',
            'tags.icon',
            'template.service_account.schema',
            'capability.supported_schema',
        );

        providerListAPI.execute().then((resp) => {
            listToolset.state.items = resp.data.results;
            listToolset.syncState.selectedIndexes = [0];
        });

        const originDataSource = computed<any[]>(() => {
            if (listToolset.selectState.isSelectOne) {
                const properties = listToolset.selectState.firstSelectItem.template.service_account.schema.properties;
                if (properties) {
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
                ['credentials', 'TAB.CREDENTIALS'],
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
        });
        const exportAction = fluentApi.addons().excel().export();
        const exportToolSet = new ExcelExportAPIToolSet(exportAction, apiHandler);

        watch(() => listToolset.selectState.firstSelectItem, (item, before) => {
            if (item && item.provider && item.provider !== before.provider) {
                apiHandler.resetAll();
                apiHandler.action = ListAction.setFixFilter(
                    { key: 'provider', operator: '=', value: item.provider },
                );
                apiHandler.getData();
                exportToolSet.action = exportAction.setDataSource(originDataSource.value);
            }
        });

        const isNotSelected = computed(() => apiHandler.tableTS.selectState.isNotSelected);
        const isNotSelectOne = computed(() => !apiHandler.tableTS.selectState.isSelectOne);
        const dropdown = reactive({
            ...makeTrItems([
                ['delete', 'BTN.DELETE', { disabled: isNotSelectOne }],
                [null, null, { type: 'divider' }],
                ['project', 'COMMON.CHG_PRO'],
                [null, null, { type: 'divider' }],
                ['link', null, { label: 'Console', disabled: apiHandler.tableTS.noLink }],
                ['exportExcel', null, { label: 'Export', disabled: false }],
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
            if (listToolset.selectState.isSelectOne) {
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
            secretFormState.secretSchemas = listToolset.selectState.firstSelectItem.capability.supported_schema;
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
            formState.formSchema = listToolset.selectState.firstSelectItem.template.service_account.schema;
            formState.formVisible = true;
        };
        const formConfirm = (item) => {
            if (formState.mode === 'add') {
                fluentApi.identity().serviceAccount().create().setParameter({
                    provider: listToolset.selectState.firstSelectItem.provider,
                    ...item,
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
        apiHandler.getData();
        return {
            apiHandler,
            accountDataSource,
            singleItemTab,
            multiItemTab,
            accountDetails,
            secretApiHandler,
            secretDataSource,
            listToolset,
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
        };
    },

};

</script>

<style lang="postcss" scoped>
    .left-toolbox-item{
        margin-left: 1rem;
        &:last-child {
            flex-grow: 1;
        }
    }

</style>
