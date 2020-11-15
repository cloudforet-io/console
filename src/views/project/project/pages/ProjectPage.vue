<template>
    <p-vertical-page-layout :min-width="260" :init-width="260" :max-width="400">
        <template #sidebar="{width}">
            <div class="sidebar-container">
                <div class="sidebar-item-wrapper">
                    <header>
                        <span class="title">{{ $t('PROJECT.LANDING.SEARCH') }}</span>
                    </header>
                    <project-search :group-id="projectState.groupId"
                                    :group-name="projectState.groupName"
                                    @search="onSearch"
                    />
                </div>

                <div class="sidebar-item-wrapper">
                    <header>
                        <span class="title">{{ $t('PROJECT.LANDING.PROJECT_GROUPS') }}</span>
                        <p-button class="action-btn" @click="openProjectGroupForm(null)">
                            <p-i name="ic_plus" width="1rem" height="1rem"
                                 color="transparent inherit"
                            /> {{ $t('PROJECT.LANDING.CREATE') }}
                        </p-button>
                    </header>
                    <project-group-tree ref="treeRef"
                                        :search-text="projectState.searchText"
                                        :project-state="projectState"
                                        @empty="onProjectGroupEmpty"
                                        @select="onSelectTreeItem"
                                        @create="openProjectGroupForm"
                                        @mounted="init"
                    />
                </div>
            </div>
        </template>
        <template #default>
            <div class="parents-info">
                <span v-if="projectGroupNavigation.length > 0" class="group-name">
                    <p-page-navigation :routes="projectGroupNavigation" @click="onProjectGroupNavClick" />
                </span>
            </div>
            <p-page-title :title="projectState.groupName ? projectState.groupName
                              : $t('PROJECT.LANDING.ALL_PROJECT')"
                          use-total-count
                          :total-count="totalCount"
            >
                <template #extra-area>
                    <div class="btns">
                        <p-icon-text-button v-if="!projectState.groupId"
                                            style-type="primary-dark"
                                            outline
                                            name="ic_plus_bold"
                                            @click="openProjectGroupForm(null)"
                        >
                            {{ $t('PROJECT.LANDING.CREATE_GROUP') }}
                        </p-icon-text-button>
                        <p-dropdown-menu-btn v-if="projectState.groupId"
                                             :menu="settingMenu"
                                             button-only
                                             button-icon="ic_setting"
                                             button-style-type="primary-dark"
                                             @edit:select="openProjectGroupEditForm"
                                             @delete:select="openProjectGroupDeleteForm"
                        />
                        <p-icon-text-button v-if="projectState.groupId"
                                            style-type="primary-dark"
                                            name="ic_plus_bold"
                                            @click="openProjectForm"
                        >
                            <div class="truncate">
                                {{ $t('PROJECT.LANDING.CREATE_PROJECT') }}
                            </div>
                        </p-icon-text-button>
                    </div>
                </template>
            </p-page-title>
            <div class="pb-8">
                <project-card-list ref="projectListRef"
                                   :group-id="projectState.groupId"
                                   :search-text="projectState.searchText"
                                   :parent-groups="parentGroups"
                                   :no-project-group="noProjectGroup"
                                   @list="onProjectList"
                                   @create-project-group="openProjectGroupForm(null)"
                />
            </div>
            <s-project-group-create-form-modal v-if="projectGroupFormVisible"
                                               :id="projectState.groupId"
                                               :parent="createTargetNode ? createTargetNode.node.data
                                                   : null"
                                               :visible.sync="projectGroupFormVisible"
                                               :update-mode="updateMode"
                                               @create="onProjectGroupCreate"
                                               @update="onProjectGroupUpdate"
            />

            <p-button-modal
                :header-title="headerTitle"
                :centered="true"
                :scrollable="false"
                size="md"
                :fade="true"
                :backdrop="true"
                :visible.sync="projectGroupDeleteFormVisible"
                :theme-color="themeColor"
                :footer-confirm-button-bind="{
                    styleType: 'alert',
                }"
                @confirm="projectGroupDeleteFormConfirm"
            >
                <template #body>
                    <p>
                        {{ modalContent }}
                    </p>
                </template>
            </p-button-modal>

            <project-create-form-modal v-if="projectFormVisible && projectState.groupId"
                                       :visible.sync="projectFormVisible"
                                       :current-project="projectState.groupId"
                                       :project-group-id="projectState.groupId"
                                       @confirm="projectFormConfirm($event)"
            />
        </template>
    </p-vertical-page-layout>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, ref, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout from '@/views/common/page-layout/VerticalPageLayout.vue';

