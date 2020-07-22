<template>
    <general-page-layout>
        <div class="top flex">
            <PPageTitle :title="item.name" child @goBack="$router.go(-1)" />
            <p-icon-button name="ic_transhcan"
                           width="1.5rem" height="1.5rem" class="delete-btn"
                           @click="openProjectDeleteForm"
            />
            <p-icon-button name="ic_edit-text"
                           width="1.5rem" height="1.5rem" class="edit-btn"
                           @click="openProjectEditForm"
            />
        </div>
        <p class="float-right text-gray-500 -my-6">
            <b>Project ID:</b> {{ projectId }}
            <p-copy-button class="ml-2"
                           :value="projectId"
            />
        </p>
        <PTab :tabs="singleItemTab.state.tabs" :active-tab.sync="singleItemTab.syncState.activeTab"
              :style="{'background':'#f8f8fc', 'border-width':0+'px'}"
        >
            <template #summary>
                <project-dashboard ref="ProjectDashboard" />
            </template>
            <template #member>
                <p-toolbox-table class="member-tab"
                                 v-bind="memberApiHandler.tableTS.state"
                                 :sort-by.sync="memberApiHandler.tableTS.syncState.sortBy"
                                 :sort-desc.sync="memberApiHandler.tableTS.syncState.sortDesc"
                                 :select-index.sync="memberApiHandler.tableTS.syncState.selectIndex"
                                 :loading.sync="memberApiHandler.tableTS.syncState.loading"
                                 :this-page.sync="memberApiHandler.tableTS.syncState.thisPage"
                                 :page-size.sync="memberApiHandler.tableTS.syncState.pageSize"
                                 @changePageSize="memberApiHandler.getData"
                                 @changePageNumber="memberApiHandler.getData"
                                 @clickRefresh="memberApiHandler.getData"
                                 @changeSort="memberApiHandler.getData"
                >
                    <template #toolbox-top>
                        <p-page-title :title="'Member'" use-total-count :total-count="memberApiHandler.totalCount.value" />
                    </template>
                    <template #toolbox-left>
                        <div class="toolbox-left">
                            <p-icon-text-button style-type="primary-dark" class="mr-4 add-btn"
                                                name="ic_plus_bold"
                                                @click="openMemberAddForm()"
                            >
                                {{ $t('BTN.ADD') }}
                            </p-icon-text-button>
                            <p-button class="mr-4"
                                      :outline="true"
                                      style-type="alert"
                                      :disabled="memberApiHandler.tableTS.selectState.isNotSelected"
                                      @click="memberDeleteClick"
                            >
                                Delete
                            </p-button>
                            <p-search v-model="memberApiHandler.tableTS.searchText.value" @search="onSearch" @delete="onSearch()" />
                        </div>
                    </template>
                </p-toolbox-table>
                <!--                <p-dynamic-view view_type="query-search-table"-->
                <!--                                :api-handler="memberApiHandler"-->
                <!--                                :data_source="memberFields"-->
                <!--                                :vbind="{responsiveStyle:{'height': 480+'px', 'overflow-y':'auto','overflow-x':'auto', 'padding': 0}}"-->
                <!--                                :data="null"-->
                <!--                                class="tab-bg"-->
                <!--                >-->
                <!--                    <template #toolbox-top>-->
                <!--                        <PPageTitle :title="'Member'" use-total-count :total-count="memberApiHandler.totalCount.value" />-->
                <!--                    </template>-->
                <!--                    <template #toolbox-left>-->
                <!--                        <div class="flex pr-4 toolbox-left">-->
                <!--                            <PIconTextButton style-type="primary-dark" class=" mr-4 add-btn"-->
                <!--                                             name="ic_plus_bold"-->
                <!--                                             @click="openMemberAddForm()"-->
                <!--                            >-->
                <!--                                {{ $t('BTN.ADD') }}-->
                <!--                            </PIconTextButton>-->
                <!--                            <p-button-->
                <!--                                outline-->
                <!--                                style-type="alert"-->
                <!--                                :disabled="memberApiHandler.tableTS.selectState.isNotSelected"-->
                <!--                                @click="memberDeleteClick"-->
                <!--                            >-->
                <!--                                Delete-->
                <!--                            </p-button>-->
                <!--                        </div>-->
                <!--                    </template>-->
                <!--                </p-dynamic-view>-->
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
        <SProjectCreateFormModal v-if="projectEditFormVisible" :visible.sync="projectEditFormVisible"
                                 :update-mode="updateMode" :project-group-id="projectGroupId"
                                 :current-project="projectName"
                                 @confirm="projectEditFormConfirm($event)"
        />
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

