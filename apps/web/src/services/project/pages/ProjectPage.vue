<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, onUnmounted, reactive, ref, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PI, PHeading, PBreadcrumbs, PButton, PContextMenu, useContextMenuController, PIconButton,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import type { FavoriteItem } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import {
    convertProjectConfigToReferenceData,
    convertProjectGroupConfigToReferenceData,
} from '@/lib/helper/config-data-helper';
import getRandomId from '@/lib/random-id-generator';

import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import FavoriteList from '@/common/modules/favorites/favorite-list/FavoriteList.vue';
import PVerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import ProjectMainCardList from '@/services/project/components/ProjectMainCardList.vue';
import ProjectMainProjectGroupDeleteCheckModal from '@/services/project/components/ProjectMainProjectGroupDeleteCheckModal.vue';
import ProjectMainProjectGroupFormModal from '@/services/project/components/ProjectMainProjectGroupFormModal.vue';
import ProjectMainProjectGroupMoveModal from '@/services/project/components/ProjectMainProjectGroupMoveModal.vue';
import ProjectMainProjectTree from '@/services/project/components/ProjectMainProjectTree.vue';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';
import type {
    ProjectGroupTreeNodeData, ProjectGroupTreeItem,
} from '@/services/project/types/project-tree-type';


const route = useRoute();
const router = useRouter();
const allReferenceStore = useAllReferenceStore();
const projectPageStore = useProjectPageStore();
const projectPageGetters = projectPageStore.getters;
const projectPageState = projectPageStore.state;
const userWorkspaceStore = useUserWorkspaceStore();

/* Query String */
watch(() => projectPageState.selectedItem, (selectedItem: ProjectGroupTreeItem) => {
    router.replace({
        query: {
            select_pg: selectedItem.node?.data.id || null,
        },
    }).catch(() => {});
});

const menuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);

const storeState = reactive({
    groupId: computed(() => projectPageGetters.groupId),
    groupName: computed(() => projectPageGetters.groupName),
    selectedItem: computed(() => projectPageState.selectedItem),
    selectedNodeData: computed(() => projectPageGetters.selectedNodeData),
    parentGroups: computed(() => projectPageGetters.parentGroups),
    projectCount: computed(() => projectPageState.projectCount),
    favoriteProjects: computed(() => store.state.favorite.projectItems),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    projectGroupFormVisible: computed(() => projectPageState.projectGroupFormVisible),
    projectGroupDeleteCheckModalVisible: computed(() => projectPageState.projectGroupDeleteCheckModalVisible),
    favoriteProjectGroups: computed(() => store.state.favorite.projectGroupItems),
});

const state = reactive({
    initGroupId: route.query.select_pg as string,
    favoriteItems: computed<FavoriteItem[]>(() => [
        ...convertProjectGroupConfigToReferenceData(storeState.favoriteProjectGroups, storeState.projectGroups),
        ...convertProjectConfigToReferenceData(storeState.favoriteProjects, storeState.projects),
    ]),
    projectGroupNavigation: computed(() => {
        const result = storeState.parentGroups.map((d) => ({ name: d.name, data: d }));
        if (storeState.selectedNodeData && storeState.groupName) {
            result.push({ name: storeState.groupName, data: storeState.selectedNodeData });
        }
        return [{ name: i18n.t('MENU.PROJECT'), data: null }, ...result];
    }),
    createDropdownMenuItems: computed<SelectDropdownMenuItem[]>(() => ([
        {
            name: 'project',
            label: i18n.t('PROJECT.LANDING.PROJECT') as string,
        },
        {
            name: 'projectGroup',
            label: i18n.t('PROJECT.LANDING.PROJECT_GROUP') as string,
        },
    ])),
    projectGroupModalVisible: false,
    projectTreeKey: getRandomId(),
});

const {
    visibleMenu,
    contextMenuStyle,
    showContextMenu,
    hideContextMenu,
} = useContextMenuController({
    useFixedStyle: true,
    targetRef,
    contextMenuRef: menuRef,
    menu: state.createDropdownMenuItems,
});
onClickOutside(menuRef, hideContextMenu);

/* Favorite */
const handleDeleteFavorite = (item: FavoriteItem) => {
    const _item = {
        ...item,
        workspaceId: userWorkspaceStore.getters.currentWorkspaceId,
    };
    store.dispatch('favorite/removeItem', _item);
};

const beforeFavoriteRoute = async (item: FavoriteItem, e: MouseEvent) => {
    if (item.itemType === FAVORITE_TYPE.PROJECT_GROUP) {
        e.preventDefault();
        if (storeState.groupId !== item.itemId) {
            await projectPageStore.selectNode(item.itemId);
        }
    }
};

/* Navigation */
const onProjectGroupNavClick = async (item: {name: string; data: ProjectGroupTreeNodeData}) => {
    if (item.data) await projectPageStore.selectNode(item.data.id);
};

/* Event */
const handleClickProjectGroupEditButton = () => {
    projectPageStore.openProjectGroupFormModal(storeState.selectedItem, true);
};
const handleClickProjectGroupDeleteButton = () => {
    projectPageStore.openProjectGroupDeleteCheckModal(storeState.selectedItem);
};
const handleOpenProjectGroupMoveModal = () => {
    state.projectGroupModalVisible = true;
};
const handleConfirmProjectGroupMoveModal = () => {
    state.projectTreeKey = getRandomId();
};

