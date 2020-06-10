<template>
    <general-page-layout>
        <div class="top flex">
            <PPageTitle :title="item.name" child @goBack="$router.push({name:'projectMain'})" />
            <p-icon-button name="ic_transhcan"
                           width="1.5rem" height="1.5rem" class="delete-btn"
                           @click="openProjectDeleteForm"
            />
        </div>
        <p class="float-right text-gray-500 -my-6"><b>Project ID:</b> {{projectId}}</p>
        <PTab :tabs="singleItemTab.state.tabs" :active-tab.sync="singleItemTab.syncState.activeTab"
              :style="{'background':'#f8f8fc', 'border-width':0+'px'}"
        >
            <template #summary>
                <project-dashboard ref="ProjectDashboard" />
            </template>
            <template #member>
                <p-dynamic-view view_type="query-search-table"
                                :api-handler="apiHandler"
                                :data_source="dataSource"
                                :vbind="{responsiveStyle:{'height': 480+'px', 'overflow-y':'auto','overflow-x':'auto', 'padding': 0}}"
                                :data="null"
                                class="tab-bg"
                >
                    <template #toolbox-top>
                        <PPageTitle :title="'Member'" use-total-count :total-count="apiHandler.totalCount.value" />
                    </template>
                    <template #toolbox-left>
                        <div class="flex pr-4 toolbox-left">
                            <PIconTextButton style-type="primary-dark" class=" mr-4 add-btn"
                                             name="ic_plus_bold"
                                             @click="openMemberAddForm()"
                            >
                                {{ $t('BTN.ADD') }}
                            </PIconTextButton>
                            <p-button
                                outline
                                style-type="alert"
                                :disabled="apiHandler.tableTS.selectState.isNotSelected"
                                @click="memberDeleteClick"
                            >
                                Delete
                            </p-button>
                        </div>
                    </template>
                </p-dynamic-view>
            </template>
            <template #tag>
                <s-tags-panel
                    :is-show="singleItemTab.syncState.activeTab==='tag'"
                    :resource-id="projectId"
                    tag-page-name="projectTags"
                    class="tab-bg"
                />
            </template>
        </PTab>
        <p-button-modal
            :header-title="headerTitle"
            :centered="true"
            :scrollable="false"
            size="md"
            :fade="true"
            :backdrop="true"
            :visible.sync="projectDeleteFormVisible"
            :theme-color="themeColor"
            :footer-confirm-button-bind="{
                styleType: 'alert',
            }"
            @confirm="projectDeleteFormConfirm"
        >
            <template #body>
                <p class="delete-modal-content">
                    {{ modalContent }}
                </p>
            </template>
        </p-button-modal>
        <SProjectMemberAddModal v-if="memberAddFormVisible" :visible.sync="memberAddFormVisible" @confirm="addMember()" />
        <PTableCheckModal
            v-bind="deleteTS.state"
            :size="'lg'"
            :visible.sync="deleteTS.syncState.visible"
            @confirm="memberDeleteConfirm"
        />
    </general-page-layout>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, onMounted, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import GeneralPageLayout from '@/views/containers/page-layout/GeneralPageLayout.vue';
import PDynamicView from '@/components/organisms/dynamic-view/dynamic-view/DynamicView.vue';
import PDynamicDetails from '@/components/organisms/dynamic-view/dynamic-details/DynamicDetails.vue';

import PI from '@/components/atoms/icons/PI.vue';
import PIconButton from '@/components/molecules/buttons/IconButton.vue';
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PIconTextButton from '@/components/molecules/buttons/IconTextButton.vue';
import PPageTitle from '@/components/organisms/title/page-title/PageTitle.vue';
import PTabBar from '@/components/molecules/tabs/tab-bar/TabBar.vue';
import { makeTrItems } from '@/lib/view-helper/index';