import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PCopyButton from '@/components/molecules/buttons/copy-button/PCopyButton.vue';
import PTab from '@/components/organisms/tabs/tab/PTab.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import { makeTrItems } from '@/lib/view-helper/index';

import { fluentApi } from '@/lib/fluent-api';
import {
    SearchTableFluentAPI,
} from '@/lib/api/table';
import { DictPanelAPI } from '@/lib/api/dict';
import STagsPanel from '@/views/common/tags/tag-panel/TagsPanel.vue';
import SProjectCreateFormModal from '@/views/project/project/modules/ProjectCreateFormModal.vue';
import SProjectMemberAddModal from '@/views/project/project/modules/ProjectMemberAddModal.vue';
import { ProjectModel } from '@/lib/fluent-api/identity/project';
import PTableCheckModal from '@/components/organisms/modals/table-modal/PTableCheckModal.vue';
import { TableCheckModalState } from '@/components/organisms/modals/table-modal/toolset';
import ProjectDashboard from '@/views/project/project/pages/ProjectDashboard.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import { showErrorMessage } from '@/lib/util';
import {
    TabBarState,
} from '@/components/molecules/tabs/tab-bar/PTabBar.toolset';
import {
    makeQueryStringComputed,
    makeQueryStringComputeds,
    queryStringToNumberArray,
    selectIndexAutoReplacer,
} from '@/lib/router-query-string';
import { ComponentInstance } from '@vue/composition-api/dist/component';
import PToolboxTable from '@/components/organisms/tables/toolbox-table/PToolboxTable.vue';
import PSearch from '@/components/molecules/search/PSearch.vue';

