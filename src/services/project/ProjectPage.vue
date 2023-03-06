<template>
    <fragment>
        <p-vertical-page-layout>
            <template #sidebar>
                <div class="sidebar-container">
                    <div class="sidebar-item-wrapper">
                        <sidebar-title :title="$t('PROJECT.LANDING.FAVORITES')">
                            <template #extra>
                                <span class="count">({{ favoriteItems.length }})</span>
                            </template>
                        </sidebar-title>
                        <favorite-list :items="favoriteItems"
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
                        <project-tree :init-group-id="initGroupId"
                                      :manage-disabled="!hasManagePermission"
                        />
                    </div>
                </div>
            </template>
            <template #default>
                <div class="page-wrapper">
                    <div class="parents-info">
                        <span class="group-name">
                            <p-breadcrumbs :routes="projectGroupNavigation"
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
                                <favorite-button v-if="storeState.groupId && !isPermissionDenied"
                                                 :favorite-items="favoriteItems"
                                                 :item-id="storeState.groupId"
                                                 :favorite-type="FAVORITE_TYPE.PROJECT_GROUP"
                                />
                            </div>
                            <div class="top-button-box">
                                <div>
                                    <p-button v-if="!storeState.groupId && hasRootProjectGroupManagePermission"
                                              style-type="secondary"
                                              icon-left="ic_plus_bold"
                                              :disabled="!hasManagePermission"
                                              @click="openProjectGroupCreateForm"
                                    >
                                        {{ $t('PROJECT.LANDING.CREATE_GROUP') }}
                                    </p-button>
                                    <p-select-dropdown v-if="storeState.groupId && hasManagePermission && !isPermissionDenied"
                                                       :items="settingMenu"
                                                       style-type="icon-button"
                                                       button-icon="ic_settings-filled"
                                                       class="settings-button"
                                                       @select="onSelectSettingDropdown"
                                    />
                                    <div v-if="storeState.groupId && hasManagePermission && !isPermissionDenied"
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
                                            <span class="text">{{ groupMemberCount || 0 }}</span>
                                        </div>
                                    </div>
                                    <p-button v-if="storeState.groupId && hasManagePermission && !isPermissionDenied"
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
                                       :manage-disabled="!hasRootProjectGroupManagePermission"
                                       @create-project-group="openProjectGroupCreateForm"
                    />

                    <project-group-form-modal v-if="storeState.projectGroupFormVisible" />

                    <project-group-delete-check-modal v-if="storeState.projectGroupDeleteCheckModalVisible" />

                    <project-group-member :visible="!!(groupMemberPageVisible && storeState.groupId)"
                                          :group-id="storeState.groupId"
                                          :manage-disabled="!hasManagePermission"
                                          @close="groupMemberPageVisible = false"
                    />
                </div>
            </template>
        </p-vertical-page-layout>
    </fragment>
</template>

