<template>
    <fragment>
        <top-notification v-if="isPermissionDenied">
            <div>
                {{ $t('PROJECT.LANDING.TOP_NOTI_PERMISSION_REQUIRED_1') }} <br>
                {{ $t('PROJECT.LANDING.TOP_NOTI_PERMISSION_REQUIRED_2') }}
            </div>
        </top-notification>
        <p-vertical-page-layout :min-width="260" :init-width="260" :max-width="400">
            <template #sidebar="{width}">
                <div class="sidebar-container">
                    <div class="sidebar-item-wrapper">
                        <sidebar-title :title="$t('PROJECT.LANDING.FAVORITES')">
                            <template #extra>
                                &nbsp;<span class="count">({{ favoriteItems.length }})</span>
                            </template>
                        </sidebar-title>
                        <favorite-list :items="favoriteItems" :before-route="beforeFavoriteRoute" @delete="onFavoriteDelete">
                            <template #icon="{item}">
                                <p-i name="ic_tree_project-group"
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
                        <project-group-tree :init-group-id="initGroupId" />
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
                                                    @click="openProjectGroupCreateForm(null)"
                                >
                                    {{ $t('PROJECT.LANDING.CREATE_GROUP') }}
                                </p-icon-text-button>
                                <p-dropdown-menu-btn v-if="storeState.groupId && !isPermissionDenied"
                                                     :menu="settingMenu"
                                                     button-only
                                                     button-icon="ic_setting"
                                                     @edit:select="openProjectGroupUpdateForm"
                                                     @delete:select="openProjectGroupDeleteCheckModal"
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
                    />

                    <project-group-form-modal />

                    <project-group-delete-check-modal />

                    <project-group-member-page v-if="groupMemberPageVisible"
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
    computed, getCurrentInstance, onMounted, onUnmounted, reactive, toRefs, watch,
} from '@vue/composition-api';
import PVerticalPageLayout from '@/common/components/layouts/VerticalPageLayout.vue';

import {
    PI, PPageTitle, PBreadcrumbs, PIconTextButton, PDropdownMenuBtn,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

import ProjectGroupFormModal from '@/views/project/project/modules/ProjectGroupFormModal.vue';
import ProjectSearch from '@/views/project/project/modules/ProjectSearch.vue';
import ProjectGroupTree from '@/views/project/project/modules/ProjectGroupTree.vue';
import { SpaceConnector } from '@/lib/space-connector';
import {
    ProjectGroup, ProjectTreeItem,
} from '@/views/project/project/type';
import ProjectCardList from '@/views/project/project/modules/ProjectCardList.vue';
import FavoriteButton from '@/common/modules/FavoriteButton.vue';
import { FavoriteItem } from '@/store/modules/favorite/type';
import FavoriteList from '@/common/modules/favorite-list/FavoriteList.vue';
import ProjectGroupMemberPage from '@/views/project/project/modules/ProjectGroupMemberPage.vue';
import TopNotification from '@/common/components/TopNotification.vue';
import { store } from '@/store';
import ProjectPageStoreModule from '@/views/project/project/store';
import { ProjectPageState } from '@/views/project/project/store/type';
import SidebarTitle from '@/common/components/SidebarTitle.vue';
import ProjectGroupDeleteCheckModal from '@/views/project/project/modules/ProjectGroupDeleteCheckModal.vue';


export default {
    name: 'ProjectPage',
    components: {
        ProjectGroupDeleteCheckModal,
        SidebarTitle,
        TopNotification,
        ProjectGroupMemberPage,
        FavoriteList,
        FavoriteButton,
        ProjectCardList,
        PBreadcrumbs,
        PDropdownMenuBtn,
        ProjectGroupTree,
        PVerticalPageLayout,
        PI,
        PPageTitle,
        ProjectSearch,
        ProjectGroupFormModal,
        PIconTextButton,
    },
    setup() {
        const vm: ComponentRenderProxy = getCurrentInstance() as ComponentRenderProxy;

        /* Ready ProjectPage Store */
        (() => {
            if (!store.hasModule('projectPage')) store.registerModule<ProjectPageState>('projectPage', ProjectPageStoreModule);

            // unregister when leave page
            onUnmounted(() => {
                store.unregisterModule('projectPage');
            });

            // this is for hot reloading
            onMounted(() => {
                if (!store.hasModule('projectPage')) store.registerModule<ProjectPageState>('projectPage', ProjectPageStoreModule);
            });
        })();

        const storeState = reactive({
            groupId: computed(() => store.getters['projectPage/groupId']),
            groupName: computed(() => store.getters['projectPage/groupName']),
            searchText: computed(() => store.state.projectPage.searchText),
            selectedNode: computed(() => store.state.projectPage.selectedNode),
            parentGroups: computed(() => store.getters['projectPage/parentGroups']),
            hasProjectGroup: computed(() => store.state.projectPage.hasProjectGroup),
            projectCount: computed(() => store.state.projectPage.projectCount),
            actionTargetNode: computed(() => store.state.projectPage.actionTargetNode),
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
                if (storeState.selectedNode) {
                    result.push({ name: storeState.groupName, data: storeState.selectedNode.data });
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
                    await store.dispatch('projectPage/selectNode', item.id);
                }
            }
        };


        /* Navigation */
        const onProjectGroupNavClick = async (item: {name: string; data: ProjectGroup}) => {
            if (item.data) await store.dispatch('projectPage/selectNode', item.data.id);
        };


        /* Handling Forms */
        const openProjectGroupDeleteCheckModal = () => {
            store.dispatch('projectPage/openProjectGroupDeleteCheckModal', storeState.selectedNode);
        };

        const openProjectGroupUpdateForm = () => {
            store.dispatch('projectPage/openProjectGroupUpdateForm', storeState.selectedNode);
        };

        const openProjectGroupCreateForm = (target?: ProjectTreeItem|null) => {
            store.dispatch('projectPage/openProjectGroupCreateForm', target);
        };

        const openProjectGroupMemberPage = () => {
            state.groupMemberPageVisible = true;
        };

        const openProjectForm = () => {
            store.dispatch('projectPage/openProjectCreateForm', storeState.selectedNode);
        };


        /* Member Count */
        watch(() => storeState.groupId, async (groupId) => {
            if (groupId) {
                try {
                    const res = await SpaceConnector.client.identity.projectGroup.member.list({
                        project_group_id: storeState.groupId,
                    });
                    state.groupMemberCount = res.total_count;
                } catch (e) {
                    state.groupMemberCount = undefined;
                    console.error(e);
                }
            } else {
                state.groupMemberCount = 0;
            }
        });

        /* Query String */
        store.subscribe(({ type, payload }) => {
            if (type === 'projectPage/setSelectedNode') {
                vm.$router.replace({
                    query: {
                        // eslint-disable-next-line camelcase
                        select_pg: payload?.data.id || null,
                    },
                }).catch(() => {});
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
            openProjectGroupDeleteCheckModal,
            openProjectGroupMemberPage,
            openProjectGroupUpdateForm,
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
        font-weight: normal;
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

</style>
