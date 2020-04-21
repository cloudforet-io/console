<template>
    <general-page-layout>
        <div class="top">
            <div class="project-info">
                <span>
                    <p-i name="ic_back" width="2rem" height="2rem"
                         cursor="pointer" margin-top="-10px"
                         @click="$router.push({name:'projectMain'})"
                    />
                </span>
                <span>{{ item.name || 'Project' }}</span>
                <p-i name="ic_transhcan" color="transparent inherit"
                     width="1.5rem" height="1.5rem" class="delete-btn"
                     @click="openProjectDeleteForm()"
                />
            </div>
        </div>
        <PTab :tabs="tabs" :active-tab.sync="activeTab">
            <template #summary="{height}">
                <project-dashboard ref="ProjectDashboard" />
            </template>
            <template #member="{height}">
                <p-dynamic-view view_type="query-search-table"
                                :api-handler="apiHandler"
                                :data_source="dataSource"
                                :vbind="{responsiveStyle:{'height': 480+'px', 'overflow-y':'auto','overflow-x':'auto', 'padding': 0}}"
                                :data="null"
                >
                    <template #toolbox-left>
                        <p-button style-type="primary-dark"
                                  @click="openMemberAddForm()"
                        >
                            {{ $t('BTN.ADD') }}
                        </p-button>
                        <p-button
                            class="toolbox-left-btn"
                            outline
                            style-type="alert"
                            :disabled="apiHandler.tableTS.selectState.isNotSelected"
                            @click="memberDeleteClick"
                        >
                            Delete
                        </p-button>
                    </template>
                </p-dynamic-view>
            </template>
            <template #Tags>
                <div class="tags">
                    <p-dict-panel :dict.sync="tagsApi.ts.syncState.dict"
                                  :edit-mode.sync="tagsApi.ts.syncState.editMode"
                                  v-on="tagsApi.ts.listeners"
                    />
                </div>
            </template>
        </PTab>
        <p-button-modal
            :header-title="headerTitle"
            :centered="true"
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
import PTab from '@/components/organisms/tabs/tab/Tab.vue';
import PButton from '@/components/atoms/buttons/Button.vue';
import PTabBar from '@/components/molecules/tabs/tab-bar/TabBar.vue';
import { makeTrItems } from '@/lib/view-helper';

import { DataSourceItem, fluentApi } from '@/lib/fluent-api';
import {
    AdminFluentAPI,
    QuerySearchTableFluentAPI,
    SearchTableFluentAPI,
    TabSearchTableFluentAPI,
} from '@/lib/api/table';
import { DictPanelAPI } from '@/lib/api/dict';
import PDictPanel from '@/components/organisms/panels/dict-panel/DictPanel.vue';
import PDynamicSubData from '@/components/organisms/dynamic-view/dynamic-subdata/DynamicSubData.vue';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import SProjectMemberAddModal from '@/views/identity/project/modules/ProjectMemberAddModal.vue';
import { ProjectModel } from '@/lib/fluent-api/identity/project';
import PTableCheckModal from '@/components/organisms/modals/table-modal/TableCheckModal.vue';
import { TableCheckModalState } from '@/components/organisms/modals/table-modal/toolset';
import ProjectDashboard from '@/views/identity/project/pages/ProjectDashboard.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/ButtonModal.vue';

export default {
    name: 'ProjectDetail',
    components: {
        ProjectDashboard,
        PTableCheckModal,
        PButtonModal,
        GeneralPageLayout,
        PDynamicView,
        PDictPanel,
        PTab,
        PI,
        PButton,
        SProjectMemberAddModal,
    },
    setup(props, context) {
        const vm = getCurrentInstance();
        const projectId = computed<string>(() => context.root.$route.params.id as string);
        const item = ref({} as ProjectModel);
        const state = reactive({
            projectName: '',
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

        // Tab
        const tabData = reactive({
            tabs: makeTrItems([
                ['summary', 'COMMON.SUMMARY', { keepAlive: true }],
                ['member', 'COMMON.MEMBER'],
                ['Tags', 'COMMON.TAG'],
            ],
            context.parent),
            activeTab: 'summary',
        });

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
                .catch(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Fail',
                        text: 'Delete Request Fail',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .finally(() => {
                    vm?.$router.push({
                        name: 'projectMain',
                    });
                });
            formState.projectDeleteFormVisible = false;
        };
        const openMemberAddForm = () => {
            console.log('open member add form');
            formState.memberAddFormVisible = true;
        };

        const addMember = async () => {
            console.log('add member');
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
                }).catch(() => {
                    context.root.$notify({
                        group: 'noticeBottomRight',
                        type: 'alert',
                        title: 'Fail',
                        text: 'Delete Fail',
                        duration: 2000,
                        speed: 1000,
                    });
                })
                .finally(() => {
                    apiHandler.getData();
                });
            deleteTS.syncState.visible = false;
        };


        return {
            ...toRefs(state),
            apiHandler,
            dataSource,
            item,
            ...toRefs(tabData),
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
    .project-info {
        padding-bottom: 36px;
        span {
            padding-right: 14.6px;
            font-weight: bold;
            font-size: 24px;
        }
    }

    .delete-btn {
        margin-top: -10px;
        cursor: pointer;
    }

    .tags {
        padding-top: 1rem;
        min-height: 560px;
    }
</style>
