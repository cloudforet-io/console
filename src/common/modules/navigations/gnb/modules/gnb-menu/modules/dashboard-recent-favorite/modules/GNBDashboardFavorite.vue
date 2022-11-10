<template>
    <div class="gnb-dashboard-favorite">
        <p-data-loader :data="items"
                       :loading="loading"
                       class="gnb-dashboard-favorite-context"
                       :class="{ loading: loading }"
        >
            <draggable v-model="items">
                <div v-for="(item, index) in items"
                     :key="`favorite-${item.label}-${index}`"
                     @click="hideMenu"
                >
                    <g-n-b-sub-menu :label="item.label"
                                    :is-draggable="true"
                                    :to="dashboardRouteFormatter(item.name)"
                    >
                        <template #extra-mark>
                            <favorite-button :favorite-type="FAVORITE_TYPE.DASHBOARD"
                                             :item-id="item.name"
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
import { reactive, toRefs } from 'vue';
import draggable from 'vuedraggable';

import { PDataLoader } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import GNBSubMenu from '@/common/modules/navigations/gnb/modules/gnb-menu/GNBSubMenu.vue';
import type { SuggestionType } from '@/common/modules/navigations/gnb/modules/gnb-search/config';
import { SUGGESTION_TYPE } from '@/common/modules/navigations/gnb/modules/gnb-search/config';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import { PROJECT_ROUTE } from '@/services/project/route-config';

const FAVORITE_LIMIT = 5;

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
            items: [
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard1', name: '1',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard2', name: '2',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard3', name: '3',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard4', name: '4',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard5', name: '5',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard6', name: '6',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard7', name: '7',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard8', name: '8',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard9', name: '9',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard10', name: '10',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard11', name: '11',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard12', name: '12',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard13', name: '13',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard14', name: '14',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard15', name: '15',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard16', name: '16',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard17', name: '17',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard18', name: '18',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard19', name: '19',
                },
                {
                    show: true, to: { name: DASHBOARDS_ROUTE.ALL._NAME }, label: 'dashboard20', name: '20',
                },
            ],
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

        /* Init */
        (async () => {
            state.loading = true;
            await Promise.allSettled([
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
