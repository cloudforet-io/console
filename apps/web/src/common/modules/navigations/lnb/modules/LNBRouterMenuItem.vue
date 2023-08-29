<script setup lang="ts">
import { reactive } from 'vue';
import type { Location } from 'vue-router';

import { PI } from '@spaceone/design-system';

import { SpaceRouter } from '@/router';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import type { LNBMenu } from '@/common/modules/navigations/lnb/type';

interface Props {
    item: LNBMenu;
    depth?: number;
    isDomainOwner?: boolean;
    idx?: number | string;
    currentPath?: string;
}

const props = defineProps<Props>();
const state = reactive({
    hoveredItem: '',
});

const getIsHovered = (itemId: string) => state.hoveredItem && state.hoveredItem === itemId;
const isSelectedMenu = (selectedMenuRoute: Location): boolean => {
    let currentPath = props.currentPath;
    console.debug('currentPath', currentPath, selectedMenuRoute);
    if (!currentPath) return false;

    const resolved = SpaceRouter.router.resolve(selectedMenuRoute);
    if (!resolved) return false;

    if (currentPath.indexOf('?') > 0) {
        currentPath = currentPath.slice(0, currentPath.indexOf('?'));
    }
    let resolvedHref = resolved.href;
    if (!currentPath.endsWith('/')) currentPath += '/';
    if (!resolvedHref.endsWith('/')) resolvedHref += '/';
    return currentPath.startsWith(resolvedHref);
};

</script>

<template>
    <fragment>
        <router-link class="l-n-b-router-menu-item"
                     :class="[{'second-depth': depth === 2}, {'selected': isSelectedMenu(item.to)}]"
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
                     :name="item.icon"
                     width="1rem"
                     height="1rem"
                     class="icon"
                />
                <span class="text">{{ item.label }}</span>
                <slot name="after-text"
                      v-bind="{...props, item, index: idx}"
                />
                <new-mark v-if="item.isNew" />
                <beta-mark v-if="item.isBeta" />
            </div>
            <slot name="right-extra"
                  v-bind="{...props, item, index: idx}"
            />
            <favorite-button
                v-if="!item.hideFavorite && !isDomainOwner"
                :item-id="item.id"
                :favorite-type="item.favoriteType ? item.favoriteType : FAVORITE_TYPE.MENU"
                :visible-active-case-only="!getIsHovered(item.id)"
                scale="0.8"
                class="favorite-button"
            />
        </router-link>
        <slot name="bottom-extra" />
    </fragment>
</template>

<style lang="postcss" scoped>
.l-n-b-router-menu-item {
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
        box-shadow: 0 0 0 2px rgba(theme('colors.secondary1'), 0.2);
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
</style>
