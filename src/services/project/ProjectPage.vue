<template>
    <fragment>
        <p-vertical-page-layout>
            <template #sidebar="{width}">
                <div class="sidebar-container">
                    <div class="sidebar-item-wrapper">
                        <sidebar-title :title="$t('PROJECT.LANDING.FAVORITES')">
                            <template #extra>
                                <span class="count">({{ favoriteItems.length }})</span>
                            </template>
                        </sidebar-title>
                        <favorite-list :items="favoriteItems" :before-route="beforeFavoriteRoute" @delete="onFavoriteDelete">
                            <template #icon="{item}">
                                <p-i :name="item.id.startsWith('project') ? 'ic_tree_project' : 'ic_tree_project-group'"
                                     width="1rem" height="1rem" color="inherit transparent"
                                />
                            </template>
                        </favorite-list>
                    </div>

                    <div class="sidebar-item-wrapper">
                        <sidebar-title :title="$t('PROJECT.LANDING.SEARCH')" />
                        <project-search />
                    </div>

                    <div class="sidebar-item-wrapper">
                        <project-tree :init-group-id="initGroupId" />
                    </div>
                </div>
            </template>
            <template #default>
                <div class="page-wrapper">
                    <div class="parents-info">
                        <span class="group-name">
                            <p-breadcrumbs :routes="projectGroupNavigation" @click="onProjectGroupNavClick" />
                        </span>
                    </div>
                    <p-page-title :title="storeState.groupName ? storeState.groupName : $t('PROJECT.LANDING.ALL_PROJECT')"
                                  use-total-count
                                  :total-count="storeState.projectCount || 0"
                    >
                        <template #extra>
                            <span class="favorite-btn-wrapper">
                                <favorite-button v-if="storeState.groupId && !isPermissionDenied" :item-id="storeState.groupId"
                                                 favorite-type="projectGroup"
                                                 resource-type="identity.ProjectGroup"
                                />
                            </span>
                            <div class="btns">
                                <p-icon-text-button v-if="!storeState.groupId"
                                                    style-type="primary-dark"
                                                    outline
                                                    name="ic_plus_bold"
                                                    :disabled="!hasRootProjectPermission"
                                                    @click="openProjectGroupCreateForm"
                                >
                                    {{ $t('PROJECT.LANDING.CREATE_GROUP') }}
                                </p-icon-text-button>
                                <p-select-dropdown v-if="storeState.groupId && !isPermissionDenied"
                                                   :items="settingMenu"
                                                   type="icon-button"
                                                   button-icon="ic_setting"
                                                   @select="onSelectSettingDropdown"
                                />
                                <div v-if="storeState.groupId && !isPermissionDenied"
                                     v-tooltip.top="$t('PROJECT.LANDING.MANAGE_PROJECT_GROUP_MEMBER')"
                                     class="project-group-member-button"
                                     :group-id="storeState.groupId"
                                     @click="openProjectGroupMemberPage"
                                >
                                    <p-i name="ic_member"
                                         width="1rem" height="1rem"
                                         color="inherit transparent"
                                    />
                                    <span class="text">{{ groupMemberCount || 0 }}</span>
                                </div>
                                <p-icon-text-button v-if="storeState.groupId && !isPermissionDenied"
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
                    <project-card-list class="card-container"
                                       :parent-groups="storeState.parentGroups"
                                       @create-project-group="openProjectGroupCreateForm"
                    />

                    <project-group-form-modal v-if="storeState.projectGroupFormVisible" />

                    <project-group-delete-check-modal v-if="storeState.projectGroupDeleteCheckModalVisible" />

                    <project-group-member v-if="groupMemberPageVisible && storeState.groupId"
                                          :group-id="storeState.groupId"
                                          @close="groupMemberPageVisible = false"
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
import PVerticalPageLayout from '@/common/modules/page-layouts/VerticalPageLayout.vue';

