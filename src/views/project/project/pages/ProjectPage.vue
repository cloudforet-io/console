<template>
    <fragment>
        <top-notification v-if="projectState.isPermissionDenied">
            <div>{{$t('PROJECT.LANDING.TOP_NOTI_PERMISSION_REQUIRED_1')}} <br>
                {{$t('PROJECT.LANDING.TOP_NOTI_PERMISSION_REQUIRED_2')}}</div>
        </top-notification>
        <p-vertical-page-layout :min-width="260" :init-width="260" :max-width="400">
            <template #sidebar="{width}">
                <div class="sidebar-container">
                    <div class="sidebar-item-wrapper">
                        <header>
                            <span class="title">{{ $t('PROJECT.LANDING.FAVORITES') }}&nbsp;<span class="count">({{ favoriteItems.length }})</span></span>
                        </header>
                        <favorite-list :items="favoriteItems" :before-route="beforeFavoriteRoute" @delete="onFavoriteDelete">
                            <template #icon="{item}">
                                <p-i :name="item.id.startsWith('project') ? 'ic_tree_project' : 'ic_tree_project-group'"
                                     width="1rem" height="1rem" color="inherit transparent"
                                />
                            </template>
                        </favorite-list>
                    </div>

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
                                            @list="onProjectGroupList"
                                            @select="onSelectTreeItem"
                                            @create="openProjectGroupForm"
                                            @mounted="init"
                        />
                    </div>
                </div>
            </template>
            <template #default>
                <div class="page-wrapper">
                    <div class="parents-info">
                        <span v-if="projectGroupNavigation.length > 0" class="group-name">
                            <p-breadcrumbs :routes="projectGroupNavigation" @click="onProjectGroupNavClick" />
                        </span>
                    </div>
                    <p-page-title :title="projectState.groupName ? projectState.groupName : $t('PROJECT.LANDING.ALL_PROJECT')"
                                  use-total-count
                                  :total-count="totalCount"
                    >
                        <template #extra>
                            <span class="favorite-btn-wrapper">
                                <favorite-button v-if="projectState.groupId && !projectState.isPermissionDenied" :item-id="projectState.groupId"
                                                 favorite-type="projectGroup"
                                                 resource-type="identity.ProjectGroup"
                                />
                            </span>
                            <div class="btns">
                                <p-icon-text-button v-if="!projectState.groupId"
                                                    style-type="primary-dark"
                                                    outline
                                                    name="ic_plus_bold"
                                                    @click="openProjectGroupForm(null)"
                                >
                                    {{ $t('PROJECT.LANDING.CREATE_GROUP') }}
                                </p-icon-text-button>
                                <p-dropdown-menu-btn v-if="projectState.groupId && !projectState.isPermissionDenied"
                                                     :menu="settingMenu"
                                                     button-only
                                                     button-icon="ic_setting"
                                                     @edit:select="openProjectGroupEditForm"
                                                     @delete:select="openProjectGroupDeleteForm"
                                />
                                <div v-if="projectState.groupId && !projectState.isPermissionDenied"
                                     v-tooltip.top="$t('PROJECT.LANDING.MANAGE_PROJECT_GROUP_MEMBER')"
                                     class="project-group-member-button"
                                     :group-id="projectState.groupId"
                                     @click="openProjectGroupMemberPage"
                                >
                                    <p-i name="ic_member"
                                         width="1rem" height="1rem"
                                         color="inherit transparent"
                                    />
                                    <span class="text">{{ projectState.groupMemberCount }}</span>
                                </div>
                                <p-icon-text-button v-if="projectState.groupId && !projectState.isPermissionDenied"
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
                    <project-card-list ref="projectListRef"
                                       class="card-container"
                                       :group-id="projectState.groupId"
                                       :search-text="projectState.searchText"
                                       :parent-groups="parentGroups"
                                       :no-project-group="noProjectGroup"
                                       :is-permission-denied="projectState.isPermissionDenied"
                                       @list="onProjectList"
                                       @create-project-group="openProjectGroupForm(null)"
                    />
                    <project-group-create-form-modal v-if="projectGroupFormVisible"
                                                     :id="projectState.groupId"
                                                     :parent="createTargetNode ? createTargetNode.node.data
                                                         : null"
                                                     :visible.sync="projectGroupFormVisible"
                                                     :update-mode="updateMode"
                                                     @create="onProjectGroupCreate"
                                                     @update="onProjectGroupUpdate"
                    />

                    <p-button-modal :header-title="$t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE')"
                                    centered
                                    :scrollable="false"
                                    size="md"
                                    fade
                                    :visible.sync="projectGroupDeleteFormVisible"
                                    theme-color="alert"
                                    :footer-confirm-button-bind="{
                                        styleType: 'alert',
                                    }"
                                    @confirm="projectGroupDeleteFormConfirm"
                    >
                        <template #body>
                            <div class="delete-modal-contents">
                                <p>
                                    {{ $t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.CONTENT') }}
                                </p>
                                <i18n path="PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.DESC" tag="p" class="desc">
                                    <template #deleteAllSubProjects>
                                        <strong>{{ $t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.DELETE_ALL_SUB_PROJECT') }}</strong>
                                    </template>
                                </i18n>
                            </div>
                        </template>
                    </p-button-modal>

                    <project-create-form-modal v-if="projectFormVisible && projectState.groupId"
                                               :visible.sync="projectFormVisible"
                                               :project-group-id="projectState.groupId"
                                               @confirm="projectFormConfirm($event)"
                    />
                    <project-group-member-page v-if="projectState.groupMemberPageVisible"
                                               :group-id="projectState.groupId"
                                               @close="projectState.groupMemberPageVisible = false"
                    />
                </div>
            </template>
        </p-vertical-page-layout>
    </fragment>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout from '@/views/common/components/page-layout/VerticalPageLayout.vue';

import {
    PI, PPageTitle, PBreadcrumbs, PIconTextButton, PButtonModal, PButton, PDropdownMenuBtn,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import ProjectGroupCreateFormModal from '@/views/project/project/modules/ProjectGroupCreateFormModal.vue';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import ProjectSearch from '@/views/project/project/modules/ProjectSearch.vue';
import ProjectGroupTree from '@/views/project/project/modules/ProjectGroupTree.vue';
import { SpaceConnector } from '@/lib/space-connector';
import {
    ProjectGroup, ProjectItemResp, ProjectTreeItem,
} from '@/views/project/project/type';
import ProjectCardList from '@/views/project/project/modules/ProjectCardList.vue';
import FavoriteButton from '@/views/common/components/favorites/FavoriteButton.vue';
import { FavoriteItem } from '@/store/modules/favorite/type';
import FavoriteList from '@/views/common/components/favorites/FavoriteList.vue';
import ProjectCreateFormModal from '@/views/project/project/modules/ProjectCreateFormModal.vue';
import ProjectGroupMemberPage from '@/views/project/project/modules/ProjectGroupMemberPage.vue';
import { PERMISSION_TYPE } from '@/views/project/project/lib/config';
import TopNotification from '@/views/common/components/notification/TopNotification.vue';


export default {
    name: 'ProjectPage',
    components: {
        TopNotification,
        ProjectGroupMemberPage,
        ProjectCreateFormModal,
        FavoriteList,
        FavoriteButton,
        ProjectCardList,
        PBreadcrumbs,
        PDropdownMenuBtn,
        PButton,
        ProjectGroupTree,
        PVerticalPageLayout,
        PI,
        PPageTitle,
        ProjectSearch,
        PButtonModal,
        ProjectGroupCreateFormModal,
        PIconTextButton,
    },
    setup(props, { root }) {
        const vm: ComponentRenderProxy = getCurrentInstance() as ComponentRenderProxy;

        const projectState = reactive({
            groupId: undefined as string|undefined,
            groupName: '' as string|undefined,
            groupMemberCount: 0,
            searchText: '',
            groupMemberPageVisible: false,
            isPermissionDenied: false,
        });

        const state = reactive({
            favoriteItems: computed<FavoriteItem[]>(() => [
                ...vm.$store.getters['favorite/projectGroup/sortedItems'],
                ...vm.$store.getters['favorite/project/sortedItems'],
            ]),
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
            projectGroupFavorites: computed(() => {
                const res = {};
                vm.$store.state.favorite.projectGroup.items.forEach((d) => {
                    res[d.id] = d;
                });
                return res;
            }),
        });

        const formState = reactive({
            projectGroupFormVisible: false,
            projectFormVisible: false,
            projectGroupDeleteFormVisible: false,
            updateMode: false,
            createTargetNode: null as ProjectTreeItem|null,
        });

        const listProject = async () => {
            await state.projectListRef.listProjects(projectState.groupId, projectState.searchText);
        };

        const listProjectGroup = async () => {
            if (projectState.groupId) await state.treeRef.findNode(projectState.groupId);
            else await state.treeRef.listNodes();
        };

        const listAll = async () => {
            projectState.isPermissionDenied = false;
            await Promise.all([
                listProjectGroup(),
                listProject(),
            ]);
        };

        const onFavoriteDelete = (item: FavoriteItem) => {
            if (item.id.startsWith('project')) vm.$store.dispatch('favorite/project/removeItem', item);
            else vm.$store.dispatch('favorite/projectGroup/removeItem', item);
        };

        const beforeFavoriteRoute = async (item: FavoriteItem, e: MouseEvent) => {
            if (item.resourceType === 'identity.ProjectGroup') {
                e.preventDefault();
                if (projectState.groupId !== item.id) {
                    projectState.groupId = item.id;
                    vm.$nextTick(async () => {
                        await listAll();
                    });
                }
            }
        };

        const onChangePermission = async (permissionType) => {
            if (permissionType === PERMISSION_TYPE.allow) {
                projectState.isPermissionDenied = false;
            } else projectState.isPermissionDenied = true;
        };

        const getProjectGroupMemberCount = async () => {
            try {
                const res = await SpaceConnector.client.identity.projectGroup.member.list({
                    project_group_id: projectState.groupId,
                });
                projectState.groupMemberCount = res.total_count;
                await onChangePermission(PERMISSION_TYPE.allow);
            } catch (e) {
                await onChangePermission(PERMISSION_TYPE.deny);
                console.error(e);
            }
        };

        /** Handling Form */
        const openProjectGroupDeleteForm = () => {
            formState.projectGroupDeleteFormVisible = true;
        };

        const projectGroupDeleteFormConfirm = async () => {
            if (!projectState.groupId) return;
            try {
                await SpaceConnector.client.identity.projectGroup.delete({
                    project_group_id: projectState.groupId,
                });
                await vm.$store.dispatch('favorite/projectGroup/removeItem', { id: projectState.groupId });
                showSuccessMessage(vm.$t('PROJECT.LANDING.ALT_S_DELETE_PROJECT_GROUP'), '', root);
                state.treeRef.deleteSelectedNode();
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.LANDING.ALT_E_DELETE_PROJECT_GROUP', { action: vm.$t('PROJECT.LANDING.MODAL_DELETE_PROJECT_GROUP.TITLE') }), e, root);
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

        const openProjectGroupMemberPage = () => {
            projectState.groupMemberPageVisible = true;
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
            } else {
                projectState.groupId = undefined;
            }
            vm.$nextTick(async () => {
                await listAll();
            });
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
                await listProject();
            }
        };

        /** Query String */
        watch(() => projectState.groupId, (id) => {
            // eslint-disable-next-line camelcase
            vm.$router.replace({ query: { select_pg: id } }).catch(() => {});
        });

        /** Search */
        const onSearch = async (id, text) => {
            projectState.searchText = text;
            const beforeId = projectState.groupId;
            projectState.groupId = id;

            vm.$nextTick(async () => {
                if (beforeId !== id) {
                    await listAll();
                } else {
                    await listProject();
                }
            });
        };

        const onSelectTreeItem = async (id, name, parents: ProjectGroup[] = []) => {
            projectState.groupName = name;
            state.parentGroups = parents;

            if (projectState.groupId !== id) {
                projectState.groupId = id;
                vm.$nextTick(async () => {
                    await listAll();
                });
            }
        };

        const onProjectGroupList = (count) => {
            state.noProjectGroup = !count;
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
            await Promise.all([
                vm.$store.dispatch('resource/provider/load'),
                vm.$store.dispatch('resource/projectGroup/load'),
                vm.$store.dispatch('resource/project/load'),
                vm.$store.dispatch('favorite/projectGroup/load'),
                vm.$store.dispatch('favorite/project/load'),
            ]);

            const groupId = vm.$route.query.select_pg as string;

            if (groupId) {
                projectState.groupId = groupId;
                vm.$nextTick(async () => {
                    await Promise.all([listAll(), setGroupName(groupId)]);
                });
            } else {
                await listAll();
            }
        };

        watch([() => projectState.groupId, () => projectState.groupMemberPageVisible], async ([groupId, visible]) => {
            if ((groupId !== undefined && groupId) || visible) await getProjectGroupMemberCount();
        }, { immediate: true });


        return {
            projectState,
            ...toRefs(state),
            ...toRefs(formState),
            onFavoriteDelete,
            beforeFavoriteRoute,
            openProjectForm,
            openProjectGroupDeleteForm,
            openProjectGroupMemberPage,
            projectGroupDeleteFormConfirm,
            openProjectGroupEditForm,
            projectFormConfirm,
            openProjectGroupForm,
            onSearch,
            onSelectTreeItem,
            onProjectGroupUpdate,
            onProjectGroupCreate,
            onProjectGroupNavClick,
            onProjectGroupList,
            onProjectList,
            onChangePermission,
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
        @apply text-sm text-gray-900 font-semibold capitalize;
        line-height: 1.2;
    }
    .count {
        font-weight: normal;
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

/* right contents */
.page-wrapper {
    @apply flex flex-col w-full h-full;
}

.p-page-title::v-deep {
    @apply pb-5 border-b border-gray-200;
    .extra {
        @apply justify-between items-center;
    }
    .favorite-btn-wrapper {
        @apply mx-2;
    }
    .btns {
        @apply inline-flex items-center;
        .p-icon-text-button {
            @apply ml-4;
        }
        .p-dropdown-menu-btn {
            .p-icon-button {
                @apply border-transparent;
                border-radius: 50%;
                &:hover {
                    @apply bg-blue-200 text-secondary border-transparent;
                }
            }
        }
        .project-group-member-button {
            height: 2rem;
            cursor: pointer;
            border-radius: 6.25rem;
            padding: 0.375rem 0.5rem 0 0.5rem;
            margin-left: 0.75rem;
            &:hover {
                @apply bg-blue-200 text-secondary;
            }
            .text {
                vertical-align: middle;
                padding-left: 0.25rem;
            }
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

.card-container {
    @apply flex-grow;
}

.delete-modal-contents {
    line-height: 1.4;
    .desc {
        @apply mt-1 text-gray-600;
        font-size: 0.875rem;
    }
}
</style>
