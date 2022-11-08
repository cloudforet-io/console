<template>
    <div class="gnb-dashboard-favorite">
        <p-data-loader :data="items"
                       :loading="loading"
                       class="gnb-dashboard-favorite-context"
                       :class="{ loading: loading }"
        >
            <template #no-data>
                <div class="no-data">
                    <img class="img"
                         src="@/assets/images/illust_star.svg"
                    >
                    <p class="text">
                        {{ $t('COMMON.GNB.FAVORITES.FAVORITES_HELP_TEXT') }}
                    </p>
                    <div class="button-wrapper">
                        <p-button style-type="tertiary"
                                  size="md"
                                  @click="handleClickMenuButton(FAVORITE_TYPE.PROJECT)"
                        >
                            {{ $t('COMMON.GNB.FAVORITES.GO_TO_PROJECT') }}
                        </p-button>
                        <p-button style-type="tertiary"
                                  size="md"
                                  @click="handleClickMenuButton(FAVORITE_TYPE.CLOUD_SERVICE)"
                        >
                            {{ $t('COMMON.GNB.FAVORITES.GO_TO_CLOUD_SERVICE') }}
                        </p-button>
                    </div>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import { computed, reactive, toRefs } from 'vue';

import {
    PButton, PDataLoader,
} from '@spaceone/design-system';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { FavoriteItem } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import type { CloudServiceTypeReferenceMap } from '@/store/modules/reference/cloud-service-type/type';
import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';

import { isUserAccessibleToMenu } from '@/lib/access-control';
import {
    convertMenuConfigToReferenceData, convertProjectConfigToReferenceData, convertProjectGroupConfigToReferenceData,
} from '@/lib/helper/config-data-helper';
import { MENU_ID } from '@/lib/menu/config';

import type { SuggestionType } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { SUGGESTION_TYPE } from '@/common/modules/navigations/gnb/modules/gnb-search/config';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { PROJECT_ROUTE } from '@/services/project/route-config';

const FAVORITE_LIMIT = 5;

export default {
    name: 'GNBDashboardFavorite',
    components: {
        PDataLoader,
        PButton,
    },
    props: {},
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            loading: true,
            showAll: false,
            showAllType: undefined as undefined|SuggestionType,
            //
            cloudServiceTypes: computed<CloudServiceTypeReferenceMap>(() => store.getters['reference/cloudServiceTypeItems']),
            projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
            projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
            //
            favoriteMenuItems: computed<FavoriteItem[]>(() => convertMenuConfigToReferenceData(
                store.state.favorite.menuItems,
                store.getters['display/allMenuList'],
            )),
            favoriteProjects: computed<FavoriteItem[]>(() => {
                const isUserAccessible = isUserAccessibleToMenu(MENU_ID.PROJECT, store.getters['user/pagePermissionList']);
                if (!isUserAccessible) return [];
                const favoriteProjectItems = convertProjectConfigToReferenceData(store.state.favorite.projectItems, state.projects);
                const favoriteProjectGroupItems = convertProjectGroupConfigToReferenceData(store.state.favorite.projectGroupItems, state.projectGroups);
                return [...favoriteProjectGroupItems, ...favoriteProjectItems];
            }),
            items: [],
        });

        /* Event */
        const handleClickMenuButton = (type: SuggestionType) => {
            if (type === SUGGESTION_TYPE.PROJECT) {
                SpaceRouter.router.replace({
                    name: PROJECT_ROUTE._NAME,
                });
            } else if (type === SUGGESTION_TYPE.CLOUD_SERVICE) {
                SpaceRouter.router.replace({
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                });
            }
            emit('close');
        };
        const handleClickShowAll = (type: SuggestionType) => {
            state.showAll = true;
            state.showAllType = type;
        };
        const handleShowAll = (type) => {
            state.showAll = true;
            state.showAllType = type;
        };
        const handleGoBack = () => {
            state.showAll = false;
            state.showAllType = undefined;
        };
        const handleSelect = () => {
            emit('close');
        };

        /* Init */
        (async () => {
            state.loading = true;
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('reference/projectGroup/load'),
                store.dispatch('reference/cloudServiceType/load'),
                store.dispatch('favorite/load', FAVORITE_TYPE.MENU),
                store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT),
                store.dispatch('favorite/load', FAVORITE_TYPE.PROJECT_GROUP),
                store.dispatch('favorite/load', FAVORITE_TYPE.CLOUD_SERVICE),
            ]);
            state.loading = false;
        })();

        return {
            ...toRefs(state),
            FAVORITE_TYPE,
            FAVORITE_LIMIT,
            handleClickShowAll,
            handleClickMenuButton,
            handleGoBack,
            handleSelect,
            handleShowAll,
        };
    },
};
</script>
<style lang="postcss" scoped>
.gnb-dashboard-favorite {
    .gnb-dashboard-favorite-context {
        max-height: 39rem;
    }

    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        &.loading {
            height: 15rem;
        }
        .data-loader-container {
            max-height: calc(100vh - $gnb-height - 3.75rem);
            overflow-y: auto;
            padding: 1rem 0;
        }
    }
    .no-data {
        text-align: center;
        padding: 3rem 3.25rem;
        .img {
            margin: auto;
        }
        .text {
            @apply text-gray-400;
            font-size: 0.875rem;
            line-height: 1.5;
            padding-top: 1.5rem;
        }
        .button-wrapper {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            padding-top: 1rem;
            .p-button {
                width: 10.5rem;
            }
        }
    }
}
</style>
