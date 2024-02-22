<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, onUnmounted, reactive, ref, watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PHeading, PButton, PContextMenu, useContextMenuController, PIconButton,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { FavoriteOptions } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectGroupReferenceMap } from '@/store/reference/project-group-reference-store';
import type { ProjectReferenceMap } from '@/store/reference/project-reference-store';

import { useTopBarHeaderStore } from '@/common/modules/navigations/top-bar/modules/top-bar-header/store';
import type { Breadcrumb } from '@/common/modules/page-layouts/type';

import ProjectMainCardList from '@/services/project/components/ProjectMainCardList.vue';
import ProjectMainProjectGroupDeleteCheckModal from '@/services/project/components/ProjectMainProjectGroupDeleteCheckModal.vue';
import ProjectMainProjectGroupFormModal from '@/services/project/components/ProjectMainProjectGroupFormModal.vue';
import ProjectMainProjectGroupMoveModal from '@/services/project/components/ProjectMainProjectGroupMoveModal.vue';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';
import type { ProjectGroupTreeItem } from '@/services/project/types/project-tree-type';

const route = useRoute();
const router = useRouter();

const topBarHeaderStore = useTopBarHeaderStore();
const topBarHeaderGetters = topBarHeaderStore.getters;
const allReferenceStore = useAllReferenceStore();
const projectPageStore = useProjectPageStore();
const projectPageGetters = projectPageStore.getters;
const projectPageState = projectPageStore.state;

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
watch(() => state.projectGroupNavigation, async (projectGroupNavigation) => {
    topBarHeaderStore.setBreadcrumbs(projectGroupNavigation);
});
watch(() => topBarHeaderGetters.selectedItem, (selectedItem) => {
    onProjectGroupNavClick(selectedItem);
});
watch(() => state.favoriteOptions, (favoriteOptions) => {
    topBarHeaderStore.setFavoriteItemId(favoriteOptions);
}, { immediate: true });

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
                                    no-select-indication
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