export default {
    name: 'ProjectDetail',
    components: {
        PSearch,
        PToolboxTable,
        ProjectDashboard,
        PTableCheckModal,
        PButtonModal,
        GeneralPageLayout,
        STagsPanel,
        PPageTitle,
        PTab,
        PIconButton,
        PCopyButton,
        PButton,
        SProjectCreateFormModal,
        SProjectMemberAddModal,
        PIconTextButton,
    },
    setup(props, context) {
        const vm = getCurrentInstance() as ComponentInstance;
        const projectId = computed<string>(() => context.root.$route.params.id as string);
        const item = ref({} as ProjectModel);
        const state = reactive({
            projectName: '',
            projectGroupId: '',
            projectId,
        });

        const getProject = async (id) => {
            const resp = await fluentApi.identity().project().get()
                .setId(id)
                .execute();
            if (resp) {
                item.value = resp.data;
                state.projectGroupId = item.value.project_group_info.project_group_id;
                state.projectName = item.value.name;
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

        const singleItemTab = new TabBarState(
            {
                tabs: computed(() => makeTrItems([
                    ['summary', 'COMMON.SUMMARY', { keepAlive: true }],
                    ['member', 'COMMON.MEMBER'],
                    ['tag', 'TAB.TAG'],
                ],
                context.parent)),
            },
            {
                activeTab: 'summary',
            },
        );

        // List api Handler for query search table
        const MemberListAction = fluentApi.identity().project().memberList().setId(projectId.value);


        const memberApiHandler = new SearchTableFluentAPI(MemberListAction, {
            shadow: false,
            border: false,
            padding: true,
            selectable: true,
            draggable: true,
            fields: [
                { label: 'Name', name: 'user_info.name', type: 'item' },
                { label: 'State', name: 'user_info.state', type: 'item' },
                { label: 'ID', name: 'user_info.user_id', type: 'item' },
                { label: 'Email', name: 'user_info.email', type: 'item' },
                { label: 'Mobile', name: 'user_info.mobile', type: 'item' },
                { label: 'Group', name: 'user_info.group', type: 'item' },
                { label: 'Language', name: 'user_info.language', type: 'item' },
            ],
            responsiveStyle: {
                height: '30rem', overflow: 'auto', padding: 0,
            },
        }, undefined);


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
            projectEditFormVisible: false,
            updateMode: false,
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

        const projectDeleteFormConfirm = async () => {
            try {
                await fluentApi.identity().project().delete().setId(projectId.value)
                    .execute();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'Success',
                    text: 'Delete Project',
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                showErrorMessage('Delete Project Fail', e, context.root);
            } finally {
                formState.projectDeleteFormVisible = false;
                vm.$router.go(-1);
            }
        };

        const openProjectEditForm = () => {
            formState.projectEditFormVisible = true;
            formState.updateMode = true;
        };

        const projectEditFormConfirm = async (input) => {
            try {
                await fluentApi.identity().project().update().setParameter({
                    // eslint-disable-next-line camelcase
                    project_id: projectId.value,
                    ...input,
                })
                    .execute();

                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'Success',
                    text: 'Update Project',
                    duration: 2000,
                    speed: 1000,
                });
                item.value.name = input.name;
            } catch (e) {
                showErrorMessage('Update Project Fail', e, context.root);
            } finally {
                formState.projectEditFormVisible = false;
            }
        };


        const openMemberAddForm = () => {
            formState.memberAddFormVisible = true;
        };

        const addMember = async () => {
            await memberApiHandler.getData();
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

        const memberDeleteAction = fluentApi.identity().project()
            .removeMember()
            .setId(projectId.value);

        const memberDeleteClick = () => {
            deleteTS.state.mode = 'delete';
            deleteTS.state.action = memberDeleteAction;
            deleteTS.state.items = memberApiHandler.tableTS.selectState.selectItems as any[];
            deleteTS.state.headerTitle = 'Delete Member';
            deleteTS.state.subTitle = 'Are you sure want to remove a following members from Project?';
            deleteTS.state.themeColor = 'alert';
            deleteTS.syncState.visible = true;
        };

        const memberDeleteConfirm = async (items) => {
            try {
                await memberDeleteAction.setSubIds(items.map(it => it.user_info.user_id)).execute();
                context.root.$notify({
                    group: 'noticeTopRight',
                    type: 'success',
                    title: 'Success',
                    text: 'Sucessfully Deleted',
                    duration: 2000,
                    speed: 1000,
                });
            } catch (e) {
                showErrorMessage('Fail to Delete Member', e, context.root);
            } finally {
                deleteTS.syncState.visible = false;
                await memberApiHandler.getData();
            }
        };

        watch(() => singleItemTab.syncState.activeTab, (tab) => {
            if (tab === 'member') memberApiHandler.getData();
        });

        /** Query String */
        const queryRefs = {
            ...makeQueryStringComputeds(singleItemTab.syncState, {
                activeTab: { key: 'tab' },
            }),
            ...makeQueryStringComputeds(memberApiHandler.tableTS.syncState, {
                selectIndex: {
                    key: 'member_sl',
                    setter: queryStringToNumberArray,
                    autoReplacer: selectIndexAutoReplacer,
                },
            }),
            // eslint-disable-next-line camelcase
            member_search: makeQueryStringComputed(ref(undefined),
                { key: 'member_search' }),
        };

        // apply search keyword to query string only when search event occurred
        const onSearch = async (e) => {
            if (!e) memberApiHandler.tableTS.searchText.value = '';
            await memberApiHandler.getData();
            queryRefs.member_search.value = e || undefined;
        };

        const init = () => {
            // init search text by query string
            memberApiHandler.tableTS.searchText.value = vm.$route.query.member_search as string;
        };

        init();

        return {
            ...toRefs(state),
            singleItemTab,
            memberApiHandler,
            item,
            tagsApi,
            ...toRefs(formState),
            deleteTS,
            openProjectDeleteForm,
            projectDeleteFormConfirm,
            openProjectEditForm,
            projectEditFormConfirm,
            openMemberAddForm,
            addMember,
            memberDeleteClick,
            memberDeleteConfirm,
            onSearch,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .p-page-title {
        &::v-deep .title {
             @apply text-2xl;
         }
        &::v-deep .extra {
             @apply text-base text-gray-400 mt-1;
         }
    }
    .p-tab {
        &::v-deep {
                .p-tab-bar {
                    border-color: #f8f8fc;
                }
                .tab-pane {
                    @apply pb-0;
                }
            }
        }

    .delete-btn {
        @apply ml-3 cursor-pointer;
    }

    .tab-bg {
        @apply bg-white border border-gray-200 rounded-sm pb-8;
    }

    .member-tab {
        @apply border border-gray-200;
    }

    .toolbox-left {
        @apply w-full flex pr-4 ;
        .p-search {
            @apply w-full;
            max-width: 23.125rem;
        }
    }
</style>
