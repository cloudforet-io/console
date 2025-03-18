<script setup lang="ts">
import { onClickOutside } from '@vueuse/core/index';
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router/composables';


import { find } from 'lodash';

import {
    PTextInput, PTextHighlighting, PEmpty, PBadge, PContextMenu, PIconButton,
} from '@cloudforet/mirinae';
import type { SelectDropdownMenuItem } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import { ALERT_STATE } from '@/schema/monitoring/alert/constants';
import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceItem } from '@/store/reference/project-reference-store';

import { MENU_ID } from '@/lib/menu/config';

import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import LSBRouterMenuItem from '@/common/modules/navigations/lsb/modules/LSBRouterMenuItem.vue';
import type { LSBItem, LSBMenu } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import { indigo, peacock } from '@/styles/colors';

import ProjectMainTree from '@/services/project/v1/components/ProjectMainTree.vue';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';
import { useProjectDetailPageStore } from '@/services/project/v1/stores/project-detail-page-store';
import { useProjectPageStore } from '@/services/project/v1/stores/project-page-store';

const route = useRoute();
const allReferenceStore = useAllReferenceStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;
const projectDetailPageStore = useProjectDetailPageStore();
const projectDetailPageState = projectDetailPageStore.state;
const projectPageStore = useProjectPageStore();
const projectPageState = projectPageStore.state;
const menuRef = ref<any|null>(null);


const storeState = reactive({
    projectItems: computed<ProjectReferenceItem[]>(() => Object.values(allReferenceStore.getters.project)),
    favoriteItems: computed(() => favoriteGetters.favoriteMenuList.filter((favoriteMenu) => {
        if (favoriteMenu.itemType === FAVORITE_TYPE.PROJECT) return true;
        if (favoriteMenu.itemType === FAVORITE_TYPE.PROJECT_GROUP) return true;
        return false;
    })),
    currentWorkspaceId: computed(() => workspaceStoreGetters.currentWorkspaceId as string),
});

const state = reactive({
    projectKeyword: '',
    currentPath: computed(() => route.fullPath),
    starredMenuItems: computed<LSBItem[]>(() => storeState.favoriteItems.map((d) => {
        if (d.itemType === FAVORITE_TYPE.PROJECT_GROUP) {
            return {
                type: MENU_ITEM_TYPE.ITEM,
                label: d.label,
                id: d.name,
                icon: { name: 'ic_folder-filled', color: indigo[500] },
                to: {
                    name: PROJECT_ROUTE_V1._NAME,
                    params: { projectGroupId: d.itemId },
                },
                favoriteOptions: { type: FAVORITE_TYPE.PROJECT_GROUP, id: d.name },
            };
        }
        return {
            type: MENU_ITEM_TYPE.ITEM,
            label: d.label,
            id: d.name,
            icon: { name: 'ic_document-filled', color: peacock[600] },
            to: {
                name: PROJECT_ROUTE_V1.DETAIL.TAB.SUMMARY._NAME,
                params: { id: d.itemId },
            },
            favoriteOptions: { type: FAVORITE_TYPE.PROJECT, id: d.name },
        };
    })),
    isProjectLandingPage: computed(() => route.name === PROJECT_ROUTE_V1._NAME),
    projectLandingMenuSet: computed(() => [
        {
            type: MENU_ITEM_TYPE.SLOT,
            label: i18n.t('PROJECT.LANDING.ALL_PROJECTS'),
            id: MENU_ID.PROJECT,
            icon: 'ic_dots-4-square',
            to: { name: PROJECT_ROUTE_V1._NAME },
            hideFavorite: true,
        },
        {
            type: MENU_ITEM_TYPE.DIVIDER,
        },
        {
            type: MENU_ITEM_TYPE.COLLAPSIBLE,
            label: i18n.t('PROJECT.LANDING.PROJECT'),
            id: 'project',
        },
    ]),
    menuSet: computed<LSBMenu[]>(() => {
        const baseMenuSet = [
            {
                type: MENU_ITEM_TYPE.STARRED,
                childItems: state.starredMenuItems,
                currentPath: state.currentPath,
            },
            { type: MENU_ITEM_TYPE.DIVIDER },
        ];
        return [
            ...baseMenuSet,
            ...state.projectLandingMenuSet,
        ];
    }),
    projectFilteredByKeyword: computed<LSBItem[]>(() => storeState.projectItems.filter((project) => project.name?.toLowerCase()?.includes(state.projectKeyword?.toLowerCase()))
        .map((project) => ({
            type: MENU_ITEM_TYPE.ITEM,
            label: project.name,
            id: project.key,
            icon: { name: 'ic_document-filled', color: peacock[600] },
            to: {
                name: PROJECT_ROUTE_V1.DETAIL.TAB.SUMMARY._NAME,
                params: { id: project.key, workspaceId: storeState.currentWorkspaceId },
            },
            favoriteOptions: { type: FAVORITE_TYPE.PROJECT, id: project.key },
        }))),
    alertCounts: computed(() => ({
        TRIGGERED: find(projectDetailPageState.alertCounts, { state: ALERT_STATE.TRIGGERED })?.total ?? 0,
    })),
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
    createMenuVisible: false,
});

