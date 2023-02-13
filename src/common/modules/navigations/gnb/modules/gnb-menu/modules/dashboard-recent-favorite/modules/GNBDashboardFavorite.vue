<template>
    <div ref="favoriteRef"
         class="gnb-dashboard-favorite"
    >
        <p-data-loader :data="sortedFavoriteList"
                       :loading="loading"
                       class="gnb-dashboard-favorite-context"
        >
            <div ref="listContainerRef">
                <draggable
                    v-model="sortedFavoriteList"
                >
                    <div v-for="(item, index) in sortedFavoriteList"
                         :key="`favorite-${item.label}-${index}`"
                    >
                        <g-n-b-sub-menu :label="item.label"
                                        :is-draggable="true"
                                        :to="dashboardRouteFormatter(item.itemId)"
                                        @navigate="hideMenu"
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
            </div>
            <template #no-data>
                <div class="no-data">
                    <img class="img"
                         src="@/assets/images/illust_jellyocto-with-a-telescope.svg"
                    >
                    <p class="text">
                        {{ $t('COMMON.GNB.DASHBOARDS.NO_ITEMS') }}
                    </p>
                </div>
            </template>
        </p-data-loader>
    </div>
</template>

<script lang="ts">
import type { PropType, SetupContext } from 'vue';
import {
    computed, defineComponent, nextTick, reactive, toRefs,
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
import type {
    GNBDashboardMenuItem,
} from '@/common/modules/navigations/gnb/modules/gnb-menu/modules/dashboard-recent-favorite/type';
import type { SuggestionType } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { SUGGESTION_TYPE } from '@/common/modules/navigations/gnb/modules/gnb-search/config';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import { PROJECT_ROUTE } from '@/services/project/route-config';

interface Props {
    dashboardList: GNBDashboardMenuItem[];
}

export default defineComponent<Props>({
    name: 'GNBDashboardFavorite',
    components: {
        FavoriteButton,
        GNBSubMenu,
        PDataLoader,
        draggable,
    },
    props: {
        dashboardList: {
            type: Array as PropType<GNBDashboardMenuItem[]>,
            default: () => ([]),
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            loading: true,
            favoriteDashboardIdList: computed<FavoriteItem[]>(() => store.state.favorite.dashboardItems),
            favoriteDashboardList: computed<FavoriteItem[]>(() => {
                const favoriteList: FavoriteItem[] = [];
                props.dashboardList.forEach((dashboard) => {
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
                    isOverflown();
                    setFavoriteOrderList();
                },
            }),
            listContainerRef: null as HTMLElement | null,
            favoriteRef: null as HTMLElement | null,
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

        const dashboardRouteFormatter = (id) => {
            const routeName = id.startsWith('project') ? DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME : DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME;
            return {
                name: routeName,
                params: {
                    dashboardId: id,
                },
            };
        };
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

        const isOverflown = () => {
            if (state.listContainerRef && state.favoriteRef) {
                return (state.favoriteRef?.clientHeight < state.listContainerRef?.scrollHeight);
            } return false;
        };

        /* Init */
        (async () => {
            state.loading = true;
            await getFavoriteOrderList();
            state.loading = false;
            await nextTick();
            emit('update:is-overflown', isOverflown());
        })();

        return {
            ...toRefs(state),
            FAVORITE_TYPE,
            handleClickMenuButton,
            handleSelect,
            dashboardRouteFormatter,
            hideMenu,
        };
    },
});
</script>
<style lang="postcss" scoped>
.gnb-dashboard-favorite {
    .gnb-dashboard-favorite-context {
        max-height: calc(85vh - 9rem);
        overflow-y: auto;
        padding: 0.5rem;
        min-height: 15rem;
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