import PI from '@/components/atoms/icons/PI.vue';
import PPageTitle from '@/components/organisms/title/page-title/PPageTitle.vue';
import PPageNavigation from '@/components/molecules/page-navigation/PPageNavigation.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PButtonModal from '@/components/organisms/modals/button-modal/PButtonModal.vue';
import SProjectGroupCreateFormModal from '@/views/project/project/modules/ProjectGroupCreateFormModal.vue';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import ProjectSearch from '@/views/project/project/modules/ProjectSearch.vue';
import ProjectGroupTree from '@/views/project/project/modules/ProjectGroupTree.vue';
import PButton from '@/components/atoms/buttons/PButton.vue';
import PDropdownMenuBtn from '@/components/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import { MenuItem } from '@/components/organisms/context-menu/type';
import { SpaceConnector } from '@/lib/space-connector';
import { TranslateResult } from 'vue-i18n';
import {
    ProjectGroup, ProjectItemResp, ProjectState, ProjectTreeItem,
} from '@/views/project/project/type';
import ProjectCardList from '@/views/project/project/modules/ProjectCardList.vue';


export default {
    name: 'ProjectPage',
    components: {
        ProjectCardList,
        PPageNavigation,
        PDropdownMenuBtn,
        PButton,
        ProjectGroupTree,
        PVerticalPageLayout,
        PI,
        PPageTitle,
        ProjectSearch,
        PButtonModal,
        SProjectGroupCreateFormModal,
        PIconTextButton,
    },
    setup(props, { root }) {
        const vm: ComponentRenderProxy = getCurrentInstance() as ComponentRenderProxy;

        const projectState = reactive({
            groupId: '' as string|undefined,
            groupName: '' as string|undefined,
            searchText: '',
        });

        const state = reactive({
            settingMenu: computed(() => [
                { name: 'edit', label: vm.$t('PROJECT.LANDING.ACTION_EDIT_GROUP_NAME'), type: 'item' },
                { name: 'delete', label: vm.$t('PROJECT.LANDING.ACTION_DELETE_THIS_GROUP'), type: 'item' },
            ] as MenuItem[]),
            parentGroups: [] as ProjectGroup[],
            treeRef: null as any,
            projectGroupNavigation: computed(() => {
                const result = state.parentGroups.map(d => ({ name: d.name, data: d }));
                if (projectState.groupId) {
                    result.push({ name: projectState.groupName, data: { id: projectState.groupId, name: projectState.groupName } });
                }
                return [{ name: vm.$t('MENU.PROJECT.PROJECT'), data: null }, ...result];
            }),
            totalCount: 0,
            projectListRef: null as unknown as any,
            noProjectGroup: false,
        });

        const formState = reactive({
            projectGroupFormVisible: false,
            projectFormVisible: false,
            projectGroupDeleteFormVisible: false,
            headerTitle: '' as TranslateResult,
            themeColor: '',
            modalContent: '' as TranslateResult,
            updateMode: false,
            createTargetNode: null as ProjectTreeItem|null,
        });


        /** Handling Form */
        const openProjectGroupDeleteForm = () => {
            formState.projectGroupDeleteFormVisible = true;
            formState.headerTitle = vm.$t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP_TITLE');
            formState.themeColor = 'alert';
            formState.modalContent = vm.$t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP_CONTENT');
        };

        const projectGroupDeleteFormConfirm = async () => {
            if (!projectState.groupId) return;
            try {
                await SpaceConnector.client.identity.projectGroup.delete({
                    project_group_id: projectState.groupId,
                });
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_DELETE_PROJECT_GROUP'), '', root);
                state.treeRef.deleteSelectedNode();
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_DELETE_PROJECT_GROUP', { action: formState.headerTitle }), e, root);
            } finally {
                formState.projectGroupDeleteFormVisible = false;
            }
        };

        const openProjectGroupEditForm = () => {
            formState.updateMode = true;
            formState.projectGroupFormVisible = true;
        };

        const openProjectGroupForm = (createTargetNode: ProjectTreeItem|null) => {
            formState.updateMode = false;
            formState.createTargetNode = createTargetNode;
            formState.projectGroupFormVisible = true;
        };

        const onProjectGroupUpdate = async (item: ProjectGroup) => {
            projectState.groupName = item.name;
            state.treeRef.updateSelectedNode(item);
            formState.projectGroupFormVisible = false;
        };

        const onProjectGroupCreate = async (item: ProjectGroup) => {
            const newItem: ProjectItemResp = {
                ...item,
                item_type: 'PROJECT_GROUP',
                has_child: false,
            };

            await state.treeRef.addNode(newItem, formState.createTargetNode);
            formState.projectGroupFormVisible = false;
            state.noProjectGroup = false;
        };

        const onProjectGroupNavClick = async (item: {name: string; data: ProjectGroup}) => {
            if (item.data) {
                projectState.groupId = item.data.id;
                projectState.groupName = item.data.name;
                await state.treeRef.findNode(item.data.id);
            } else {
                await state.treeRef.listNodes();
            }
        };

        const openProjectForm = () => {
            formState.projectFormVisible = true;
        };

        const projectFormConfirm = async (item) => {
            try {
                await SpaceConnector.client.identity.project.create({
                    project_group_id: projectState.groupId,
                    ...item,
                });
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_CREATE_PROJECT'), '', root);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_CREATE_PROJECT'), e, root);
            } finally {
                formState.projectFormVisible = false;
                await state.projectListRef.listProjects();
            }
        };

        /** Query String */
        watch(() => projectState.groupId, (id) => {
            // eslint-disable-next-line camelcase
            vm.$router.replace({ query: { select_pg: id } }).catch(() => {});
        });

        /** Search */
        const onSearch = async (id, text) => {
            if (id) {
                if (id !== projectState.groupId) await state.treeRef.findNode(id);
            } else if (projectState.groupId) await state.treeRef.listNodes();

            projectState.groupId = id;
            projectState.searchText = text;
        };

        const onSelectTreeItem = async (id, name, parents: ProjectGroup[] = []) => {
            projectState.groupId = id;
            projectState.groupName = name;
            state.parentGroups = parents;
        };

        const onProjectGroupEmpty = () => {
            state.noProjectGroup = 0;
        };

        const onProjectList = (count) => {
            state.totalCount = count;
        };

        const setGroupName = async (groupId) => {
            try {
                const res = await SpaceConnector.client.identity.projectGroup.get({
                    project_group_id: groupId,
                });
                projectState.groupName = res.name;
            } catch (e) { console.error(e); }
        };


        const init = async () => {
            await vm.$store.dispatch('resource/provider/load');

            const groupId = vm.$route.query.select_pg as string;

            if (groupId) {
                await Promise.all([state.treeRef.findNode(groupId), setGroupName(groupId)]);
                projectState.groupId = groupId;
            } else {
                await state.treeRef.listNodes();
            }

            watch([() => projectState.groupId, () => projectState.searchText], async () => {
                await state.projectListRef.listProjects();
            }, { immediate: true });
        };


        return {
            projectState,
            ...toRefs(state),
            ...toRefs(formState),
            openProjectForm,
            openProjectGroupDeleteForm,
            projectGroupDeleteFormConfirm,
            openProjectGroupEditForm,
            projectFormConfirm,
            openProjectGroupForm,
            onSearch,
            onSelectTreeItem,
            onProjectGroupUpdate,
            onProjectGroupCreate,
            onProjectGroupNavClick,
            onProjectGroupEmpty,
            onProjectList,
            init,
        };
    },
};
</script>