import { DataSourceItem, fluentApi } from '@/lib/fluent-api';
import {
    AdminFluentAPI,
    QuerySearchTableFluentAPI,
    SearchTableFluentAPI,
    TabSearchTableFluentAPI,
} from '@/lib/api/table';
import { DictPanelAPI } from '@/lib/api/dict';
import STagsPanel from '@/components/organisms/panels/tag-panel/STagsPanel.vue';
import PDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/DynamicSubData.vue';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import SProjectMemberAddModal from '@/views/project/project/modules/ProjectMemberAddModal.vue';
import { ProjectModel } from '@/lib/fluent-api/identity/project';
import PTableCheckModal from '@/components/organisms/modals/table-modal/TableCheckModal.vue';
import { TableCheckModalState } from '@/components/organisms/modals/table-modal/toolset';
import ProjectDashboard from '@/views/project/project/pages/ProjectDashboard.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';
import { showErrorMessage } from '@/lib/util';
import {
    DefaultSingleItemTabBarQSProps,
    RouterTabBarToolSet,
} from '@/components/molecules/tabs/tab-bar/toolset';
import { propsCopy } from '@/lib/router-query-string';
import { ComponentInstance } from '@vue/composition-api/dist/component';

export default {
    name: 'ProjectDetail',
    components: {
        ProjectDashboard,
        PTableCheckModal,
        PButtonModal,
        GeneralPageLayout,
        PDynamicView,
        STagsPanel,
        PPageTitle,
        PTab,
        PI,
        PIconButton,
        PButton,
        SProjectMemberAddModal,
        PIconTextButton,
    },
    props: {
        ...DefaultSingleItemTabBarQSProps,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentInstance;
        const projectId = computed<string>(() => context.root.$route.params.id as string);
        const item = ref({} as ProjectModel);
        const state = reactive({
            projectName: '',
            projectId,
        });

        const getProject = async (id) => {
            const resp = await fluentApi.identity().project().get()
                .setId(id)
                .execute();
            if (resp) {
                item.value = resp.data;
            }
        };

        onMounted(async () => {
            await getProject(projectId.value);
        });

        watch(projectId, (after, before) => {
            if (after && after !== before) {
                getProject(after);
            }
        });

        const singleItemTab = new RouterTabBarToolSet(
            vm,
            undefined,
            undefined,
            {
                tabs: computed(() => makeTrItems([
                    ['summary', 'COMMON.SUMMARY', { keepAlive: true }],
                    ['member', 'COMMON.MEMBER'],
                    ['tag', 'TAB.TAG'],
                ],
                context.parent)),
            },
        );
        singleItemTab.syncState.activeTab = 'summary';

        // Auto Complete Handler for query search bar
        const projectKeyAutoCompletes = ['project_id'];
        const projectACHandlerMeta = {
            handlerClass: QuerySearchTableACHandler,
            args: {
                keys: projectKeyAutoCompletes,
                suggestKeys: projectKeyAutoCompletes,
            },
        };

        // List api Handler for query search table
        const MemberListAction = fluentApi.identity().project().memberList().setId(projectId.value);
        const apiHandler = new QuerySearchTableFluentAPI(MemberListAction, {
            shadow: false,
            border: false,
            padding: true,
            selectable: true,
            dragable: true,
        }, undefined, projectACHandlerMeta);
        const dataSource: DataSourceItem[] = [
            { name: 'ID', key: 'user_info.user_id' },
            { name: 'Name', key: 'user_info.name' },
            { name: 'State', key: 'user_info.state' },
            { name: 'Email', key: 'user_info.email' },
            { name: 'Mobile', key: 'user_info.mobile' },
            { name: 'Group', key: 'user_info.group' },
            { name: 'Language', key: 'user_info.language' },
        ];

        // Tag
        const tagsApi = new DictPanelAPI(fluentApi.identity().project());
        const loadTag = async () => {
            tagsApi.setId(projectId.value);
            tagsApi.ts.toReadMode();
            await tagsApi.getData();
        };
        loadTag();

        // Member modal
        const formState = reactive({
            projectDeleteFormVisible: false,
            headerTitle: '',
            themeColor: '',
            modalContent: '',
            memberAddFormVisible: false,
            memberDeleteFormVisible: false,
        });

        const openProjectDeleteForm = () => {
            formState.projectDeleteFormVisible = true;
            formState.headerTitle = 'Delete Project';
            formState.themeColor = 'alert';
            formState.modalContent = 'Are you sure you want to delete this Project?';
        };

        const projectDeleteFormConfirm = () => {
            fluentApi.identity().project().delete().setId(projectId.value)
                .execute()
                .then(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'Success',
                        text: 'Delete Project',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .catch((e) => {
                    showErrorMessage('Delete Project Fail', e, context.root);
                })
                .finally(() => {
                        vm?.$router.push({
                            name: 'projectMain',
                        });
                });
            formState.projectDeleteFormVisible = false;
        };
        const openMemberAddForm = () => {
            formState.memberAddFormVisible = true;
        };

        const addMember = async () => {
            await apiHandler.getData();
        };

        const deleteTS = new TableCheckModalState({
            fields: [{
                name: 'user_info.user_id', label: vm?.$t('FIELD.ID'),
            },
            {
                name: 'user_info.name', label: vm?.$t('FIELD.NAME'),
            },
            {
                name: 'user_info.email', label: vm?.$t('FIELD.EMAIL'),
            },
            ],
        });

        const deleteTargetHandler = ref<any>(null);
        const memberDeleteAction = fluentApi.identity().project()
            .removeMember()
            .setId(projectId.value);

        // deleteAction.value = memberDeleteAction.setSubIds(deleteTS.state.items);
        const memberDeleteClick = () => {
            deleteTS.state.mode = 'delete';
            deleteTS.state.action = memberDeleteAction;
            deleteTS.state.items = apiHandler.tableTS.selectState.selectItems as any[];
            deleteTS.state.headerTitle = 'Delete Member';
            deleteTS.state.subTitle = 'Are you sure want to remove a following members from Project?';
            deleteTS.state.themeColor = 'alert';
            deleteTS.syncState.visible = true;
        };

        const memberDeleteConfirm = async (items) => {
            await memberDeleteAction.setSubIds(items.map(it => it.user_info.user_id)).execute()
                .then(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'success',
                        title: 'Success',
                        text: 'Sucessfully Deleted',
                        duration: 2000,
                        speed: 1000,
                    });
                }).catch((e) => {
                    showErrorMessage('Fail to Delete Member', e, context.root);
                })
                .finally(() => {
                    apiHandler.getData();
                });
            deleteTS.syncState.visible = false;
        };

        const routerHandler = async () => {
            const prop = propsCopy(props);
            singleItemTab.applyDisplayRouter(prop);
        };
        onMounted(async () => {
            await routerHandler();
        });

        return {
            ...toRefs(state),
            singleItemTab,
            apiHandler,
            dataSource,
            item,
            // ...toRefs(singleItemTab),
            tagsApi,
            ...toRefs(formState),
            deleteTS,
            openProjectDeleteForm,
            projectDeleteFormConfirm,
            openMemberAddForm,
            addMember,
            memberDeleteClick,
            memberDeleteConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .p-page-title{
        &::v-deep .title {
             @apply text-2xl;
         }
        &::v-deep .extra {
             @apply text-base text-gray-400 mt-1;
         }
    }
    .p-tab{
        &::v-deep {
                .p-tab-bar{
                    border-color:#f8f8fc;
                }
                .tab-pane   {
                    @apply pb-0;
                }
            }
        }

    .delete-btn {
        @apply ml-3 cursor-pointer;
    }

    .tab-bg{
        @apply bg-white border border-gray-200 rounded-sm pb-8;
    }
</style>
