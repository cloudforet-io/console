<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, reactive, ref, watch,
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
import type { Breadcrumb } from '@/common/modules/page-layouts/type';

import ProjectGroupMemberManagementModal from '@/services/project/components/ProjectGroupMemberManagementModal.vue';
import ProjectMainCardList from '@/services/project/components/ProjectMainCardList.vue';
import ProjectMainProjectGroupDeleteCheckModal from '@/services/project/components/ProjectMainProjectGroupDeleteCheckModal.vue';
import ProjectMainProjectGroupFormModal from '@/services/project/components/ProjectMainProjectGroupFormModal.vue';
import ProjectMainProjectGroupMoveModal from '@/services/project/components/ProjectMainProjectGroupMoveModal.vue';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';


const route = useRoute();

const gnbStore = useGnbStore();
const gnbGetters = gnbStore.getters;
const allReferenceStore = useAllReferenceStore();
const projectPageStore = useProjectPageStore();
const projectPageGetters = projectPageStore.getters;
const projectPageState = projectPageStore.state;

const menuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);

const storeState = reactive({
    userId: computed(() => store.state.user.userId),
    groupId: computed(() => projectPageGetters.groupId),
    groupName: computed(() => projectPageGetters.groupName),
    selectedItem: computed(() => projectPageState.selectedItem),
    selectedNodeData: computed(() => projectPageGetters.selectedNodeData),
    parentGroups: computed(() => projectPageGetters.parentGroups),
    projectCount: computed(() => projectPageState.projectCount),
    projects: computed<ProjectReferenceMap>(() => allReferenceStore.getters.project),
    projectGroups: computed<ProjectGroupReferenceMap>(() => allReferenceStore.getters.projectGroup),
    projectGroupFormVisible: computed(() => projectPageState.projectGroupFormVisible),
    projectGroupDeleteCheckModalVisible: computed(() => projectPageState.projectGroupDeleteCheckModalVisible),
});

const state = reactive({
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
    favoriteOptions: computed<FavoriteOptions>(() => ({
        type: FAVORITE_TYPE.PROJECT_GROUP,
        id: storeState.groupId,
    })),
    projectGroupMemberManagementModalVisible: false,
    projectGroupMemberCount: computed<number|undefined>(() => storeState.projectGroups?.[storeState.groupId]?.data.users?.length),
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

/* Navigation */
const onProjectGroupNavClick = async (item: Breadcrumb) => {
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
    projectPageStore.refreshProjectTreeKey();
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
        projectPageStore.openProjectFormModal(storeState.selectedItem);
    } else if (item.name === 'projectGroup') {
        projectPageStore.openProjectGroupFormModal(storeState.selectedItem);
    }
};

watch(() => route.params, async (after, before) => {
    if (after?.projectGroupId !== before?.projectGroupId) {
        await projectPageStore.selectNode(after.projectGroupId);
    }
});
watch(() => state.projectGroupNavigation, async (projectGroupNavigation) => {
    gnbStore.setBreadcrumbs(projectGroupNavigation);
});
watch(() => gnbGetters.selectedItem, (selectedItem) => {
    onProjectGroupNavClick(selectedItem);
});
watch(() => state.favoriteOptions, (favoriteOptions) => {
    gnbStore.setFavoriteItemId(favoriteOptions);
}, { immediate: true });
</script>

<template>
    <div class="page-wrapper">
        <p-heading :title="storeState.groupName ? storeState.groupName : $t('PROJECT.LANDING.ALL_PROJECTS')"
                   use-total-count
                   :total-count="storeState.projectCount || 0"
        >
            <template #title-right-extra>
                <div v-if="storeState.groupId"
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
                    <p-button v-if="storeState.groupId"
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
        <project-group-member-management-modal
            v-if="state.projectGroupMemberManagementModalVisible"
            :visible.sync="state.projectGroupMemberManagementModalVisible"
            :project-group-id="storeState.groupId"
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
