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
                        <sidebar-title :title="$t('PROJECT.LANDING.SEARCH')" />
                        <project-search />
                    </div>

                    <div class="sidebar-item-wrapper">
                        <project-tree :init-group-id="state.initGroupId"
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
                    <p-heading :title="storeState.groupName ? storeState.groupName : $t('PROJECT.LANDING.ALL_PROJECT')"
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
                                    <p-button v-if="!storeState.groupId && state.hasRootProjectGroupManagePermission"
                                              style-type="secondary"
                                              icon-left="ic_plus_bold"
                                              :disabled="!state.hasManagePermission"
                                              @click="openProjectGroupCreateForm"
                                    >
                                        {{ $t('PROJECT.LANDING.CREATE_GROUP') }}
                                    </p-button>
                                    <p-select-dropdown v-if="storeState.groupId && state.hasManagePermission && !state.isPermissionDenied"
                                                       :items="state.settingMenu"
                                                       style-type="icon-button"
                                                       button-icon="ic_settings-filled"
                                                       class="settings-button"
                                                       @select="onSelectSettingDropdown"
                                    />
                                    <div v-if="storeState.groupId && state.hasManagePermission && !state.isPermissionDenied"
                                         v-tooltip.top="$t('PROJECT.LANDING.MANAGE_PROJECT_GROUP_MEMBER')"
                                         class="project-group-member-button"
                                         :group-id="storeState.groupId"
                                         @click="openProjectGroupMemberPage"
                                    >
                                        <div>
                                            <p-i name="ic_users"
                                                 width="1rem"
                                                 height="1rem"
                                                 color="inherit transparent"
                                            />
                                            <span class="text">{{ state.groupMemberCount || 0 }}</span>
                                        </div>
                                    </div>
                                    <p-button v-if="storeState.groupId && state.hasManagePermission && !state.isPermissionDenied"
                                              style-type="primary"
                                              icon-left="ic_plus_bold"
                                              @click="openProjectForm"
                                    >
                                        <div class="truncate">
                                            {{ $t('PROJECT.LANDING.CREATE_PROJECT') }}
                                        </div>
                                    </p-button>
                                </div>
                            </div>
                        </template>
                    </p-heading>
                    <project-card-list class="card-container"
                                       :parent-groups="storeState.parentGroups"
                                       :manage-disabled="!state.hasRootProjectGroupManagePermission"
                                       @create-project-group="openProjectGroupCreateForm"
                    />

                    <project-group-form-modal v-if="storeState.projectGroupFormVisible" />

                    <project-group-delete-check-modal v-if="storeState.projectGroupDeleteCheckModalVisible" />

                    <project-group-member :visible="!!(state.groupMemberPageVisible && storeState.groupId)"
                                          :group-id="storeState.groupId"
                                          :manage-disabled="!state.hasManagePermission"
                                          @close="state.groupMemberPageVisible = false"
                    />
                </div>
            </template>
        </p-vertical-page-layout>
    </fragment>
</template>

<script setup lang="ts">
import {
    computed, getCurrentInstance, onUnmounted, reactive, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import {
    PI, PHeading, PBreadcrumbs, PButton, PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

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

import ProjectCardList from '@/services/project/modules/ProjectCardList.vue';
import ProjectGroupDeleteCheckModal from '@/services/project/modules/ProjectGroupDeleteCheckModal.vue';
import ProjectGroupFormModal from '@/services/project/modules/ProjectGroupFormModal.vue';
import ProjectSearch from '@/services/project/modules/ProjectSearch.vue';
import ProjectTree from '@/services/project/modules/ProjectTree.vue';
import ProjectGroupMember from '@/services/project/project-detail/project-member/modules/ProjectGroupMember.vue';
import { useProjectPageStore } from '@/services/project/store/project-page-store';
import type {
    ProjectGroup, ProjectGroupTreeItem,
} from '@/services/project/type';


const vm = getCurrentInstance()?.proxy as Vue;
const projectPageStore = useProjectPageStore();
/* Query String */
watch(() => projectPageStore.selectedItem, (selectedItem: ProjectGroupTreeItem) => {
    vm.$router.replace({
        query: {
            // eslint-disable-next-line camelcase
            select_pg: selectedItem.node?.data.id || null,
        },
    }).catch(() => {});
});

const storeState = reactive({
    groupId: computed(() => projectPageStore.groupId),
    groupName: computed(() => projectPageStore.groupName),
    searchText: computed(() => projectPageStore.searchText),
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
    initGroupId: vm.$route.query.select_pg as string,
    favoriteItems: computed<FavoriteItem[]>(() => [
        ...convertProjectGroupConfigToReferenceData(storeState.favoriteProjectGroups, storeState.projectGroups),
        ...convertProjectConfigToReferenceData(storeState.favoriteProjects, storeState.projects),
    ]),
    settingMenu: computed(() => [
        { name: 'edit', label: i18n.t('PROJECT.LANDING.ACTION_EDIT_GROUP_NAME'), type: 'item' },
        { name: 'delete', label: i18n.t('PROJECT.LANDING.ACTION_DELETE_THIS_GROUP'), type: 'item' },
    ] as MenuItem[]),
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
});

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
const onProjectGroupNavClick = async (item: {name: string; data: ProjectGroup}) => {
    if (item.data) await projectPageStore.selectNode(item.data.id);
};

/* Handling Forms */
const openProjectGroupDeleteCheckModal = () => {
    projectPageStore.openProjectGroupDeleteCheckModal(storeState.selectedItem);
};

const openProjectGroupUpdateForm = () => {
    projectPageStore.openProjectGroupUpdateForm(storeState.selectedItem);
};

const onSelectSettingDropdown = (name) => {
    switch (name) {
    case 'edit': openProjectGroupUpdateForm(); break;
    case 'delete': openProjectGroupDeleteCheckModal(); break;
    default: break;
    }
};

const openProjectGroupCreateForm = () => {
    projectPageStore.openProjectGroupCreateForm();
};

const openProjectGroupMemberPage = () => {
    state.groupMemberPageVisible = true;
};

const openProjectForm = () => {
    projectPageStore.openProjectCreateForm(storeState.selectedItem);
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

watch(() => vm.$route.query, async (after, before) => {
    if (after?.select_pg !== before?.select_pg && !Array.isArray(after.select_pg)) {
        projectPageStore.selectNode(after.select_pg);
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
    > div {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        margin-left: 0.75rem;
        .p-icon-text-button {
            @apply ml-4;
            flex-shrink: 0;
        }
        .settings-button {
            display: inline-flex;
        }
        .project-group-member-button {
            display: inline-flex;
            align-items: center;
            cursor: pointer;
            border-radius: 6.25rem;
            margin-left: 0.25rem;
            flex-shrink: 0;
            &:hover {
                @apply bg-blue-200 text-secondary;
            }
            > div {
                display: inline-flex;
                align-items: center;
                padding: 0 0.5rem;
                .text {
                    vertical-align: middle;
                    padding-left: 0.25rem;
                }
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

/* custom console component - vertical-page-layout */
:deep(.right-container) .header {
    padding: 0;
}
</style>
