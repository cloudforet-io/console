<script setup lang="ts">
import { reactive } from 'vue';
import type { Location } from 'vue-router';

import { PI } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';
import UpdateMark from '@/common/components/marks/UpdateMark.vue';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import type { LSBMenu, LSBIcon } from '@/common/modules/navigations/lsb/type';

interface Props {
    item: LSBMenu;
    depth?: number;
    isAdminMode?: boolean;
    idx?: number | string;
    currentPath?: string;
    openNewTab?: boolean;
    isHideFavorite?: boolean;
}

const props = defineProps<Props>();
const state = reactive({
    hoveredItem: '',
});

const getIsHovered = (itemId: string) => state.hoveredItem && state.hoveredItem === itemId;
const isSelectedMenu = (selectedMenuRoute: Location): boolean => {
    let currentPath = props.currentPath;
    if (!currentPath) return false;

    const resolved = SpaceRouter.router.resolve(selectedMenuRoute);
    if (!resolved) return false;

    if (currentPath.indexOf('?') > 0) {
        currentPath = currentPath.slice(0, currentPath.indexOf('?'));
    }
    const resolvedHref = resolved.href;
    return currentPath === resolvedHref;
};
const getIconName = (icon: LSBIcon): string => {
    if (typeof icon === 'string') return icon;
    return icon.name;
};

</script>

<template>
    <router-link class="l-s-b-router-menu-item "
                 :class="[{'second-depth': depth === 2, 'selected': isSelectedMenu(item.to), 'is-hide-favorite': props.isHideFavorite}]"
                 :target="openNewTab ? '_blank' : '_self'"
                 :to="item.to"
                 @click.native="$event.stopImmediatePropagation()"
                 @mouseenter.native="state.hoveredItem = item.id"
                 @mouseleave.native="state.hoveredItem = ''"
    >
        <slot name="before-text"
              v-bind="{...props, item, index: idx}"
        />
        <div class="text-wrapper">
            <p-i v-if="item.icon"
                 :name="getIconName(item.icon)"
                 :color="item.icon.color"
                 width="1rem"
                 height="1rem"
                 class="icon"
            />
            <span class="text">{{ item.label }}</span>
            <slot name="after-text"
                  v-bind="{...props, item, index: idx}"
            />
            <span class="mark-wrapper">
                <new-mark v-if="item.highlightTag === 'new'" />
                <update-mark v-else-if="item.highlightTag === 'update'" />
                <beta-mark v-else-if="item.highlightTag === 'beta'" />
            </span>
        </div>
        <slot name="right-extra"
              v-bind="{...props, item, index: idx}"
        />
        <favorite-button
            v-if="!item.hideFavorite && !isAdminMode"
            :item-id="item.favoriteOptions?.id ? item.favoriteOptions.id : item.id"
            :favorite-type="item.favoriteOptions?.type ? item.favoriteOptions.type : FAVORITE_TYPE.MENU"
            :visible-active-case-only="!getIsHovered(item.id)"
            scale="0.8"
            class="favorite-button"
        />
    </router-link>
</template>

<style lang="postcss" scoped>
.l-s-b-router-menu-item {
    @apply border border-transparent inline-flex items-center w-full h-full justify-between text-gray-800;
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
        box-shadow: 0 0 0 2px rgba(theme('colors.secondary1'), 0.2);
    }
    &.selected {
        @apply bg-blue-200;
    }
    &.is-hide-favorite {
        .favorite-button {
            @apply hidden;
        }
        &:hover {
            .favorite-button {
                @apply block;
            }
        }
    }
    &:hover {
        @apply bg-blue-100 cursor-pointer;
    }
    .text-wrapper {
        @apply inline-flex items-center overflow-hidden whitespace-no-wrap;
        .text {
            @apply overflow-hidden whitespace-no-wrap;
            text-overflow: ellipsis;
        }
        .icon {
            flex-shrink: 0;
            margin-right: 0.25rem;
        }
        .mark-wrapper {
            height: 100%;
            margin-top: -0.25rem;
        }
    }
    .favorite-button {
        flex-shrink: 0;
        margin-left: 0.25rem;
    }
}
</style>
