<script setup lang="ts">
import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import { PLazyImg, PI } from '@cloudforet/mirinae';

import { useLsbRouterItemState } from '@/common/modules/navigations/new-lsb/composables/use-lsb-router-item-state';
import type { LSBIcon } from '@/common/modules/navigations/new-lsb/type';

const props = defineProps<{
    label?: TranslateResult;
    icon?: LSBIcon;
    imgIcon?: string;
    to?: Location;
    currentPath?: string;
    openNewTab?: boolean;
}>();

const {
    isSelected,
    iconName,
    iconColor,
    imgIconUrl,
} = useLsbRouterItemState(props);
</script>

<template>
    <router-link ref="itemEl"
                 class="lsb-router-button inline-flex items-center w-full h-8 justify-between px-2 border border-transparent outline-none rounded-md text-gray-800"
                 :class="[{'selected': isSelected}]"
                 :target="props.openNewTab ? '_blank' : '_self'"
                 :to="props.to ? props.to : {}"
                 @click.native="$event.stopImmediatePropagation()"
    >
        <slot name="before-text"
              v-bind="props"
        />
        <div ref="textEl"
             class="inline-flex items-center gap-1 overflow-hidden whitespace-no-wrap"
        >
            <p-i v-if="props.icon"
                 :name="iconName"
                 :color="iconColor"
                 width="1rem"
                 height="1rem"
                 class="flex-shrink-0"
            />
            <p-lazy-img
                v-if="props.imgIcon"
                :src="imgIconUrl"
                width="1rem"
                height="1rem"
                class="flex-shrink-0"
            />
            <span class="text-label-md">
                <slot>
                    {{ props.label }}
                </slot>
            </span>
            <slot name="after-text"
                  v-bind="props"
            />
        </div>
        <slot name="right-extra"
              v-bind="props"
        />
    </router-link>
</template>

<style scoped lang="postcss">
.lsb-router-button {
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
}
</style>
