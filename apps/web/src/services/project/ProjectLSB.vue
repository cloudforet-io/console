<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';


import { useProperRouteLocation } from '@/common/composables/proper-route-location';
// import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
// import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';
// import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import LSB from '@/common/modules/navigations/lsb/LSB.vue';
import type { LSBMenu } from '@/common/modules/navigations/lsb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lsb/type';

// import ProjectFavoriteList from '@/services/project/components/ProjectFavoriteList.vue';
// import ProjectMainProjectTree from '@/services/project/components/ProjectMainProjectTree.vue';
import ProjectMainTree from '@/services/project/components/ProjectMainTree.vue';
// import { useProjectFavorite } from '@/services/project/composables/use-project-favorite';
import { PROJECT_ROUTE } from '@/services/project/routes/route-constant';
// import { useProjectPageStore } from '@/services/project/stores/project-page-store';
// import type { ProjectGroupTreeItem } from '@/services/project/types/project-tree-type';

const route = useRoute();
// const router = useRouter();

// const projectPageStore = useProjectPageStore();
// const projectPageState = projectPageStore.state;
// const favoriteStore = useFavoriteStore();
// const favoriteGetters = favoriteStore.getters;
const { getProperRouteLocation } = useProperRouteLocation();

// const storeState = reactive({
//     favoriteItems: computed(() => [
//         ...favoriteGetters.menuItems,
//         ...favoriteGetters.projectGroupItems,
//         ...favoriteGetters.dashboardItems, // need to be filtered by projectId
//     ]),
// });

const state = reactive({
    initGroupId: computed(() => route.params.projectGroupId as string|undefined),
    isCollapsed: false,
    currentPath: computed(() => route.fullPath),

    // starredMenuItems: computed<LSBItem[]>(() => storeState.favoriteItems.map((d) => {
    //     const icon = '';
    //     // project dashboard
    //     return {
    //         type: MENU_ITEM_TYPE.ITEM,
    //         label: '',
    //         id: d.name,
    //         imgIcon: icon,
    //         to: getProperRouteLocation({
    //             name: PROJECT_ROUTE.DETAIL._NAME,
    //         }),
    //         favoriteOptions: {
    //             type: FAVORITE_TYPE.CLOUD_SERVICE,
    //             id: d.name,
    //         },
    //     };
    // })),
    menuSet: computed<LSBMenu[]>(() => {
        const defaultMenuset = [
            {
                type: MENU_ITEM_TYPE.STARRED,
                childItems: [],
                currentPath: state.currentPath,
            },
            {
                type: MENU_ITEM_TYPE.DIVIDER,
            },
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
        ];

        return [
            ...defaultMenuset,
        ];
    }),
});

// const { favoriteItems, beforeFavoriteRoute, handleDeleteFavorite } = useProjectFavorite();
//
// const handleClickCollapsibleTitle = () => {
//     state.isCollapsed = !state.isCollapsed;
// };
// const handleBeforeFavoriteRoute = async (item: FavoriteItem) => {
//     await beforeFavoriteRoute(item);
//     if (item.itemType !== FAVORITE_TYPE.PROJECT_GROUP) {
//         router.push({
//             name: PROJECT_ROUTE.DETAIL.TAB.SUMMARY._NAME,
//             params: {
//                 id: item.itemId,
//             },
//         }).catch(() => {});
//     }
// };
//
// watch(() => projectPageState.selectedItem, (selectedItem: ProjectGroupTreeItem) => {
//     router.push({
//         name: PROJECT_ROUTE._NAME,
//         query: {
//             select_pg: selectedItem.node?.data.id || null,
//         },
//     }).catch(() => {});
// });
</script>

<template>
    <l-s-b class="project-l-s-b"
           :menu-set="state.menuSet"
    >
        <template #collapsible-contents-project>
            <project-main-tree />
        </template>
    </l-s-b>
<!--    <aside class="sidebar-container">-->
<!--        <div class="sidebar-item-wrapper"-->
<!--             :class="{ 'is-collapsed': state.isCollapsed }"-->
<!--        >-->
<!--            <div class="collapsible-title"-->
<!--                 @click="handleClickCollapsibleTitle"-->
<!--            >-->
<!--                <p-i name="ic_chevron-down"-->
<!--                     width="1.25rem"-->
<!--                     height="1.25rem"-->
<!--                     color="inherit transparent"-->
<!--                     class="arrow-button"-->
<!--                />-->
<!--                <span>{{ $t('COMMON.STARRED') }}</span>-->
<!--            </div>-->
<!--            <div class="collapsible-contents">-->
<!--                <project-favorite-list :items="favoriteItems"-->
<!--                                       :before-route="handleBeforeFavoriteRoute"-->
<!--                                       @delete="handleDeleteFavorite"-->
<!--                >-->
<!--                    <template #icon="{item}">-->
<!--                        <p-i :name="item.itemType === FAVORITE_TYPE.PROJECT ? 'ic_document-filled' : 'ic_folder-filled'"-->
<!--                             width="1rem"-->
<!--                             height="1rem"-->
<!--                             color="inherit inherit"-->
<!--                        />-->
<!--                    </template>-->
<!--                </project-favorite-list>-->
<!--            </div>-->
<!--        </div>-->
<!--        <div class="sidebar-item-wrapper">-->
<!--            <project-main-project-tree-->
<!--                :key="projectPageState.projectTreeKey"-->
<!--                :init-group-id="state.initGroupId"-->
<!--            />-->
<!--        </div>-->
<!--    </aside>-->
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
            padding-bottom: 0.5rem;
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
