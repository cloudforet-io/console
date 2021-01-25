<template>
    <general-page-layout>
        <p-page-navigation :routes="pageNavigation" />
        <div class="top-wrapper">
            <p-page-title :title="item.name" child @goBack="$router.go(-1)" />
            <div class="btns">
                <span class="favorite-btn-wrapper">
                    <favorite-button :item-id="projectId"
                                     favorite-type="project"
                                     resource-type="identity.Project"
                    />
                </span>
                <p-icon-button name="ic_transhcan"
                               width="1.5rem" height="1.5rem" class="delete-btn"
                               @click="openProjectDeleteForm"
                />
                <p-icon-button name="ic_edit-text"
                               width="1.5rem" height="1.5rem" class="edit-btn"
                               @click="openProjectEditForm"
                />
            </div>
            <p class="copy-project-id">
                <strong class="label">{{ $t('PROJECT.DETAIL.PROJECT_ID') }}&nbsp; </strong>
                {{ projectId }}
                <p-copy-button class="icon"
                               :value="projectId"
                />
            </p>
        </div>

        <p-tab :tabs="singleItemTabState.tabs" :active-tab.sync="singleItemTabState.activeTab"
               class="tab-content"
               :class="[singleItemTabState.activeTab]"
        >
            <template #summary>
                <project-dashboard ref="ProjectDashboard" />
            </template>
            <template #member>
                <p-search-table class="member-tab"
                                :shadow="false"
                                :border="false"
                                selectable
                                :excel-visible="false"
                                :fields="memberTableState.fields"
                                :items="memberTableState.items"
                                :select-index.sync="memberTableState.selectIndex"
                                :loading="memberTableState.loading"
                                :style="{height: '30rem', padding: 0}"
                                @change="onChangeMemberTable"
                >
                    <template #toolbox-top>
                        <p-panel-top :title="$t('PROJECT.DETAIL.MEMBER_TITLE')" use-total-count :total-count="memberTableState.totalCount" />
                    </template>
                    <template #toolbox-left>
                        <p-icon-text-button style-type="primary-dark" class="mr-4 add-btn"
                                            name="ic_plus_bold"
                                            @click="openMemberAddForm()"
                        >
                            {{ $t('PROJECT.DETAIL.ADD') }}
                        </p-icon-text-button>
                        <p-button class="mr-4"
                                  :outline="true"
                                  style-type="alert"
                                  :disabled="!memberTableState.selectedItems.length"
                                  @click="memberDeleteClick"
                        >
                            {{ $t('PROJECT.DETAIL.DELETE') }}
                        </p-button>
                    </template>
                    <template #col-resource_id-format="{ value }">
                        {{ users[value].name }}
                    </template>
                    <template #col-labels-format="{ value }">
                        <p v-if="value.length === 0"></p>
                        <p-badge v-for="(label, idx) in value" :key="idx" style-type="gray200"
                        >
                            {{ label }}
                        </p-badge>
                    </template>
                </p-search-table>
            </template>
            <template #tag>
                <tags-panel :resource-id="projectId"
                            resource-key="project_id"
                            resource-type="identity.Project"
                            class="tab-bg"
                />
            </template>
            <template #report>
                <project-report-tab :project-id="projectId" :project-name="projectName" />
            </template>
        </p-tab>
        <p-button-modal :header-title="headerTitle"
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
        <s-project-create-form-modal v-if="projectEditFormVisible" :visible.sync="projectEditFormVisible"
                                     :update-mode="updateMode" :project-group-id="projectGroupId"
                                     :current-project="projectName"
                                     @confirm="projectEditFormConfirm($event)"
        />
        <s-project-member-add-modal v-if="memberAddFormVisible" :visible.sync="memberAddFormVisible" @confirm="onAddMemberConfirm()" />
        <p-table-check-modal :fields="checkMemberDeleteState.fields"
                             :mode="checkMemberDeleteState.mode"
                             :items="checkMemberDeleteState.items"
                             :header-title="checkMemberDeleteState.headerTitle"
                             :sub-title="checkMemberDeleteState.subTitle"
                             :theme-color="checkMemberDeleteState.themeColor"
                             size="lg"
                             :visible.sync="checkMemberDeleteState.visible"
                             @confirm="memberDeleteConfirm"
        />
    </general-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, reactive, ref, toRefs, watch, getCurrentInstance, onMounted,
} from '@vue/composition-api';

