<script setup lang="ts">
import { reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { PI } from '@spaceone/design-system';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import { queryStringToString } from '@/lib/router-query-string';

import FavoriteList from '@/common/modules/favorites/favorite-list/FavoriteList.vue';

import ProjectMainProjectTree from '@/services/project/components/ProjectMainProjectTree.vue';
import { useProjectFavorite } from '@/services/project/composables/use-project-favorite';
import { useProjectPageStore } from '@/services/project/stores/project-page-store';

const route = useRoute();
const projectPageStore = useProjectPageStore();
const projectPageState = projectPageStore.state;
const state = reactive({
    initGroupId: queryStringToString(route.query.select_pg) as string|undefined,
    isCollapsed: false,
});

const { favoriteItems, beforeFavoriteRoute, handleDeleteFavorite } = useProjectFavorite();

const handleClickCollapsibleTitle = () => {
    state.isCollapsed = !state.isCollapsed;
};
</script>

<template>
    <aside class="sidebar-container">
        <div class="sidebar-item-wrapper"
             :class="{ 'is-collapsed': state.isCollapsed }"
        >
            <div class="collapsible-title"
                 @click="handleClickCollapsibleTitle"
            >
                <p-i name="ic_chevron-down"
                     width="1.25rem"
                     height="1.25rem"
                     color="inherit transparent"
                     class="arrow-button"
                />
                <span>{{ $t('COMMON.STARRED') }}</span>
            </div>
            <div class="collapsible-contents">
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
        </div>
        <div class="sidebar-item-wrapper">
            <project-main-project-tree
                :key="projectPageState.projectTreeKey"
                :init-group-id="state.initGroupId"
            />
        </div>
    </aside>
</template>

<style scoped lang="postcss">
.sidebar-container {
    @apply h-full relative;
    overflow: auto;
    padding: 1rem 0.5rem 2rem;
    .sidebar-item-wrapper {
        @apply flex flex-col text-label-md;
        .collapsible-title {
            @apply flex items-center font-bold;
            .arrow-button {
                transition: transform 0.3s ease-in-out;
            }
        }
        .collapsible-contents {
            margin-top: 0.5rem;
            padding-bottom: 0.25rem;
            opacity: 1;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        &.is-collapsed {
            .collapsible-title {
                .arrow-button {
                    transform: rotate(-90deg);
                }
            }
            .collapsible-contents {
                height: 0;
                margin: 0;
                padding: 0;
                opacity: 0;
                transition: opacity 0s ease;
            }
        }
    }
}
</style>
