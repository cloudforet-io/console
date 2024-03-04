<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PI, screens, PButton, PTextButton,
} from '@spaceone/design-system';
import type { ContextMenuType } from '@spaceone/design-system/src/inputs/context-menu/type';
import { clone } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { CostDataSourceModel } from '@/schema/cost-analysis/data-source/model';
import { store } from '@/store';

import type { DisplayMenu } from '@/store/modules/display/type';
// import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';
import UpdateMark from '@/common/components/marks/UpdateMark.vue';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

// import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

interface GNBMenuType extends DisplayMenu {
    type: string;
    name?: string;
    disabled?: boolean;
}
interface Props {
    isMinimizeGnb?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isMinimizeGnb: false,
});

const route = useRoute();
const router = useRouter();
const { width } = useWindowSize();

const state = reactive({
    isHovered: false,
    dataSource: [] as CostDataSourceModel[],
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
    isMenuDescription: undefined as boolean | undefined,
    gnbMenuList: computed<GNBMenuType[]>(() => {
        let results = [] as GNBMenuType[];
        const menuList = [...store.getters['display/GNBMenuList']];
        if (state.dataSource.length === 0) {
            results = refinedMenuList(menuList, MENU_ID.COST_EXPLORER);
        } else results = menuList;
        return results;
    }),
    visibleGnbMenuList: computed<GNBMenuType[]>(() => {
        let result = [] as GNBMenuType[];
        state.gnbMenuList.forEach((menu) => {
            result = [
                ...result,
                {
                    ...menu,
                    name: menu.id,
                    type: 'header',
                },
            ];
            if (menu.subMenuList) {
                result = [...result, ...convertGNBMenuToMenuItem(menu.subMenuList)];
            }
        });
        return result;
    }),
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.HOME_DASHBOARD;
        if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
            return '';
        }
        return targetMenuId;
    }),
});

const handleMouseEvent = (value: boolean) => {
    if (state.isMobileSize) return;
    state.isHovered = value;
};
const handleMenuDescription = (value?: boolean) => {
    state.isMenuDescription = value;
    if (value) {
        router.push({
            name: COST_EXPLORER_ROUTE.LANDING._NAME,
        });
    }
};
const convertGNBMenuToMenuItem = (menuList: DisplayMenu[], menuType: ContextMenuType = 'item'): GNBMenuType[] => menuList.map((menu) => ({
    ...menu,
    name: menu.id,
    type: menuType,
    disabled: menuType === 'header' && menu.id.includes('cost'),
}));
const getDataSource = async () => {
    const response = await SpaceConnector.clientV2.costAnalysis.dataSource.list({
        query: {
            sort: [{ key: 'workspace_id', desc: false }],
        },
    });
    state.dataSource = response?.results || [];
};
const refinedMenuList = (list, value) => {
    const index = list.findIndex((d) => d.id === value);
    if (index !== -1) {
        const item = list.splice(index, 1)[0];
        list.push({
            ...item,
            disabled: true,
            subMenuList: [{}],
        });
    }
    return list;
};

(async () => {
    await getDataSource();
})();
</script>