<style lang="postcss" scoped>
.sidebar-container {
    @apply h-full relative;
}
.sidebar-item-wrapper {
    header {
        @apply flex pl-4 pt-8 pb-3 mb-3 border-b border-gray-200 items-center;
    }
    .title {
        @apply text-sm text-gray-500 font-semibold capitalize;
        line-height: 1.2;
    }
    .icon-help {
        @apply ml-2;
        cursor: help;
    }
    .action-btn {
        @apply ml-auto justify-end text-primary-dark;
        height: auto;
        font-size: 0.75rem;
        line-height: 1.2;
        &:hover {
            @apply text-secondary;
            cursor: pointer;
        }
    }
}

.p-page-title::v-deep {
    @apply flex w-full pb-5 border-b border-gray-200;
    .extra {
        @apply inline-flex flex-grow justify-between items-center;
    }
    .btns {
        @apply inline-flex items-center;
        .p-icon-text-button {
            @apply ml-4;
        }
    }
}

.parents-info {
    @apply flex items-center text-gray-900;
    height: 1rem;
    .group-name {
        @apply inline-flex items-center text-xs;
    }
    .text {
        @apply opacity-50;
        &.link {
            @apply cursor-pointer;
            &:hover {
                @apply opacity-100;
            }
        }
    }
}
</style>