/* Handling Forms */
const handleClickCreateButton = () => {
    showContextMenu();
};
const handleSelectCreateMenu = (item: SelectDropdownMenuItem) => {
    if (item.name === 'project') {
        projectPageStore.openProjectFormModal(storeState.selectedItem);
    } else if (item.name === 'projectGroup') {
        projectPageStore.openProjectGroupFormModal(storeState.selectedItem);
    }
};

watch(() => route.query, async (after, before) => {
    if (after?.select_pg !== before?.select_pg && !Array.isArray(after.select_pg)) {
        await projectPageStore.selectNode(after.select_pg);
    }
});

onUnmounted(() => {
    projectPageStore.reset();
});

/* Init */
(async () => {
    await Promise.allSettled([
        store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT),
        store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT_GROUP),
    ]);
})();
</script>

<template>
    <fragment>
        <p-vertical-page-layout>
            <template #sidebar>
                <div class="sidebar-container">
                    <div class="sidebar-item-wrapper">
                        <sidebar-title :title="$t('PROJECT.LANDING.FAVORITES')">
                            <template #extra>
                                <span class="count">({{ state.favoriteItems.length }})</span>
                            </template>
                        </sidebar-title>
                        <favorite-list :items="state.favoriteItems"
                                       :before-route="beforeFavoriteRoute"
                                       @delete="handleDeleteFavorite"
                        >
                            <template #icon="{item}">
                                <p-i :name="item.itemType === FAVORITE_TYPE.PROJECT ? 'ic_document-filled' : 'ic_folder-filled'"
                                     width="1rem"
                                     height="1rem"
                                     color="inherit inherit"
                                />
                            </template>
                        </favorite-list>
                    </div>

                    <div class="sidebar-item-wrapper">
                        <project-main-project-tree
                            :key="state.projectTreeKey"
                            :init-group-id="state.initGroupId"
                        />
                    </div>
                </div>
            </template>
            <template #default>
                <div class="page-wrapper">
                    <div class="parents-info">
                        <span class="group-name">
                            <p-breadcrumbs :routes="state.projectGroupNavigation"
                                           @click="onProjectGroupNavClick"
                            />
                        </span>
                    </div>
                    <p-heading :title="storeState.groupName ? storeState.groupName : $t('PROJECT.LANDING.ALL_PROJECTS')"
                               use-total-count
                               :total-count="storeState.projectCount || 0"
                    >
                        <template #title-right-extra>
                            <div v-if="storeState.groupId"
                                 class="title-right-button-wrapper"
                            >
                                <favorite-button :favorite-items="state.favoriteItems"
                                                 :item-id="storeState.groupId"
                                                 :favorite-type="FAVORITE_TYPE.PROJECT_GROUP"
                                />
                                <template v-if="projectPageState.isWorkspaceOwner">
                                    <p-icon-button name="ic_edit-text"
                                                   style-type="transparent"
                                                   @click="handleClickProjectGroupEditButton"
                                    />
                                    <p-icon-button name="ic_move"
                                                   style-type="transparent"
                                                   @click="handleOpenProjectGroupMoveModal"
                                    />
                                    <p-icon-button name="ic_delete"
                                                   style-type="transparent"
                                                   @click="handleClickProjectGroupDeleteButton"
                                    />
                                </template>
                            </div>
                            <div v-if="projectPageState.isWorkspaceOwner"
                                 class="top-button-box"
                            >
                                <p-button ref="targetRef"
                                          icon-left="ic_plus_bold"
                                          @click="handleClickCreateButton"
                                >
                                    {{ $t('PROJECT.LANDING.CREATE') }}
                                </p-button>
                                <p-context-menu v-show="visibleMenu"
                                                ref="menuRef"
                                                class="create-context-menu"
                                                :style="contextMenuStyle"
                                                :menu="state.createDropdownMenuItems"
                                                @select="handleSelectCreateMenu"
                                />
                            </div>
                        </template>
                    </p-heading>
                    <project-main-card-list
                        class="card-container"
                        :parent-groups="storeState.parentGroups"
                    />

                    <project-main-project-group-form-modal v-if="storeState.projectGroupFormVisible" />
                    <project-main-project-group-delete-check-modal v-if="storeState.projectGroupDeleteCheckModalVisible" />
                    <project-main-project-group-move-modal v-if="state.projectGroupModalVisible"
                                                           :visible.sync="state.projectGroupModalVisible"
                                                           :is-project="false"
                                                           :target-id="storeState.groupId"
                                                           @confirm="handleConfirmProjectGroupMoveModal"
                    />
                </div>
            </template>
        </p-vertical-page-layout>
    </fragment>
</template>

<style lang="postcss" scoped>
.sidebar-container {
    @apply h-full relative;
    overflow: auto;
}
.sidebar-item-wrapper {
    .count {
        margin-left: 0.25rem;
        font-size: 0.875rem;
        line-height: 170%;
    }
}

/* right contents */
.page-wrapper {
    @apply flex flex-col w-full h-full;
}

.p-heading {
    @apply pb-5 border-b border-gray-200;
}

.title-right-button-wrapper {
    margin-right: 0.5rem;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
}
.top-button-box {
    display: inline-block;
    float: right;
    .create-context-menu {
        z-index: 10;
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

/* custom console component - vertical-page-layout */
:deep(.right-container) .header {
    padding: 0;
}
</style>
