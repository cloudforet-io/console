<script setup lang="ts">
import { reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { PI } from '@spaceone/design-system';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import { queryStringToString } from '@/lib/router-query-string';

import SidebarTitle from '@/common/components/titles/sidebar-title/SidebarTitle.vue';
import FavoriteList from '@/common/modules/favorites/favorite-list/FavoriteList.vue';

import ProjectMainProjectTree from '@/services/project/components/ProjectMainProjectTree.vue';
import { useProjectFavorite } from '@/services/project/composables/use-project-favorite';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';

const route = useRoute();
const projectPageStore = useProjectPageStore();
const projectPageState = projectPageStore.state;
const state = reactive({
    initGroupId: queryStringToString(route.query.select_pg) as string|undefined,
});

const { favoriteItems, beforeFavoriteRoute, handleDeleteFavorite } = useProjectFavorite();
</script>

<template>
    <div class="sidebar-container">
        <div class="sidebar-item-wrapper">
            <sidebar-title :title="$t('PROJECT.LANDING.FAVORITES')">
                <template #extra>
                    <span class="count">({{ favoriteItems.length }})</span>
                </template>
            </sidebar-title>
            <favorite-list :items="favoriteItems"
                           :before-route="beforeFavoriteRoute"
                           @delete="handleDeleteFavorite"
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
            <project-main-project-tree
                :key="projectPageState.projectTreeKey"
                :init-group-id="state.initGroupId"
            />
        </div>
    </div>
</template>

<style scoped lang="postcss">
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
</style>