import {
    PSearchTable, PTab, PPageTitle, PTableCheckModal, PButtonModal, PPanelTop,
    PTextList, PIconButton, PCopyButton, PIconTextButton, PPageNavigation, PButton, PBadge,
} from '@spaceone/design-system';
import { Options, SearchTableListeners } from '@spaceone/design-system/dist/src/organisms/tables/search-table/type';
import { TabItem } from '@spaceone/design-system/dist/src/organisms/tabs/tab/type';

import GeneralPageLayout from '@/views/common/components/page-layout/GeneralPageLayout.vue';
import FavoriteButton from '@/views/common/components/favorites/FavoriteButton.vue';
import TagsPanel from '@/views/common/components/tags/TagsPanel.vue';
import SProjectCreateFormModal from '@/views/project/project/modules/ProjectCreateFormModal.vue';
import SProjectMemberAddModal from '@/views/project/project/modules/ProjectMemberAddModal.vue';
import ProjectDashboard from '@/views/project/project/modules/ProjectDashboard.vue';

import ProjectReportTab from '@/views/project/project/modules/ProjectReportTab.vue';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { getPageStart } from '@/lib/component-utils/pagination';
import { ProjectModel } from '@/views/project/project/type';
import { TranslateResult } from 'vue-i18n';
import config from '@/lib/config';


