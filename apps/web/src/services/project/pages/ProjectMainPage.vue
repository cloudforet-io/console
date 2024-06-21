<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, onUnmounted, reactive, ref, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PHeading, PButton, PContextMenu, useContextMenuController, PIconButton,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import ProjectFormModal from '@/services/project/components/ProjectFormModal.vue';
import ProjectGroupMemberManagementModal from '@/services/project/components/ProjectGroupMemberManagementModal.vue';
import ProjectMain from '@/services/project/components/ProjectMain.vue';
import ProjectMainProjectGroupDeleteCheckModal from '@/services/project/components/ProjectMainProjectGroupDeleteCheckModal.vue';
import ProjectMainProjectGroupFormModal from '@/services/project/components/ProjectMainProjectGroupFormModal.vue';
import ProjectMainProjectGroupMoveModal from '@/services/project/components/ProjectMainProjectGroupMoveModal.vue';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';
import { useProjectTreeStore } from '@/services/project/stores/project-tree-store';


const gnbStore = useGnbStore();
// const gnbGetters = gnbStore.getters;
const allReferenceStore = useAllReferenceStore();
const projectTreeStore = useProjectTreeStore();
const projectPageStore = useProjectPageStore();
const projectPageState = projectPageStore.state;

const menuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);
const route = useRoute();

const storeState = reactive({
    userId: computed(() => store.state.user.userId),
    groupName: computed(() => storeState.projectGroups[state.currentProjectGroupId]?.name),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
});

const state = reactive({
    currentProjectGroupId: computed(() => route.params.projectGroupId),
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
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.PROJECT_GROUP,
        id: state.currentProjectGroupId,
    })),
    projectGroupMemberManagementModalVisible: false,
    projectGroupMemberCount: computed<number|undefined>(() => storeState.projectGroups?.[state.currentProjectGroupIds]?.data.users?.length),
});

const modalState = reactive({
    projectGroupFormVisible: false,
    projectGroupDeleteCheckModalVisible: false,
    projectFormModalVisible: false,
    projectGroupUpdateMode: false,
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

/* Event */
const handleClickProjectGroupEditButton = () => {
    modalState.projectGroupUpdateMode = true;
    modalState.projectGroupFormVisible = true;
};
const handleClickProjectGroupDeleteButton = () => {
    modalState.projectGroupDeleteCheckModalVisible = true;
};
const handleOpenProjectGroupMoveModal = () => {
    state.projectGroupModalVisible = true;
};

/* Handling Forms */
const handleClickAddProjectGroupMember = () => {
    state.projectGroupMemberManagementModalVisible = true;
};
const handleClickCreateButton = () => {
    showContextMenu();
};
const handleSelectCreateMenu = (item: SelectDropdownMenuItem) => {
    if (item.name === 'project') {
        modalState.projectFormModalVisible = true;
    } else if (item.name === 'projectGroup') {
        modalState.projectGroupUpdateMode = false;
        modalState.projectGroupFormVisible = true;
    }
};

const handleRefreshTree = () => {
    projectTreeStore.refreshProjectTree();
};

watch(() => state.favoriteOptions, (favoriteOptions) => {
    gnbStore.setFavoriteItemId(favoriteOptions);
}, { immediate: true });

onUnmounted(() => {
    projectTreeStore.disposeProjectTree();
});
</script>

<template>
    <div class="page-wrapper">
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
                <div class="top-button-box">
                    <p-button v-if="state.currentProjectGroupId"
                              style-type="tertiary"
                              icon-left="ic_member"
                              class="mr-4"
                              @click="handleClickAddProjectGroupMember"
                    >
                        <span>{{ $t('PROJECT.LANDING.GROUP_MEMBER') }}</span>
                        <span v-if="state.projectGroupMemberCount"
                              class="pl-1"
                        >({{ state.projectGroupMemberCount }})</span>
                    </p-button>
                    <template v-if="projectPageState.isWorkspaceOwner">
                        <p-button ref="targetRef"
                                  icon-left="ic_plus_bold"
                                  @click="handleClickCreateButton"
                        >
                            {{ $t('PROJECT.LANDING.CREATE') }}
                        </p-button>
                        <p-context-menu v-show="visibleMenu"
                                        ref="menuRef"
                                        class="create-context-menu"
                                        no-select-indication
                                        :style="contextMenuStyle"
                                        :menu="state.createDropdownMenuItems"
                                        @select="handleSelectCreateMenu"
                        />
                    </template>
                </div>
            </template>
        </p-heading>
        <project-main />

        <project-main-project-group-form-modal v-if="modalState.projectGroupFormVisible"
                                               :visible.sync="modalState.projectGroupFormVisible"
                                               :project-group-id="state.currentProjectGroupId"
                                               :update-mode="modalState.projectGroupUpdateMode"
                                               @confirm="handleRefreshTree"
        />
        <project-main-project-group-delete-check-modal v-if="modalState.projectGroupDeleteCheckModalVisible"
                                                       :visible.sync="modalState.projectGroupDeleteCheckModalVisible"
                                                       :project-group-id="state.currentProjectGroupId"
                                                       @confirm="handleRefreshTree"
        />
        <project-main-project-group-move-modal v-if="state.projectGroupModalVisible"
                                               :visible.sync="state.projectGroupModalVisible"
                                               :is-project="false"
                                               :target-id="state.currentProjectGroupId"
                                               @confirm="handleRefreshTree"
        />
        <project-group-member-management-modal v-if="state.projectGroupMemberManagementModalVisible"
                                               :visible.sync="state.projectGroupMemberManagementModalVisible"
                                               :project-group-id="state.currentProjectGroupId"
        />
        <project-form-modal v-if="modalState.projectFormModalVisible"
                            :visible.sync="modalState.projectFormModalVisible"
                            :project-group-id="state.currentProjectGroupId"
                            @confirm="handleRefreshTree"
        />
    </div>
</template>

<style lang="postcss" scoped>
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
    margin-left: auto;
    .create-context-menu {
        z-index: 10;
    }
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

</style>
