<template>
    <div class="gnb-favorite">
        <p-data-loader v-if="!showAll"
                       :data="[...projects, ...cloudServiceTypes]"
                       :loading="loading"
        >
            <template v-for="[type, items] in Object.entries(favoriteItemMap)">
                <div v-if="items.length" :key="`favorite-${type}`" class="content-wrapper">
                    <p-divider v-if="type === FAVORITE_TYPE.CLOUD_SERVICE && projects.length"
                               class="my-5"
                    />
                    <div class="title-wrapper">
                        <span class="title-text">{{ type === FAVORITE_TYPE.PROJECT ? 'PROJECT' : 'CLOUD SERVICE' }}</span>
                        <div v-if="items.length > FAVORITE_LIMIT"
                             class="show-all-button"
                             @click="handleClickShowAll(type)"
                        >
                            <span class="text">Show all</span>
                            <p-i name="ic_arrow_right" width="1rem" height="1rem"
                                 color="inherit"
                            />
                        </div>
                    </div>
                    <g-n-b-favorite-item-list :favorite-items="favoriteItemMap[type].slice(0, FAVORITE_LIMIT)" />
                </div>
            </template>
            <template #no-data>
                <div class="no-data">
                    <img class="img" src="@/assets/images/illust_star.svg">
                    <p class="text">
                        Add frequently visited pages to your favorites
                        Favorite buttons can be found in following menus
                    </p>
                    <div class="button-wrapper">
                        <p-button style-type="gray-border"
                                  size="sm"
                                  @click="handleClickMenuButton(FAVORITE_TYPE.PROJECT)"
                        >
                            Project
                        </p-button>
                        <p-button style-type="gray-border"
                                  size="sm"
                                  @click="handleClickMenuButton(FAVORITE_TYPE.CLOUD_SERVICE_TYPE)"
                        >
                            Cloud Service
                        </p-button>
                    </div>
                </div>
            </template>
        </p-data-loader>
        <!-- All Favorites -->
        <div v-else class="all-favorites-wrapper">
            <div class="title-wrapper">
                <p-icon-button name="ic_back" size="sm"
                               @click="handleGoBack"
                />
                <span class="title-text">All {{ showAllType === FAVORITE_TYPE.PROJECT ? 'Projects' : 'Cloud Services' }}</span>
            </div>
            <g-n-b-favorite-item-list :favorite-items="showAllType === FAVORITE_TYPE.PROJECT ? projects : cloudServiceTypes" />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from '@vue/composition-api';

import {
    PButton, PDataLoader, PDivider, PI, PIconButton,
} from '@spaceone/design-system';

import GNBFavoriteItemList
    from '@/common/modules/navigations/gnb/modules/gnb-recent-favorite/modules/GNBFavoriteItemList.vue';

import { PROJECT_ROUTE } from '@/services/project/route-config';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { FAVORITE_TYPE, FavoriteItem } from '@/store/modules/favorite/type';
import { SpaceRouter } from '@/router';
import { store } from '@/store';


const FAVORITE_LIMIT = 10;

export default {
    name: 'GNBFavorite',
    components: {
        GNBFavoriteItemList,
        PButton,
        PDataLoader,
        PDivider,
        PI,
        PIconButton,
    },
    props: {},
    setup() {
        const state = reactive({
            loading: true,
            projects: computed<FavoriteItem[]>(() => ([
                ...store.getters['favorite/projectGroupItems'],
                ...store.getters['favorite/projectItems'],
            ])),
            cloudServiceTypes: computed<FavoriteItem[]>(() => store.getters['favorite/cloudServiceTypeItems']),
            favoriteItemMap: computed<Record<string, FavoriteItem[]>>(() => ({
                [FAVORITE_TYPE.PROJECT]: state.projects,
                [FAVORITE_TYPE.CLOUD_SERVICE]: state.cloudServiceTypes,
            })),
            showAll: false,
            showAllType: undefined as undefined|FAVORITE_TYPE,
        });

        /* Event */
        const handleClickShowAll = (type: FAVORITE_TYPE) => {
            state.showAll = true;
            state.showAllType = type;
        };
        const handleClickMenuButton = (type: FAVORITE_TYPE) => {
            if (type === FAVORITE_TYPE.PROJECT) {
                SpaceRouter.router.replace({
                    name: PROJECT_ROUTE._NAME,
                });
            } else if (type === FAVORITE_TYPE.CLOUD_SERVICE) {
                SpaceRouter.router.replace({
                    name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME,
                });
            }
        };
        const handleGoBack = () => {
            state.showAll = false;
            state.showAllType = undefined;
        };

        /* Init */
        (async () => {
            state.loading = true;
            await Promise.allSettled([
                store.dispatch('reference/project/load'),
                store.dispatch('reference/projectGroup/load'),
                store.dispatch('reference/cloudServiceType/load'),
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
        };
    },
};
</script>
<style lang="postcss" scoped>
.gnb-favorite {
    padding: 1rem;
    .p-data-loader {
        height: 100%;
    }
    .content-wrapper {
        .title-wrapper {
            @apply text-gray-500;
            display: flex;
            justify-content: space-between;
            font-size: 0.75rem;
            padding-bottom: 0.5rem;
            .title-text {
                font-weight: 700;
            }
            .show-all-button {
                @apply text-blue-700;
                font-size: 0.75rem;
                cursor: pointer;
                .text {
                    font-weight: normal;
                }
                &:hover {
                    .text {
                        text-decoration: underline;
                    }
                }
            }
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
            padding-top: 1rem;
        }
    }
    .all-favorites-wrapper {
        .title-wrapper {
            display: flex;
            align-items: center;
            font-size: 0.875rem;
            font-weight: 700;
            padding-bottom: 0.5rem;
        }
    }
}
</style>