export default {
    name: 'ProjectDetail',
    components: {
        PBadge,
        PTextList,
        FavoriteButton,
        PSearchTable,
        PPanelTop,
        ProjectReportTab,
        ProjectDashboard,
        PTableCheckModal,
        PButtonModal,
        GeneralPageLayout,
        TagsPanel,
        PPageTitle,
        PTab,
        PIconButton,
        PCopyButton,
        PButton,
        SProjectCreateFormModal,
        SProjectMemberAddModal,
        PIconTextButton,
        PPageNavigation,
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const projectId = computed<string>(() => root.$route.params.id as string);
        const item = ref({} as ProjectModel);
        const state = reactive({
            projectName: '',
            projectGroupId: '',
            projectGroupName: '',
            projectId,
            projectGroupNames: [],
            pageNavigation: computed(() => [
                { name: vm.$t('MENU.PROJECT.PROJECT'), path: '/project' },
                { name: state.projectGroupName, path: `/project?select_pg=${state.projectGroupId}` },
                // ...state.projectGroupNames.map(d => ({
                //     name: d.name,
                //     path: `/project?select_pg=${d.project_group_id}`,
                // })),
                { name: state.projectName },
            ]),
            reportState: computed(() => vm.$store.state.user.reportState),
            users: computed(() => vm.$store.state.resource.user.items),
        });

        const getProject = async (id) => {
            const resp = await SpaceConnector.client.identity.project.get({
                project_id: id,
            });
            if (resp) {
                item.value = resp;
                state.projectGroupId = item.value.project_group_info.project_group_id;
                state.projectGroupName = item.value.project_group_info.name;
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
        }, { immediate: true });


        /** Tabs */
        const singleItemTabState = reactive({
            tabs: computed(() => {
                const items: TabItem[] = [
                    { name: 'summary', label: vm.$t('PROJECT.DETAIL.TAB_SUMMARY'), keepAlive: true },
                    { name: 'member', label: vm.$t('PROJECT.DETAIL.TAB_MEMBER') },
                    { name: 'tag', label: vm.$t('PROJECT.DETAIL.TAB_TAG') },
                ];

                if (state.reportState) {
                    items.push({ name: 'report', label: vm.$t('PROJECT.DETAIL.TAB_REPORT'), beta: true } as TabItem);
                }
                return items;
            }),
            activeTab: 'summary',
        });

        // List api Handler for query search table
        const memberTableQuery = new ApiQueryHelper();
        const memberTableState = reactive({
            selectIndex: [] as number[],
            fields: [
                { label: 'User ID', name: 'user_id', type: 'item' },
                { label: 'User Name', name: 'resource_id', type: 'item' },
                { label: 'Role', name: 'role_info.name', type: 'item' },
                { label: 'Labels', name: 'labels', type: 'item' },
            ],
            items: [] as any[],
            loading: true,
            totalCount: 0,
            options: {
                searchText: '',
            } as Partial<Options>,
            selectedItems: computed(() => memberTableState.selectIndex.map(i => memberTableState.items[i])),
        });

        const listMemberApi = SpaceConnector.client.identity.project.member.list;
        const listMembers = async () => {
            memberTableState.loading = true;
            memberTableState.selectIndex = [];
            try {
                const res = await listMemberApi({
                    project_id: projectId.value,
                    query: memberTableQuery.data,
                });
                memberTableState.items = res.results.map(d => ({
                    ...d,
                    user_id: d.resource_id,
                }));
                memberTableState.totalCount = res.total_count;
            } catch (e) {
                memberTableState.items = [];
                memberTableState.totalCount = 0;
                console.error(e);
            }
            memberTableState.loading = false;
        };

        const onChangeMemberTable: SearchTableListeners['init'|'change'] = async (options, _changed?) => {
            const changed = _changed || options;

            if (changed.sortBy !== undefined) {
                memberTableState.options.sortBy = changed.sortBy;
                memberTableState.options.sortDesc = !!changed.sortDesc;
                memberTableQuery.setSort(changed.sortBy, changed.sortDesc);
            }
            if (changed.pageLimit !== undefined) {
                memberTableState.options.pageSize = changed.pageSize;
                memberTableQuery.setPageLimit(changed.pageSize);
            }
            if (changed.pageStart !== undefined) {
                memberTableState.options.thisPage = changed.thisPage;
                memberTableQuery.setPageStart(getPageStart(changed.thisPage, memberTableState.options.pageSize));
            }
            if (changed.searchText !== undefined) {
                memberTableState.options.searchText = changed.searchText;
                memberTableQuery.setFilters([{ v: changed.searchText }]);
            }
            await listMembers();
        };


        // Member modal
        const formState = reactive({
            projectDeleteFormVisible: false,
            projectEditFormVisible: false,
            updateMode: false,
            headerTitle: '' as TranslateResult,
            themeColor: '',
            modalContent: '' as TranslateResult,
            memberAddFormVisible: false,
            memberDeleteFormVisible: false,
        });

        const openProjectDeleteForm = () => {
            formState.projectDeleteFormVisible = true;
            formState.headerTitle = vm.$t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_TITLE');
            formState.themeColor = 'alert';
            formState.modalContent = vm.$t('PROJECT.DETAIL.MODAL_DELETE_PROJECT_CONTENT');
        };

        const projectDeleteFormConfirm = async () => {
            try {
                await SpaceConnector.client.identity.project.delete({
                    project_id: projectId.value,
                });
                await vm.$store.dispatch('favorite/project/removeItem', { id: projectId.value });
                showSuccessMessage(vm.$t('PROJECT.DETAIL.ALT_S_DELETE_PROJECT'), '', root);
                vm.$router.go(-1);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.DETAIL.ALT_E_DELETE_PROJECT'), e, root);
            } finally {
                formState.projectDeleteFormVisible = false;
            }
        };

        const openProjectEditForm = () => {
            formState.projectEditFormVisible = true;
            formState.updateMode = true;
        };

        const projectEditFormConfirm = async (input) => {
            try {
                await SpaceConnector.client.identity.project.update({
                    project_id: projectId.value,
                    ...input,
                });
                showSuccessMessage(vm.$t('PROJECT.DETAIL.ALT_S_UPDATE_PROJECT'), '', root);
                item.value.name = input.name;
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.DETAIL.ALT_E_UPDATE_PROJECT'), e, root);
            } finally {
                formState.projectEditFormVisible = false;
            }
        };


        const openMemberAddForm = () => {
            formState.memberAddFormVisible = true;
        };

        const onAddMemberConfirm = async () => {
            await listMembers();
        };

        const checkMemberDeleteState = reactive({
            fields: computed(() => [
                { name: 'resource_id', label: 'User ID' },
                // { name: '-', label: 'User Name' },
                { name: 'role_info.name', label: 'Role' },
                // { name: 'labels', label: 'Labels' },
            ]),
            mode: '',
            items: [] as any[],
            headerTitle: '' as TranslateResult,
            subTitle: '' as TranslateResult,
            themeColor: '',
            visible: false,
            action: null as any,
        });

        const memberDeleteClick = () => {
            checkMemberDeleteState.mode = 'delete';
            // checkMemberDeleteState.action = memberDeleteAction;
            checkMemberDeleteState.items = memberTableState.selectedItems as any[];
            checkMemberDeleteState.headerTitle = vm.$t('PROJECT.DETAIL.MODAL_DELETE_MEMBER_TITLE');
            checkMemberDeleteState.subTitle = vm.$t('PROJECT.DETAIL.MODAL_DELETE_MEMBER_CONTENT');
            checkMemberDeleteState.themeColor = 'alert';
            checkMemberDeleteState.visible = true;
        };

        const memberDeleteConfirm = async (items) => {
            try {
                await SpaceConnector.client.identity.project.member.remove({
                    project_id: projectId.value,
                    users: items.map(it => it.resource_id),
                });
                showSuccessMessage(vm.$t('PROJECT.DETAIL.ALT_S_DELETE_MEMBER'), '', root);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.DETAIL.ALT_E_DELETE_MEMBER'), e, root);
            } finally {
                checkMemberDeleteState.visible = false;
                await listMembers();
            }
        };

        watch(() => singleItemTabState.activeTab, (tab) => {
            if (tab === 'member') listMembers();
        }, { immediate: true });


        const apiQuery = new ApiQueryHelper();


        /** Init */
        (async () => {
            await Promise.all([
                // getPageNavigation(),
                vm.$store.dispatch('resource/project/load'),
                vm.$store.dispatch('favorite/project/load'),
                vm.$store.dispatch('resource/user/load'),
                vm.$store.dispatch('resource/provider/load'),
            ]);
        })();
        return {
            ...toRefs(state),
            ...toRefs(formState),
            singleItemTabState,
            memberTableState,
            checkMemberDeleteState,
            item,
            openProjectDeleteForm,
            projectDeleteFormConfirm,
            openProjectEditForm,
            projectEditFormConfirm,
            openMemberAddForm,
            onAddMemberConfirm,
            memberDeleteClick,
            memberDeleteConfirm,
            listMembers,
            onChangeMemberTable,
        };
    },
};
</script>

<style lang="postcss" scoped>
.top-wrapper {
    @apply mb-8 flex flex-wrap items-center;
    .btns {
        @apply flex-shrink-0 flex items-center;
        .favorite-btn-wrapper {
            @apply inline-flex ml-2;
        }
        .p-icon-text-button {
            @apply flex-shrink-0 ml-4;
        }
    }
    .copy-project-id {
        @apply flex-shrink-0 flex-grow inline-flex items-center justify-end text-gray-500;
        font-size: 0.875rem;
        height: 2rem;
        .label {
            @apply text-gray-dark;
        }
        .icon {
            @apply ml-2 text-gray-dark;
        }
    }
}
.p-page-title::v-deep {
    @apply mb-0;
    width: auto;
    .title {
        @apply text-2xl;
    }
}
.tab-content::v-deep {
    border: none;
    &.summary {
        .tab-pane {
            @apply border border-gray-200;
            padding: 2rem 1rem;
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
    >>> &.p-toolbox-table .toolbox {
        @apply pt-0;
    }
    .p-panel-top {
        @apply ml-0;
    }
}

.toolbox-left {
    @apply w-full flex pr-4 ;
    .p-search {
        @apply w-full;
    }
}
</style>
