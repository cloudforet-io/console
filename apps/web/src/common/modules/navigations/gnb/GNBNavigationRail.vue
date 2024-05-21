<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import {
    computed, onMounted, reactive,
} from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    PI, screens, PButton, PTextButton, PTooltip,
} from '@spaceone/design-system';
import type { ContextMenuType } from '@spaceone/design-system/src/inputs/context-menu/type';
import { clone, isEmpty } from 'lodash';

import { store } from '@/store';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import type { DisplayMenu } from '@/store/modules/display/type';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CostDataSourceReferenceMap } from '@/store/reference/cost-data-source-reference-store';

import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';
import UpdateMark from '@/common/components/marks/UpdateMark.vue';
import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import { useGnbStore } from '@/common/modules/navigations/stores/gnb-store';

import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';

interface GNBMenuType extends DisplayMenu {
    type: string;
    name?: string;
    disabled?: boolean;
}

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const { getProperRouteLocation } = useProperRouteLocation();
const gnbStore = useGnbStore();
const gnbGetters = gnbStore.getters;
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceGetters = userWorkspaceStore.getters;

const route = useRoute();
const router = useRouter();
const { width } = useWindowSize();

const storeState = reactive({
    isHideNavRail: computed(() => gnbGetters.isHideNavRail),
    isMinimizeNavRail: computed(() => gnbGetters.isMinimizeNavRail),
    currentWorkspaceId: computed(() => userWorkspaceGetters.currentWorkspaceId),
    costDataSource: computed<CostDataSourceReferenceMap>(() => allReferenceGetters.costDataSource),
});
const state = reactive({
    isInit: false as boolean|undefined,
    isHovered: false,
    isMobileSize: computed<boolean>(() => width.value < screens.mobile.max),
    isMenuDescription: undefined as boolean | undefined,
    gnbMenuList: computed<GNBMenuType[]|undefined>(() => {
        let results = [] as GNBMenuType[];
        const menuList = [...store.getters['display/GNBMenuList']];
        if (state.isInit && isEmpty(storeState.costDataSource)) {
            results = refinedMenuList(menuList, MENU_ID.COST_EXPLORER);
        } else results = menuList;
        return results;
    }),
    visibleGnbMenuList: computed<GNBMenuType[]>(() => {
        let result = [] as GNBMenuType[];
        state.gnbMenuList?.forEach((menu) => {
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
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
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
        router.push(getProperRouteLocation({
            name: COST_EXPLORER_ROUTE.LANDING._NAME,
        }));
    }
};
const handleMinimizedGnbRail = () => {
    gnbStore.createMinimizeNavRail(!gnbGetters.isMinimizeNavRail);
};
const convertGNBMenuToMenuItem = (menuList: DisplayMenu[], menuType: ContextMenuType = 'item'): GNBMenuType[] => menuList.map((menu) => ({
    ...menu,
    name: menu.id,
    type: menuType,
    disabled: menuType === 'header' && menu.id.includes('cost'),
}));
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

onMounted(async () => {
    state.isInit = true;
});
</script>

<template>
    <div class="g-n-b-navigation-rail"
         :class="{'is-minimize': storeState.isMinimizeNavRail, 'is-mobile': state.isMobileSize, 'is-hide': !state.isMobileSize && storeState.isHideNavRail}"
         @mouseover="handleMouseEvent(true)"
         @mouseleave="handleMouseEvent(false)"
    >
        <p-tooltip class="minimize-button-wrapper"
                   position="bottom"
                   :contents="storeState.isMinimizeNavRail ? $t('COMMON.GNB.TOOLTIP.EXPAND_GNB_RAIL') : $t('COMMON.GNB.TOOLTIP.MINIMIZE_GNB_RAIL')"
                   @click="handleMinimizedGnbRail"
        >
            <p-i :name="storeState.isMinimizeNavRail ? 'ic_double-chevron-right' : 'ic_double-chevron-left'"
                 class="menu-button"
                 height="1.5rem"
                 width="1.5rem"
                 color="inherit"
            />
        </p-tooltip>
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
                <div v-if="!storeState.isHideNavRail"
                     class="menu-wrapper"
                >
                    <p-i v-if="item.subMenuList?.length === 0"
                         :name="item.icon"
                         class="menu-button"
                         height="1.25rem"
                         width="1.25rem"
                         color="inherit"
                    />
                    <div class="menu-container">
                        <span v-if="!storeState.isMinimizeNavRail || state.isHovered"
                              class="menu-title"
                        >
                            {{ item.label }}
                        </span>
                        <p-button v-if="item.disabled && !state.isMenuDescription"
                                  icon-right="ic_arrow-right"
                                  style-type="tertiary"
                                  size="sm"
                                  class="learn-more-button"
                                  @click.stop.prevent="handleMenuDescription(true)"
                        >
                            {{ $t('MENU.LEARN_MORE') }}
                        </p-button>
                        <span v-if="item.highlightTag && (!storeState.isMinimizeNavRail || state.isHovered)"
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
    @apply relative flex-col items-start bg-white border-r overflow-y-auto overflow-x-hidden;
    top: $gnb-toolbox-height;
    width: $gnb-navigation-rail-max-width;
    height: calc(100% - $gnb-toolbox-height);
    padding: 1rem 0.75rem;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12);
    z-index: 51;
    transition: width 0.3s ease;
    .navigation-rail-wrapper {
        width: calc($gnb-navigation-rail-max-width - 1.625rem);
        transition: width 0.3s ease;
        .service-menu {
            @apply flex items-center justify-between text-label-md;
            width: 100%;
            height: 2rem;
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
                    top: 0.125rem;
                    left: -0.75rem;
                    width: 0.25rem;
                    height: 1.75rem;
                    border-top-right-radius: 0.25rem;
                    border-bottom-right-radius: 0.25rem;
                }
            }
        }
    }
    .minimize-button-wrapper {
        @apply hidden absolute bg-white border border-gray-200 text-gray-500 cursor-pointer;
        top: 1.125rem;
        right: 0;
        padding: 0.125rem;
        border-right: hidden;
        border-top-left-radius: 6.25rem;
        border-bottom-left-radius: 6.25rem;
        transition: padding 0.1s ease;
        z-index: 50;
        &:hover {
            @apply bg-violet-200 text-violet-600;
            padding-right: 0.75rem;
            padding-left: 0.25rem;
        }
    }
    &:hover {
        .minimize-button-wrapper {
            @apply block;
        }
    }
    &.is-hide {
        @apply bg-transparent;
        width: 0;
        padding: 0;
        transition: width 0.3s ease;
        .minimize-button-wrapper, .service-menu, .menu-wrapper {
            width: 0;
            padding: 0;
        }
    }
    &.is-mobile {
        .minimize-button-wrapper {
            width: 0;
            padding: 0;
        }
        &.is-minimize {
            transition: width 0.3s ease;
            width: 0;
            padding: 0;
        }
    }
    &.is-minimize:not(.is-mobile, .is-hide) {
        @apply bg-gray-100 cursor-pointer;
        z-index: 49;
        width: $gnb-navigation-rail-min-width;
        box-shadow: unset;
        .minimize-button-wrapper {
            @apply hidden;
        }
        .service-menu {
            width: 2.25rem;
            .learn-more-button {
                @apply hidden;
            }
            &:hover:not(.is-only-label) {
                @apply bg-violet-200;
            }
            &.is-selected {
                @apply bg-violet-200;
            }
        }
        &:hover {
            @apply bg-white;
            width: $gnb-navigation-rail-max-width;
            z-index: 51;
            .minimize-button-wrapper {
                @apply block;
            }
            .service-menu {
                width: 100%;
                .learn-more-button {
                    @apply block;
                }
                &:hover:not(.is-only-label) {
                    @apply bg-violet-100;
                }
                &.is-selected {
                    @apply bg-violet-100;
                }
            }
            .menu-description {
                @apply flex;
            }
        }
        .menu-description {
            @apply hidden;
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
