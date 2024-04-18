<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';


import {
    PTextInput, PTextHighlighting, PEmpty, PBadge,
} from '@spaceone/design-system';

import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { ProjectReferenceItem } from '@/store/reference/project-reference-store';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import LSBRouterMenuItem from '@/common/modules/navigations/lsb/modules/LSBRouterMenuItem.vue';
import type { LSBItem, LSBMenu } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

import { gray, indigo, peacock } from '@/styles/colors';

import ProjectMainTree from '@/services/project/components/ProjectMainTree.vue';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';

const route = useRoute();
const allReferenceStore = useAllReferenceStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;
const { getProperRouteLocation } = useProperRouteLocation();

const storeState = reactive({
    projectItems: computed<ProjectReferenceItem[]>(() => Object.values(allReferenceStore.getters.project)),
    favoriteItems: computed(() => favoriteGetters.favoriteMenuList.filter((favoriteMenu) => {
        if (favoriteMenu.itemType === FAVORITE_TYPE.PROJECT) return true;
        if (favoriteMenu.itemType === FAVORITE_TYPE.PROJECT_GROUP) return true;
        if (favoriteMenu.itemType === FAVORITE_TYPE.DASHBOARD && favoriteMenu.itemId.startsWith('project-')) return true;
        return false;
    })),
});

const state = reactive({
    projectKeyword: '',
    currentPath: computed(() => route.fullPath),
    starredMenuItems: computed<LSBItem[]>(() => storeState.favoriteItems.map((d) => {
        if (d.itemType === FAVORITE_TYPE.DASHBOARD) {
            return {
                type: MENU_ITEM_TYPE.ITEM,
                label: d.label,
                id: d.name,
                icon: { name: 'ic_service_dashboard', color: gray[600] },
                to: getProperRouteLocation({
                    name: PROJECT_ROUTE.DETAIL._NAME,
                    params: { id: d.itemId },
                }),
                favoriteOptions: { type: FAVORITE_TYPE.DASHBOARD, id: d.name },
            };
        } if (d.itemType === FAVORITE_TYPE.PROJECT_GROUP) {
            return {
                type: MENU_ITEM_TYPE.ITEM,
                label: d.label,
                id: d.name,
                icon: { name: 'ic_folder-filled', color: indigo[500] },
                to: getProperRouteLocation({
                    name: PROJECT_ROUTE._NAME,
                    params: { projectGroupId: d.itemId },
                }),
                favoriteOptions: { type: FAVORITE_TYPE.PROJECT_GROUP, id: d.name },
            };
        }
        return {
            type: MENU_ITEM_TYPE.ITEM,
            label: d.label,
            id: d.name,
            icon: { name: 'ic_document-filled', color: peacock[600] },
            to: getProperRouteLocation({
                name: PROJECT_ROUTE.DETAIL._NAME,
                params: { id: d.itemId },
            }),
            favoriteOptions: { type: FAVORITE_TYPE.PROJECT, id: d.name },
        };
    })),
    isProjectLandingPage: computed(() => route.name === PROJECT_ROUTE._NAME),
    projectLandingMenuSet: computed(() => [
        {
            type: MENU_ITEM_TYPE.ITEM,
            label: 'All Projects',
            icon: 'ic_dots-4-square',
            to: getProperRouteLocation({
                name: PROJECT_ROUTE._NAME,
            }),
            hideFavorite: true,
        },
        {
            type: MENU_ITEM_TYPE.DIVIDER,
        },
        {
            type: MENU_ITEM_TYPE.COLLAPSIBLE,
            label: 'Project',
            id: 'project',
        },
    ]),
    defaultMenuSet: computed(() => [
        {
            type: MENU_ITEM_TYPE.TOP_TITLE,
            label: i18n.t('PROJECT.DETAIL.DASHBOARD.DASHBOARD'),
        },
        {
            type: MENU_ITEM_TYPE.DIVIDER,
        },
        {
            type: MENU_ITEM_TYPE.ITEM,
            label: i18n.t('PROJECT.DETAIL.TAB_PROJECT_MEMBER'),
            id: 'project-member',
            to: {
                name: PROJECT_ROUTE.DETAIL.TAB.MEMBER._NAME,
            },
            hideFavorite: true,
        },
        {
            type: MENU_ITEM_TYPE.SLOT,
            label: i18n.t('PROJECT.DETAIL.TAB_ALERT'),
            id: 'project-alert',
            to: {
                name: PROJECT_ROUTE.DETAIL.TAB.ALERT._NAME,
            },
        },
        {
            type: MENU_ITEM_TYPE.ITEM,
            label: i18n.t('PROJECT.DETAIL.TAB_NOTIFICATIONS'),
            id: 'project-notification',
            to: {
                name: PROJECT_ROUTE.DETAIL.TAB.NOTIFICATIONS._NAME,
            },
        },
        {
            type: MENU_ITEM_TYPE.ITEM,
            label: i18n.t('PROJECT.DETAIL.TAB_TAG'),
            id: 'project-tag',
            to: {
                name: PROJECT_ROUTE.DETAIL.TAB.TAG._NAME,
            },
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
        return (state.isProjectLandingPage ? [
            ...baseMenuSet,
            ...state.projectLandingMenuSet,
        ] : [
            ...baseMenuSet,
            ...state.defaultMenuSet,
        ]);
    }),
    projectFilteredByKeyword: computed<LSBItem[]>(() => storeState.projectItems.filter((project) => project.name.includes(state.projectKeyword))
        .map((project) => ({
            type: MENU_ITEM_TYPE.ITEM,
            label: project.name,
            id: project.key,
            icon: { name: 'ic_document-filled', color: peacock[600] },
            to: getProperRouteLocation({
                name: PROJECT_ROUTE.DETAIL._NAME,
                params: { id: project.key },
            }),
            favoriteOptions: { type: FAVORITE_TYPE.PROJECT, id: project.key },
        }))),
});
</script>

<template>
    <l-s-b class="project-l-s-b"
           :menu-set="state.menuSet"
    >
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
        <template #slot-project-alert="menu">
            <l-s-b-router-menu-item :item="menu"
                                    :idx="menu?.id"
            >
                <template #after-text>
                    <p-badge style-type="primary3"
                             badge-type="subtle"
                             class="ml-1"
                    >
                        7
                    </p-badge>
                </template>
            </l-s-b-router-menu-item>
        </template>
    </l-s-b>
</template>

<style scoped lang="postcss">
.project-l-s-b {
    .project-search {
        @apply w-full;
        margin-bottom: 0.5rem;
    }
    .search-result-text {
        @apply overflow-hidden whitespace-no-wrap;
        text-overflow: ellipsis;
    }
    .search-empty {
        @apply text-paragraph-md;
        white-space: pre;
        margin-top: 0.75rem;
    }
}
</style>
