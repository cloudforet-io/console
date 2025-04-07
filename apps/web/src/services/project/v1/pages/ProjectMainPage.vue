<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, onUnmounted, reactive, ref, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PHeading, PButton, PContextMenu, PIconButton, PHeadingLayout,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { MENU_ID } from '@/lib/menu/config';

import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import { indigo, peacock } from '@/styles/colors';

import ProjectGroupMemberManagementModal from '@/services/project/v1/components/ProjectGroupMemberManagementModal.vue';
import ProjectMain from '@/services/project/v1/components/ProjectMain.vue';
import ProjectMainDeleteModal from '@/services/project/v1/components/ProjectMainDeleteModal.vue';
import ProjectMainProjectGroupMoveModal from '@/services/project/v1/components/ProjectMainProjectGroupMoveModal.vue';
import { useProjectPageStore } from '@/services/project/v1/stores/project-page-store';
import { useProjectTreeStore } from '@/services/project/v1/stores/project-tree-store';


const gnbStore = useGnbStore();
// const gnbGetters = gnbStore.getters;
const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();
const projectTreeStore = useProjectTreeStore();
const projectPageStore = useProjectPageStore();
const projectPageState = projectPageStore.state;

const menuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);
const route = useRoute();

const storeState = reactive({
    userId: computed<string|undefined>(() => userStore.state.userId),
    groupName: computed(() => storeState.projectGroups[state.currentProjectGroupId]?.name),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
});

const state = reactive({
    currentProjectGroupId: computed(() => route.params.projectGroupId),
    createMenuVisible: false,
    createDropdownMenuItems: computed<SelectDropdownMenuItem[]>(() => ([
        {
            name: 'project',
            label: i18n.t('PROJECT.LANDING.PROJECT') as string,
            icon: 'ic_document-filled',
            iconColor: peacock[600],
        },
        {
            name: 'projectGroup',
            label: i18n.t('PROJECT.LANDING.PROJECT_GROUP') as string,
            icon: 'ic_folder-filled',
            iconColor: indigo[500],
        },
    ])),
    projectGroupModalVisible: false,
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: route.params.projectGroupId ? FAVORITE_TYPE.PROJECT_GROUP : FAVORITE_TYPE.MENU,
        id: route.params.projectGroupId ? state.currentProjectGroupId : MENU_ID.PROJECT,
    })),
    projectGroupMemberManagementModalVisible: false,
    projectGroupMemberCount: computed<number|undefined>(() => storeState.projectGroups?.[state.currentProjectGroupIds]?.data.users?.length),
});

onClickOutside(menuRef, () => {
    state.createMenuVisible = false;
});

/* Event */
const handleClickProjectGroupEditButton = () => {
    projectPageStore.setProjectGroupFormUpdateMode(true);
    projectPageStore.setProjectGroupFormVisible(true);
};
const handleClickProjectGroupDeleteButton = () => {
    projectPageStore.setProjectDeleteModalVisible(true);
};
const handleOpenProjectGroupMoveModal = () => {
    projectPageStore.setProjectGroupMoveModalVisible(true);
};

/* Handling Forms */
const handleClickAddProjectGroupMember = () => {
    state.projectGroupMemberManagementModalVisible = true;
};
const handleClickCreateButton = () => {
    state.createMenuVisible = !state.createMenuVisible;
};
const handleSelectCreateMenu = (item: SelectDropdownMenuItem) => {
    projectPageStore.setCurrentSelectedProjectGroupId(state.currentProjectGroupId);
    if (item.name === 'project') {
        projectPageStore.setProjectFormModalVisible(true);
    } else if (item.name === 'projectGroup') {
        projectPageStore.setProjectGroupFormUpdateMode(false);
        projectPageStore.setProjectGroupFormVisible(true);
    }
};
const handleUpdateProjectGroupMoveModal = (visible: boolean) => {
    projectPageStore.setProjectGroupMoveModalVisible(visible);
    if (projectPageState.currentSelectedProjectGroupId && !visible) {
        projectPageStore.setCurrentSelectedProjectGroupId(undefined);
    }
    if (projectPageState.currentSelectedProjectId && !visible) {
        projectPageStore.setCurrentSelectedProjectId(undefined);
    }
};
const handleUpdateDeleteModalVisible = (visible: boolean) => {
    projectPageStore.setProjectDeleteModalVisible(visible);
    if (projectPageState.currentSelectedProjectGroupId && !visible) {
        projectPageStore.setCurrentSelectedProjectGroupId(undefined);
    }
    if (projectPageState.currentSelectedProjectId && !visible) {
        projectPageStore.setCurrentSelectedProjectId(undefined);
    }
};

