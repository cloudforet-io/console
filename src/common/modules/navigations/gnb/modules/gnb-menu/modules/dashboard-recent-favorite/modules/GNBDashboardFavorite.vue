<template>
    <div class="gnb-dashboard-favorite">
        <p-data-loader :data="sortedFavoriteList"
                       :loading="loading"
                       class="gnb-dashboard-favorite-context"
                       :class="{ loading }"
        >
            <draggable v-model="sortedFavoriteList">
                <div v-for="(item, index) in sortedFavoriteList"
                     :key="`favorite-${item.label}-${index}`"
                     @click="hideMenu"
                >
                    <g-n-b-sub-menu :label="item.label"
                                    :is-draggable="true"
                                    :to="dashboardRouteFormatter(item.itemId)"
                    >
                        <template #extra-mark>
                            <favorite-button :favorite-type="FAVORITE_TYPE.DASHBOARD"
                                             :item-id="item.itemId"
                                             scale="0.65"
                            />
                        </template>
                    </g-n-b-sub-menu>
                </div>
            </draggable>
            <template #no-data>
                <div class="no-data">
                    <img class="img"
                         src="@/assets/images/illust_jellyocto-with-a-telescope.svg"
                    >
                    <p class="text">
                        <!--song-lang-->
                        {{ $t('BILLING.COST_MANAGEMENT.COST_ANALYSIS.NO_ITEMS') }}
                    </p>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">
import type { SetupContext } from 'vue';
import {
    computed, reactive, toRefs,
} from 'vue';
import draggable from 'vuedraggable';

import { PDataLoader } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { SpaceRouter } from '@/router';
import { store } from '@/store';

import type { FavoriteItem } from '@/store/modules/favorite/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import ErrorHandler from '@/common/composables/error/errorHandler';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';
import type { SuggestionType } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { SUGGESTION_TYPE } from '@/common/modules/navigations/gnb/modules/gnb-search/config';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import { PROJECT_ROUTE } from '@/services/project/route-config';

const FAVORITE_LIMIT = 5;

interface TempDashboardModel {
    name: string;
    dashboardId: string;
}

export default {
    name: 'GNBDashboardFavorite',
    components: {
        FavoriteButton,
        GNBSubMenu,
        PDataLoader,
        draggable,
    },
    props: {},
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            loading: true,
            favoriteDashboardIdList: computed<FavoriteItem[]>(() => store.state.favorite.dashboardItems),
            dashboardList: [ // load from dashboard api
                { name: 'dashboard1', dashboardId: '1' },
                { name: 'dashboard2', dashboardId: '2' },
                { name: 'dashboard3', dashboardId: '3' },
                { name: 'dashboard4', dashboardId: '4' },
                { name: 'dashboard5', dashboardId: '5' },
                { name: 'dashboard6', dashboardId: '6' },
                { name: 'dashboard7dashboard7dashboard7dashboard7dashboard7dashboard7dashboard7', dashboardId: '7' },
                { name: 'dashboard8', dashboardId: '8' },
            ] as TempDashboardModel[],
            favoriteDashboardList: computed<FavoriteItem[]>(() => {
                const favoriteList: FavoriteItem[] = [];
                state.dashboardList.forEach((dashboard) => {
                    const isFavoriteDashboard = !!(state.favoriteDashboardIdList ?? []).filter((d) => dashboard.dashboardId === d.itemId).length;
                    if (isFavoriteDashboard) {
                        favoriteList.push({
                            itemId: dashboard.dashboardId,
                            label: dashboard.name,
                            itemType: FAVORITE_TYPE.DASHBOARD,
                        });
                    }
                });
                return favoriteList;
            }),
            favoriteOrderList: [] as string[],
            sortedFavoriteList: computed<FavoriteItem[]>({
                get: () => {
                    const nonExistentOrderList: FavoriteItem[] = [];
                    const sortedList: FavoriteItem[] = [];
                    state.favoriteOrderList.forEach((dashboardId) => {
                        const favoriteItem = (state.favoriteDashboardList ?? []).find((favorite) => favorite.itemId === dashboardId);
                        if (favoriteItem) sortedList.push(favoriteItem);
                    });
                    state.favoriteDashboardList.forEach((item) => {
                        const itemId = state.favoriteOrderList.find((id) => item.itemId === id);
                        if (!itemId) nonExistentOrderList.push(item);
                    });
                    return [...nonExistentOrderList, ...sortedList];
                },
                set: (value) => {
                    state.favoriteOrderList = value.map((favorite) => favorite.itemId);
                    setFavoriteOrderList();
                },
            }),
        });

        const hideMenu = () => { emit('close'); };
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
            hideMenu();
        };

        const dashboardRouteFormatter = (id) => ({
            name: DASHBOARDS_ROUTE.DETAIL._NAME,
            params: { dashboardId: id },
        });
        const handleSelect = () => { hideMenu(); };

        const getFavoriteOrderList = async () => {
            try {
                const { results } = await SpaceConnector.client.addOns.favorite.orderList.get({
                    type: FAVORITE_TYPE.DASHBOARD,
                });
                state.favoriteOrderList = results[0]?.data?.order_list ?? [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.favoriteOrderList = [];
            }
        };

        const setFavoriteOrderList = async () => {
            try {
                state.loading = true;
                await SpaceConnector.client.addOns.favorite.orderList.set({
                    type: FAVORITE_TYPE.DASHBOARD,
                    order_list: state.favoriteOrderList,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            } finally {
                state.loading = false;
            }
        };
        /* Init */
        (async () => {
            state.loading = true;
            await Promise.allSettled([
                getFavoriteOrderList(),
                store.dispatch('favorite/load', FAVORITE_TYPE.DASHBOARD),
            ]);
            state.loading = false;
        })();

        return {
            ...toRefs(state),
            FAVORITE_TYPE,
            FAVORITE_LIMIT,
            handleClickMenuButton,
            handleSelect,
            dashboardRouteFormatter,
            hideMenu,
        };
    },
};
</script>
<style lang="postcss" scoped>
.gnb-dashboard-favorite {
    .gnb-dashboard-favorite-context {
        max-height: 85vh;
        overflow-y: scroll;
    }

    /* custom design-system component - p-data-loader */
    :deep(.p-data-loader) {
        &.loading {
            height: 15rem;
        }
        .data-loader-container {
            max-height: calc(100vh - $gnb-height - 3.75rem);
            overflow-y: auto;
            padding: 0.5rem;
        }
    }
    .no-data {
        text-align: center;
        padding: 1.875rem 3.25rem;
        .img {
            margin-bottom: 0.9375rem;
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