<template>
    <div class="g-n-b-navigation-rail"
         :class="{'is-minimize': props.isMinimizeGnb, 'is-mobile': state.isMobileSize}"
         @mouseover="handleMouseEvent(true)"
         @mouseleave="handleMouseEvent(false)"
    >
        <div v-for="(item, idx) in state.visibleGnbMenuList"
             :key="`navigation-rail-item-${idx}`"
             class="navigation-rail-wrapper"
        >
            <router-link v-if="item.to"
                         :to="(item.type === 'header' && item.subMenuList?.length > 0) ? '' : item.to"
                         class="service-menu"
                         :class="{
                             'is-selected': state.selectedMenuId === item.id,
                             'is-only-label': item.type === 'header' && item.subMenuList?.length > 0
                         }"
            >
                <div class="menu-wrapper">
                    <p-i v-if="item.subMenuList?.length === 0"
                         :name="item.icon"
                         class="menu-button"
                         height="1.25rem"
                         width="1.25rem"
                         color="inherit"
                    />
                    <div class="menu-container">
                        <span v-if="!props.isMinimizeGnb || state.isHovered"
                              class="menu-title"
                        >
                            {{ item.label }}
                        </span>
                        <p-button v-if="item.disabled && !state.isMenuDescription && !props.isMinimizeGnb"
                                  icon-right="ic_arrow-right"
                                  style-type="tertiary"
                                  size="sm"
                                  class="learn-more-button"
                                  @click.stop.prevent="handleMenuDescription(true)"
                        >
                            {{ $t('MENU.LEARN_MORE') }}
                        </p-button>
                        <span v-if="item.highlightTag && (!props.isMinimizeGnb || state.isHovered)"
                              class="mark"
                        >
                            <new-mark v-if="item.highlightTag === 'new'"
                                      class="mark-item"
                            />
                            <update-mark v-else-if="item.highlightTag === 'update'"
                                         class="mark-item"
                            />
                            <beta-mark v-else-if="item.highlightTag === 'beta'"
                                       class="mark-item"
                            />
                        </span>
                    </div>
                </div>
                <!--            TODO: low priority -->
                <!--            <favorite-button v-if="item.subMenuList?.length === 0"-->
                <!--                             class="favorite-button"-->
                <!--                             :item-id="item.id"-->
                <!--                             :favorite-type="FAVORITE_TYPE.MENU"-->
                <!--                             scale="0.65"-->
                <!--            />-->
            </router-link>
            <div v-else>
                <div v-if="state.isMenuDescription"
                     class="menu-description"
                >
                    <span class="title">{{ $t('MENU.COST_EXPLORER_TITLE') }}</span>
                    <span class="desc">{{ $t('MENU.COST_EXPLORER_DESC') }}</span>
                    <div class="toolbox">
                        <p-text-button style-type="highlight"
                                       class="dismiss-button"
                                       @click="handleMenuDescription(false)"
                        >
                            {{ $t('MENU.DISMISS') }}
                        </p-text-button>
                        <p-text-button icon-right="ic_arrow-right"
                                       style-type="highlight"
                                       class="learn-more-button"
                                       @click="handleMenuDescription(true)"
                        >
                            {{ $t('MENU.LEARN_MORE') }}
                        </p-text-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.g-n-b-navigation-rail {
    @apply flex-col items-start bg-white border-r;
    top: $gnb-toolbox-height;
    width: $gnb-navigation-rail-max-width;
    height: 100%;
    padding: 1rem 0.75rem;
    .navigation-rail-wrapper {
        width: 100%;
        .service-menu {
            @apply flex items-center justify-between text-label-md;
            width: 100%;
            height: 2.125rem;
            padding-right: 0.5rem;
            padding-left: 0.5rem;
            gap: 0.75rem;
            border-radius: 0.25rem;
            .menu-wrapper {
                @apply flex items-center;
                gap: 0.625rem;
                .menu-container {
                    @apply flex items-end;
                    .mark-item {
                        margin-left: 0.125rem;
                    }
                    .learn-more-button {
                        margin-bottom: -0.125rem;
                        margin-left: 0.5rem;
                    }
                }
            }
            .favorite-button {
                @apply hidden;
            }
            &:hover:not(.is-only-label) {
                @apply bg-violet-100 cursor-pointer;
                .favorite-button {
                    @apply block;
                }
            }
            &.is-only-label {
                @apply items-end text-gray-500 cursor-default;
                height: 2.625rem;
                padding-bottom: 0.5rem;
            }
            &.is-selected {
                @apply relative bg-violet-100 text-violet-600;
                &::before {
                    @apply absolute bg-violet;
                    content: '';
                    top: 0;
                    left: -0.75rem;
                    width: 0.25rem;
                    height: 100%;
                    border-top-right-radius: 0.125rem;
                    border-bottom-right-radius: 0.125rem;
                }
            }
        }
    }
    &.is-mobile {
        transition: width 0.3s ease;
        &.is-minimize {
            width: 0;
            padding: 0;
            .service-menu, .menu-wrapper {
                width: 0;
                padding: 0;
            }
        }
    }
    &.is-minimize {
        @apply bg-gray-100 cursor-pointer;
        width: $gnb-navigation-rail-min-width;
        .service-menu {
            width: 2.25rem;
            &:hover:not(.is-only-label) {
                @apply bg-violet-200;
            }
            &.is-selected {
                @apply bg-violet-200;
            }
        }
        &:not(.is-mobile) {
            &:hover {
                @apply bg-white;
                width: $gnb-navigation-rail-max-width;
                .service-menu {
                    width: 100%;
                    &:hover:not(.is-only-label) {
                        @apply bg-violet-100;
                    }
                    &.is-selected {
                        @apply bg-violet-100;
                    }
                }
            }
        }
    }
    .menu-description {
        @apply flex flex-col bg-gray-100 text-paragraph-sm;
        padding: 0.5rem 0.875rem;
        .title {
            @apply text-paragraph-md text-gray-800;
        }
        .desc {
            @apply text-gray-600;
        }
        .toolbox {
            @apply flex items-center;
            margin-top: 0.375rem;
            gap: 0.5rem;
        }
    }
}
</style>