const handleClickAddButton = () => {
    state.createMenuVisible = !state.createMenuVisible;
};
const handleSelectCreateMenu = (item: SelectDropdownMenuItem) => {
    if (item.name === 'project') {
        projectPageStore.setProjectFormModalVisible(true);
    } else if (item.name === 'projectGroup') {
        projectPageStore.setProjectGroupFormVisible(true);
    }
};

onClickOutside(menuRef, () => {
    state.createMenuVisible = false;
});
</script>

<template>
    <l-s-b class="project-l-s-b"
           :menu-set="state.menuSet"
    >
        <template #slot-project="item">
            <l-s-b-router-menu-item :current-path="state.currentPath"
                                    :item="item"
            >
                <template #right-extra>
                    <div v-if="projectPageState.isWorkspaceOwner"
                         ref="menuRef"
                         class="create-button-wrapper"
                    >
                        <p-icon-button name="ic_plus"
                                       size="sm"
                                       style-type="tertiary"
                                       shape="square"
                                       class="dashboard-create-button"
                                       @click.prevent="handleClickAddButton"
                        />
                        <p-context-menu v-show="state.createMenuVisible"
                                        class="create-context-menu"
                                        no-select-indication
                                        :menu="state.createDropdownMenuItems"
                                        @select="handleSelectCreateMenu"
                        />
                    </div>
                </template>
            </l-s-b-router-menu-item>
        </template>
        <template #collapsible-contents-project>
            <p-text-input v-model="state.projectKeyword"
                          class="project-search"
                          placeholder="Search project"
            />
            <template v-if="state.projectKeyword">
                <l-s-b-router-menu-item v-for="(_item, idx) of state.projectFilteredByKeyword"
                                        :key="idx"
                                        :item="_item"
                                        :idx="`search-${idx}`"
                                        :current-path="state.currentPath"
                                        is-hide-favorite
                >
                    <p-text-highlighting class="search-result-text"
                                         :term="state.projectKeyword"
                                         :text="_item.label"
                    />
                </l-s-b-router-menu-item>
                <p-empty v-if="state.projectKeyword && !state.projectFilteredByKeyword.length"
                         class="search-empty"
                >
                    <span>
                        {{ $t('PROJECT.LANDING.SEARCH_EMPTY_TEXT') }}
                    </span>
                </p-empty>
            </template>
            <project-main-tree v-else />
        </template>
        <template #after-text-project-alert>
            <p-badge style-type="primary3"
                     badge-type="subtle"
                     class="ml-1"
            >
                {{ state.alertCounts.TRIGGERED }}
            </p-badge>
        </template>
    </l-s-b>
</template>

<style scoped lang="postcss">
.project-l-s-b {

    .create-button-wrapper {
        @apply relative inline-block;

        .create-context-menu {
            @apply absolute;
            top: 100%;
            right: 0;
            z-index: 10;
            width: max-content;
        }
    }

    .project-search {
        @apply w-full;
        margin-bottom: 0.5rem;
    }
    .search-result-text {
        @apply overflow-hidden whitespace-nowrap;
        text-overflow: ellipsis;
    }
    .search-empty {
        @apply text-paragraph-md;
        white-space: pre;
        margin-top: 0.75rem;
    }
}
</style>