import {
    PI, PPageTitle, PBreadcrumbs, PIconTextButton, PSelectDropdown,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import ProjectGroupFormModal from '@/services/project/modules/ProjectGroupFormModal.vue';
import ProjectSearch from '@/services/project/modules/ProjectSearch.vue';
import ProjectTree from '@/services/project/modules/ProjectTree.vue';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import {
    ProjectGroup,
} from '@/services/project/type';
import ProjectCardList from '@/services/project/modules/ProjectCardList.vue';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FavoriteItem } from '@/store/modules/favorite/type';
import FavoriteList from '@/common/modules/favorites/favorite-list/FavoriteList.vue';
import ProjectGroupMember from '@/services/project/project-detail/project-member/modules/ProjectGroupMember.vue';
import { store } from '@/store';
import ProjectPageStoreModule from '@/services/project/store';
import { ProjectPageState } from '@/services/project/store/type';
import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';
import ProjectGroupDeleteCheckModal from '@/services/project/modules/ProjectGroupDeleteCheckModal.vue';
import { registerServiceStore } from '@/common/composables/register-service-store';
import ErrorHandler from '@/common/composables/error/errorHandler';


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
        PPageTitle,
        ProjectSearch,
        ProjectGroupFormModal,
        PIconTextButton,
    },
    setup() {
        const vm: ComponentRenderProxy = getCurrentInstance() as ComponentRenderProxy;

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
            projectGroupFormVisible: computed(() => store.state.service.project.projectGroupFormVisible),
            projectGroupDeleteCheckModalVisible: computed(() => store.state.service.project.projectGroupDeleteCheckModalVisible),
        });

        const state = reactive({
            initGroupId: vm.$route.query.select_pg as string,
            favoriteItems: computed<FavoriteItem[]>(() => [
                ...store.getters['favorite/projectGroup/sortedItems'],
                ...store.getters['favorite/project/sortedItems'],
            ]),
            settingMenu: computed(() => [
                { name: 'edit', label: vm.$t('PROJECT.LANDING.ACTION_EDIT_GROUP_NAME'), type: 'item' },
                { name: 'delete', label: vm.$t('PROJECT.LANDING.ACTION_DELETE_THIS_GROUP'), type: 'item' },
            ] as MenuItem[]),
            projectGroupNavigation: computed(() => {
                const result = storeState.parentGroups.map(d => ({ name: d.name, data: d }));
                if (storeState.selectedNodeData) {
                    result.push({ name: storeState.groupName, data: storeState.selectedNodeData });
                }
                return [{ name: vm.$t('MENU.PROJECT.PROJECT'), data: null }, ...result];
            }),
            projectGroupFavorites: computed(() => {
                const res = {};
                store.state.favorite.projectGroup.items.forEach((d) => {
                    res[d.id] = d;
                });
                return res;
            }),
            groupMemberCount: 0 as number|undefined,
            groupMemberPageVisible: false,
            isPermissionDenied: computed(() => state.groupMemberCount === undefined),
            hasRootProjectPermission: computed(() => store.getters['user/hasDomainRole']),
        });


        /* Favorite */
        const onFavoriteDelete = (item: FavoriteItem) => {
            if (item.id.startsWith('project')) store.dispatch('favorite/project/removeItem', item);
            else store.dispatch('favorite/projectGroup/removeItem', item);
        };

        const beforeFavoriteRoute = async (item: FavoriteItem, e: MouseEvent) => {
            if (item.resourceType === 'identity.ProjectGroup') {
                e.preventDefault();
                if (storeState.groupId !== item.id) {
                    await store.dispatch('service/project/selectNode', item.id);
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
                } catch (e) {
                    state.groupMemberCount = undefined;
                    ErrorHandler.handleError(e);
                }
            } else {
                state.groupMemberCount = 0;
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

        /* Init */
        (async () => {
            await Promise.all([
                store.dispatch('resource/provider/load'),
                store.dispatch('resource/projectGroup/load'),
                store.dispatch('resource/project/load'),
                store.dispatch('favorite/projectGroup/load'),
                store.dispatch('favorite/project/load'),
            ]);
        })();


        return {
            storeState,
            ...toRefs(state),
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
                @apply border-transparent rounded-full;
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

</style>