<script lang="ts">
import {
    computed, getCurrentInstance, reactive, toRefs, watch,
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
import { registerServiceStore } from '@/common/composables/register-service-store';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import FavoriteList from '@/common/modules/favorites/favorite-list/FavoriteList.vue';
import PVerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import ProjectCardList from '@/services/project/modules/ProjectCardList.vue';
import ProjectGroupDeleteCheckModal from '@/services/project/modules/ProjectGroupDeleteCheckModal.vue';
import ProjectGroupFormModal from '@/services/project/modules/ProjectGroupFormModal.vue';
import ProjectSearch from '@/services/project/modules/ProjectSearch.vue';
import ProjectTree from '@/services/project/modules/ProjectTree.vue';
import ProjectGroupMember from '@/services/project/project-detail/project-member/modules/ProjectGroupMember.vue';
import ProjectPageStoreModule from '@/services/project/store';
import type { ProjectPageState } from '@/services/project/store/type';
import type {
    ProjectGroup,
} from '@/services/project/type';

export default {
    name: 'ProjectGroupPage',
    components: {
        ProjectGroupDeleteCheckModal,
        SidebarTitle,
        ProjectGroupMember,
        FavoriteList,
        FavoriteButton,
        ProjectCardList,
        PBreadcrumbs,
        PSelectDropdown,
        ProjectTree,
        PVerticalPageLayout,
        PI,
        PButton,
        PHeading,
        ProjectSearch,
        ProjectGroupFormModal,
    },
    setup() {
        const vm = getCurrentInstance()?.proxy as Vue;

        registerServiceStore<ProjectPageState>('project', ProjectPageStoreModule);

        /* Query String */
        store.subscribe(({ type, payload }) => {
            if (type === 'service/project/setSelectedItem') {
                vm.$router.replace({
                    query: {
                        // eslint-disable-next-line camelcase
                        select_pg: payload.node?.data.id || null,
                    },
                }).catch(() => {});
            }
        });

        const storeState = reactive({
            groupId: computed(() => store.getters['service/project/groupId']),
            groupName: computed(() => store.getters['service/project/groupName']),
            searchText: computed(() => store.state.service.project.searchText),
            selectedItem: computed(() => store.state.service.project.selectedItem),
            selectedNodeData: computed(() => store.getters['service/project/selectedNodeData']),
            parentGroups: computed(() => store.getters['service/project/parentGroups']),
            hasProjectGroup: computed(() => store.state.service.project.hasProjectGroup),
            projectCount: computed(() => store.state.service.project.projectCount),
            projects: computed(() => store.getters['reference/projectItems']),
            favoriteProjects: computed(() => store.state.favorite.projectItems),
            projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
            projectGroupFormVisible: computed(() => store.state.service.project.projectGroupFormVisible),
            projectGroupDeleteCheckModalVisible: computed(() => store.state.service.project.projectGroupDeleteCheckModalVisible),
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
                if (storeState.selectedNodeData) {
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
                    await store.dispatch('service/project/selectNode', item.itemId);
                }
            }
        };

        /* Navigation */
        const onProjectGroupNavClick = async (item: {name: string; data: ProjectGroup}) => {
            if (item.data) await store.dispatch('service/project/selectNode', item.data.id);
        };

        /* Handling Forms */
        const openProjectGroupDeleteCheckModal = () => {
            store.dispatch('service/project/openProjectGroupDeleteCheckModal', storeState.selectedItem);
        };

        const openProjectGroupUpdateForm = () => {
            store.dispatch('service/project/openProjectGroupUpdateForm', storeState.selectedItem);
        };

        const onSelectSettingDropdown = (name) => {
            switch (name) {
            case 'edit': openProjectGroupUpdateForm(); break;
            case 'delete': openProjectGroupDeleteCheckModal(); break;
            default: break;
            }
        };

        const openProjectGroupCreateForm = () => {
            store.dispatch('service/project/openProjectGroupCreateForm');
        };

        const openProjectGroupMemberPage = () => {
            state.groupMemberPageVisible = true;
        };

        const openProjectForm = () => {
            store.dispatch('service/project/openProjectCreateForm', storeState.selectedItem);
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
            await getMemberCount(groupId);
        });

        // refresh permission info when get back from project group member page
        watch(() => state.groupMemberPageVisible, async (visible) => {
            if (storeState.groupId && !visible) {
                await getMemberCount(storeState.groupId);
                if (state.isPermissionDenied) {
                    store.commit('service/project/addPermissionInfo', {
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
            if (after?.select_pg !== before?.select_pg) {
                await store.dispatch('service/project/selectNode', after.select_pg);
            }
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

        return {
            storeState,
            ...toRefs(state),
            FAVORITE_TYPE,
            onFavoriteDelete,
            beforeFavoriteRoute,
            onSelectSettingDropdown,
            openProjectGroupMemberPage,
            openProjectGroupCreateForm,
            onProjectGroupNavClick,
            openProjectForm,
        };
    },
};
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
