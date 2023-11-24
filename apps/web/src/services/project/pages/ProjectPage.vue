<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, onUnmounted, reactive, ref, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PI, PHeading, PBreadcrumbs, PButton, PContextMenu, useContextMenuController,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    isInstanceOfAuthorizationError,
} from '@cloudforet/core-lib/space-connector/error';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { FavoriteItem } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';

import {
    convertProjectConfigToReferenceData,
    convertProjectGroupConfigToReferenceData,
} from '@/lib/helper/config-data-helper';

import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import FavoriteList from '@/common/modules/favorites/favorite-list/FavoriteList.vue';
import PVerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import ProjectMainCardList from '@/services/project/components/ProjectMainCardList.vue';
import ProjectMainProjectGroupDeleteCheckModal from '@/services/project/components/ProjectMainProjectGroupDeleteCheckModal.vue';
import ProjectMainProjectGroupFormModal from '@/services/project/components/ProjectMainProjectGroupFormModal.vue';
import ProjectMainProjectTree from '@/services/project/components/ProjectMainProjectTree.vue';
import ProjectMemberOverlay from '@/services/project/components/ProjectMemberOverlay.vue';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';
import type {
    ProjectGroupTreeNodeData, ProjectGroupTreeItem,
} from '@/services/project/types/project-tree-type';


const route = useRoute();
const router = useRouter();
const projectPageStore = useProjectPageStore();

/* Query String */
watch(() => projectPageStore.selectedItem, (selectedItem: ProjectGroupTreeItem) => {
    router.replace({
        query: {
            select_pg: selectedItem.node?.data.id || null,
        },
    }).catch(() => {});
});

const menuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);

const storeState = reactive({
    groupId: computed(() => projectPageStore.groupId),
    groupName: computed(() => projectPageStore.groupName),
    selectedItem: computed(() => projectPageStore.selectedItem),
    selectedNodeData: computed(() => projectPageStore.selectedNodeData),
    parentGroups: computed(() => projectPageStore.parentGroups),
    hasProjectGroup: computed(() => projectPageStore.hasProjectGroup),
    projectCount: computed(() => projectPageStore.projectCount),
    projects: computed(() => store.getters['reference/projectItems']),
    favoriteProjects: computed(() => store.state.favorite.projectItems),
    projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
    projectGroupFormVisible: computed(() => projectPageStore.projectGroupFormVisible),
    projectGroupDeleteCheckModalVisible: computed(() => projectPageStore.projectGroupDeleteCheckModalVisible),
    favoriteProjectGroups: computed(() => store.state.favorite.projectGroupItems),
});

const state = reactive({
    hasRootProjectGroupManagePermission: computed(() => state.hasManagePermission && store.getters['user/hasDomainRole']),
    hasManagePermission: useManagePermissionState(),
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
    groupMemberCount: undefined as number|undefined,
    groupMemberPageVisible: false,
    isPermissionDenied: computed(() => state.groupMemberCount === undefined),
    createDropdownMenuItems: computed<SelectDropdownMenuItem[]>(() => [
        {
            name: 'project',
            label: i18n.t('PROJECT.LANDING.PROJECT'),
        },
        {
            name: 'projectGroup',
            label: i18n.t('PROJECT.LANDING.PROJECT_GROUP'),
        },
    ]),
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
const onFavoriteDelete = (item: FavoriteItem) => {
    store.dispatch('favorite/removeItem', item);
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

/* Handling Forms */
const handleClickCreateButton = () => {
    showContextMenu();
};
const handleSelectCreateMenu = (item: SelectDropdownMenuItem) => {
    if (item.name === 'project') {
        projectPageStore.openProjectCreateForm(storeState.selectedItem);
    } else if (item.name === 'projectGroup') {
        openProjectGroupCreateForm();
    }
};
const openProjectGroupCreateForm = () => {
    projectPageStore.openProjectGroupCreateForm();
};

/* Member Count */
const getMemberCount = async (groupId: string) => {
    if (groupId) {
        try {
            const res = await SpaceConnector.client.identity.projectGroup.member.list({
                project_group_id: groupId,
            });
            state.groupMemberCount = res.total_count;
        } catch (e: any) {
            if (!isInstanceOfAuthorizationError(e)) {
                ErrorHandler.handleError(e);
            }
            state.groupMemberCount = undefined;
        }
    } else {
        state.groupMemberCount = undefined;
    }
};

watch(() => storeState.groupId, async (groupId) => {
    if (groupId) await getMemberCount(groupId);
});

// refresh permission info when get back from project group member page
watch(() => state.groupMemberPageVisible, async (visible) => {
    if (storeState.groupId && !visible) {
        await getMemberCount(storeState.groupId);
        if (state.isPermissionDenied) {
            projectPageStore.addPermissionInfo({
                [storeState.groupId]: false,
            });
        }
    }
});

watch(() => state.isPermissionDenied, (isPermissionDenied) => {
    if (!isPermissionDenied) {
        store.commit('error/setVisibleAuthorizationError', false);
    }
});

watch(() => route.query, async (after, before) => {
    if (after?.select_pg !== before?.select_pg && !Array.isArray(after.select_pg)) {
        await projectPageStore.selectNode(after.select_pg);
    }
});

onUnmounted(() => {
    projectPageStore.$reset();
    projectPageStore.$dispose();
});

/* Init */
(async () => {
    await Promise.allSettled([
        store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT),
        store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT_GROUP),
        store.dispatch('reference/project/load'),
        store.dispatch('reference/projectGroup/load'),
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
                                       @delete="onFavoriteDelete"
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
                            :init-group-id="state.initGroupId"
                            :manage-disabled="!state.hasManagePermission"
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
                            <div class="favorite-btn-wrapper">
                                <favorite-button v-if="storeState.groupId && !state.isPermissionDenied"
                                                 :favorite-items="state.favoriteItems"
                                                 :item-id="storeState.groupId"
                                                 :favorite-type="FAVORITE_TYPE.PROJECT_GROUP"
                                />
                            </div>
                            <div class="top-button-box">
                                <div>
                                    <p-button v-if="state.hasRootProjectGroupManagePermission"
                                              ref="targetRef"
                                              icon-left="ic_plus_bold"
                                              :disabled="!state.hasManagePermission"
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
                            </div>
                        </template>
                    </p-heading>
                    <project-main-card-list
                        class="card-container"
                        :parent-groups="storeState.parentGroups"
                        :manage-disabled="!state.hasRootProjectGroupManagePermission"
                        @create-project-group="openProjectGroupCreateForm"
                    />

                    <project-main-project-group-form-modal v-if="storeState.projectGroupFormVisible" />

                    <project-main-project-group-delete-check-modal v-if="storeState.projectGroupDeleteCheckModalVisible" />

                    <project-member-overlay
                        :visible="!!(state.groupMemberPageVisible && storeState.groupId)"
                        :group-id="storeState.groupId"
                        :manage-disabled="!state.hasManagePermission"
                        @close="state.groupMemberPageVisible = false"
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

.favorite-btn-wrapper {
    margin-right: 0.5rem;
    display: inline-flex;
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
