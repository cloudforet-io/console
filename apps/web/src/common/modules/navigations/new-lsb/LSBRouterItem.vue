<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import type { Ref } from 'vue';
import {
    computed, reactive, ref,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import { PI, PLazyImg, PTooltip } from '@cloudforet/mirinae';

import type { MenuId } from '@/lib/menu/config';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';
import UpdateMark from '@/common/components/marks/UpdateMark.vue';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE, type FavoriteOptions } from '@/common/modules/favorites/favorite-button/type';
import { useLsbRouterItemState } from '@/common/modules/navigations/new-lsb/composables/use-lsb-router-item-state';
import type { HighlightTagType, LSBIcon, LSBRouterPredicate } from '@/common/modules/navigations/new-lsb/type';

interface Props {
    id: string;
    label?: TranslateResult;
    icon?: LSBIcon;
    imgIcon?: string;
    to?: Location;
    currentPath?: string;
    predicate?: LSBRouterPredicate;
    openNewTab?: boolean;
    highlightTag?: HighlightTagType;
    favoriteOptions?: FavoriteOptions;
    hideFavorite?: boolean;
    isAdminMode?: boolean;
    index?: number | string;
}

const props = defineProps<Props>();

const itemEl = ref<HTMLElement | null>(null);
const textEl = ref<HTMLElement | null>(null);

const state = reactive({
    itemWidth: computed<Ref<number>>(() => useElementSize(itemEl.value).width),
    textWidth: computed<Ref<number>>(() => useElementSize(textEl.value).width),
    hoveredItem: '' as MenuId | string,
    isEllipsis: computed<boolean>(() => state.hoveredItem === props.id && (state.itemWidth.value - 20 === state.textWidth.value)),
});

const getIsHovered = (itemId?: MenuId | string) => state.hoveredItem && state.hoveredItem === itemId;
const {
    isSelected,
    iconName,
    iconColor,
    imgIconUrl,
} = useLsbRouterItemState(props);
</script>

<template>
    <router-link ref="itemEl"
                 class="lsb-router-item inline-flex items-center w-full h-8 justify-between px-2 border border-transparent outline-none rounded-md text-label-md text-gray-800"
                 :class="[{'selected': isSelected, 'is-hide-favorite': props.hideFavorite}]"
                 :target="props.openNewTab ? '_blank' : '_self'"
                 :to="props.to ? props.to : {}"
                 @click.native="$event.stopImmediatePropagation()"
                 @mouseenter.native="state.hoveredItem = props.id"
                 @mouseleave.native="state.hoveredItem = ''"
    >
        <slot name="before-text"
              v-bind="props"
        />
        <div ref="textEl"
             class="inline-flex items-center overflow-hidden whitespace-no-wrap"
        >
            <p-i v-if="props.icon"
                 :name="iconName"
                 :color="iconColor"
                 width="1rem"
                 height="1rem"
                 class="flex-shrink-0 ml-1"
            />
            <p-lazy-img
                v-if="props.imgIcon"
                :src="imgIconUrl"
                width="1rem"
                height="1rem"
                class="flex-shrink-0 ml-1"
            />
            <slot>
                <div class="item-text overflow-hidden whitespace-no-wrap">
                    <p-tooltip v-if="state.isEllipsis"
                               position="bottom-start"
                               :contents="props.label"
                    >
                        {{ props.label }}
                    </p-tooltip>
                    <span v-else>{{ props.label }}</span>
                </div>
            </slot>
            <slot name="after-text"
                  v-bind="props"
            />
            <span class="mark-wrapper h-full">
                <new-mark v-if="props.highlightTag === 'new'" />
                <update-mark v-else-if="props.highlightTag === 'update'" />
                <beta-mark v-else-if="props.highlightTag === 'beta'" />
            </span>
        </div>
        <slot name="right-extra"
              v-bind="props"
        />
        <favorite-button
            v-if="!hideFavorite && !isAdminMode"
            :item-id="props.favoriteOptions?.id ? props.favoriteOptions.id : props.id"
            :favorite-type="props.favoriteOptions?.type ? props.favoriteOptions.type : FAVORITE_TYPE.MENU"
            :visible-active-case-only="!getIsHovered(props.id)"
            scale="0.8"
            class="flex-shrink-0 ml-1"
        />
    </router-link>
</template>

<style lang="postcss" scoped>
.lsb-router-item {
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
    &:hover:not(.selected) {
        @apply bg-blue-100 cursor-pointer;
    }
    .item-text {
        text-overflow: ellipsis;
    }
    .mark-wrapper {
        margin-top: -0.25rem;
    }
}
</style>
