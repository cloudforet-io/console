<script lang="ts" setup>
import { PDivider, PI } from '@spaceone/design-system';
import {
    computed, reactive,
} from 'vue';
import type { RouteLocation } from 'vue-router';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import type { LNBMenu } from '@/common/modules/navigations/lnb/type';
import { MENU_ITEM_TYPE } from '@/common/modules/navigations/lnb/type';


interface Props {
    menuData: LNBMenu;
    currentPath: string;
    depth: number;
}

const props = withDefaults(defineProps<Props>(), {
    menuData: () => ({}) as LNBMenu,
    currentPath: '',
    depth: 1,
});

const store = useStore();
const router = useRouter();
const state = reactive({
    isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
    processedMenuData: computed(() => (Array.isArray(props.menuData) ? props.menuData : [props.menuData])),
    isFolded: false,
    isFoldableMenu: computed(() => state.processedMenuData?.some((item) => item.foldable)),
    showMenu: computed(() => (state.isFoldableMenu && !state.isFolded) || !state.isFoldableMenu), // toggle menu
    hoveredItem: '',
});

const handleFoldableToggle = () => {
    state.isFolded = !state.isFolded;
};

const isSelectedMenu = (selectedMenuRoute: RouteLocation): boolean => {
    let currentPath = props.currentPath;
    if (!currentPath) return false;

    const resolved = router.resolve(selectedMenuRoute);
    if (!resolved) return false;

    if (currentPath.indexOf('?') > 0) {
        currentPath = currentPath.slice(0, currentPath.indexOf('?'));
    }
    let resolvedHref = resolved.href;
    if (!currentPath.endsWith('/')) currentPath += '/';
    if (!resolvedHref.endsWith('/')) resolvedHref += '/';
    return currentPath.startsWith(resolvedHref);
};

const getIsHovered = (itemId: string) => state.hoveredItem && state.hoveredItem === itemId;

</script>

<template>
    <div class="lnb-menu-list">
        <div v-for="(item, idx) in state.processedMenuData"
             :key="item.id"
             class="lnb-menu-item"
        >
            <p v-if="item.type === MENU_ITEM_TYPE.TITLE"
               class="title-wrapper"
            >
                <span v-if="item.foldable"
                      class="title foldable"
                      @click="handleFoldableToggle"
                >{{ item.label }}</span>
                <span v-else
                      class="title"
                >{{ item.label }}</span>
                <slot name="title-right"
                      v-bind="props"
                />
                <new-mark v-if="item.isNew" />
                <beta-mark v-if="item.isBeta" />
                <span v-if="item.foldable"
                      class="toggle-button"
                      @click="handleFoldableToggle"
                >
                    <p-i width="1rem"
                         height="1rem"
                         :name="state.isFolded ? 'ic_chevron-up' : 'ic_chevron-down'"
                         color="inherit transparent"
                    />
                </span>
            </p>
            <p v-if="item.type === MENU_ITEM_TYPE.TOP_TITLE"
               class="top-title-wrapper"
            >
                <span class="top-title">{{ item.label }}</span>
            </p>

            <div v-if="item.type === MENU_ITEM_TYPE.DIVIDER && state.showMenu"
                 class="divider"
            >
                <p-divider />
            </div>
            <router-link
                v-if="item.type === MENU_ITEM_TYPE.ITEM && state.showMenu"
                class="menu-item"
                :class="[{'second-depth': depth === 2}, {'selected': isSelectedMenu(item.to)}]"
                :to="item.to"
                @click="$event.stopImmediatePropagation()"
                @mouseenter="state.hoveredItem = item.id"
                @mouseleave="state.hoveredItem = ''"
            >
                <slot name="before-text"
                      v-bind="{...$props, item, index: idx}"
                />
                <div class="text-wrapper">
                    <p-i v-if="item.icon"
                         :name="item.icon"
                         width="1rem"
                         height="1rem"
                         class="icon"
                    />
                    <span class="text">{{ item.label }}</span>
                    <slot name="after-text"
                          v-bind="{...$props, item, index: idx}"
                    />
                    <new-mark v-if="item.isNew" />
                    <beta-mark v-if="item.isBeta" />
                </div>
                <slot name="right-extra"
                      v-bind="{...props, item, index: idx}"
                />
                <favorite-button
                    v-if="!item.hideFavorite && !state.isDomainOwner"
                    :item-id="item.id"
                    :favorite-type="item.favoriteType ? item.favoriteType : FAVORITE_TYPE.MENU"
                    :visible-active-case-only="!getIsHovered(item.id)"
                    scale="0.8"
                    class="favorite-button"
                />
            </router-link>
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.lnb-menu-item {
    .title-wrapper {
        @apply text-gray-400 font-bold inline-flex items-center;
        font-size: 0.75rem;
        line-height: 125%;
        padding-left: 0.5rem;
        height: 2rem;
        .title {
            &.foldable {
                &:hover {
                    @apply text-gray-800 cursor-pointer underline;
                }
            }
        }

        .toggle-button {
            &:hover {
                @apply text-gray-800 cursor-pointer;
            }
        }
    }
    .top-title-wrapper {
        @apply font-bold inline-flex items-center;
        font-size: 0.75rem;
        line-height: 125%;
        padding-top: 1.25rem;
        padding-left: 0.5rem;
        padding-bottom: 0.75rem;
    }
    .menu-item {
        @apply border border-transparent inline-flex items-center w-full h-full justify-between;
        font-size: 0.875rem;
        line-height: 125%;
        border-radius: 4px;
        box-sizing: border-box;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        outline: 0;
        height: 2rem;

        &.second-depth {
            padding-left: 1.25rem;
        }
        &:focus, &:focus-within, &:active {
            @apply bg-white border-secondary1;
            box-shadow: 0 0 0 2px rgb(theme('colors.secondary1') 0.2);
        }
        &.selected {
            @apply bg-blue-200;
        }
        &:hover {
            @apply bg-blue-100 cursor-pointer;
        }
        .text-wrapper {
            @apply inline-flex overflow-hidden whitespace-no-wrap;
            .text {
                @apply overflow-hidden whitespace-no-wrap;
                text-overflow: ellipsis;
            }
            .icon {
                flex-shrink: 0;
                margin-right: 0.25rem;
            }
        }
        .favorite-button {
            flex-shrink: 0;
            margin-left: 0.25rem;
        }
    }
    .divider {
        margin-top: 1.25rem;
        margin-bottom: 1.25rem;
        height: 0;
    }
}
</style>