const handleRefreshTree = () => {
    projectTreeStore.refreshProjectTree();
};

watch(() => state.favoriteOptions, (favoriteOptions) => {
    gnbStore.setFavoriteItemId(favoriteOptions);
    if (!route.params.projectGroupId) {
        gnbStore.setBreadcrumbs([]);
    }
}, { immediate: true });

onUnmounted(() => {
    projectTreeStore.disposeProjectTree();
});
</script>

<template>
    <div class="page-wrapper">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="state.currentProjectGroupId ? storeState.projectGroups[state.currentProjectGroupId]?.name : $t('PROJECT.LANDING.ALL_PROJECTS')">
                    <template #title-right-extra>
                        <div v-if="state.currentProjectGroupId"
                             class="title-right-button-wrapper"
                        >
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
                    </template>
                </p-heading>
            </template>
            <template #extra>
                <p-button v-if="state.currentProjectGroupId"
                          style-type="tertiary"
                          icon-left="ic_member"
                          @click="handleClickAddProjectGroupMember"
                >
                    <span>{{ $t('PROJECT.LANDING.GROUP_MEMBER') }}</span>
                    <span v-if="state.projectGroupMemberCount"
                          class="pl-1"
                    >({{ state.projectGroupMemberCount }})</span>
                </p-button>
                <div v-if="projectPageState.isWorkspaceOwner"
                     class="create-button-wrapper"
                >
                    <p-button ref="targetRef"
                              icon-left="ic_plus_bold"
                              @click="handleClickCreateButton"
                    >
                        {{ $t('PROJECT.LANDING.CREATE') }}
                    </p-button>
                    <p-context-menu v-show="state.createMenuVisible"
                                    ref="menuRef"
                                    class="create-context-menu"
                                    no-select-indication
                                    :menu="state.createDropdownMenuItems"
                                    @select="handleSelectCreateMenu"
                    />
                </div>
            </template>
        </p-heading-layout>
        <project-main />
        <project-group-member-management-modal v-if="state.projectGroupMemberManagementModalVisible"
                                               :visible.sync="state.projectGroupMemberManagementModalVisible"
                                               :project-group-id="state.currentProjectGroupId"
        />
        <project-main-delete-modal v-if="projectPageState.projectDeleteModalVisible"
                                   :visible="projectPageState.projectDeleteModalVisible"
                                   :is-project="!!projectPageState.currentSelectedProjectId"
                                   :target-id="projectPageState.currentSelectedProjectId || projectPageState.currentSelectedProjectGroupId || state.currentProjectGroupId"
                                   :skip-redirect="!!projectPageState.currentSelectedProjectId || !!projectPageState.currentSelectedProjectGroupId"
                                   @update:visible="handleUpdateDeleteModalVisible"
                                   @confirm="handleRefreshTree"
        />
        <project-main-project-group-move-modal v-if="projectPageState.projectGroupMoveModalVisible"
                                               :visible="projectPageState.projectGroupMoveModalVisible"
                                               :is-project="!!projectPageState.currentSelectedProjectId"
                                               :target-id="projectPageState.currentSelectedProjectId || projectPageState.currentSelectedProjectGroupId || state.currentProjectGroupId"
                                               @update:visible="handleUpdateProjectGroupMoveModal"
                                               @confirm="handleRefreshTree"
        />
    </div>
</template>

<style lang="postcss" scoped>
/* right contents */
.page-wrapper {
    @apply flex flex-col w-full h-full;
}

.title-right-button-wrapper {
    display: inline-flex;
    align-items: center;
}
.create-context-menu {
    @apply absolute;
    top: 100%;
    right: 0;
    z-index: 10;
    width: max-content;
}
.create-button-wrapper {
    @apply relative inline-block;
    height: 2rem;
}

.parents-info {
    @apply flex items-center text-gray-900;
    min-height: 1rem;
    margin-bottom: 0.25rem;
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

/* custom design-system component - p-heading */
:deep(.p-heading) {
    @apply border-none;
    padding-bottom: 0;
}
</style>
