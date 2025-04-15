<script setup lang="ts">
import { PTreeNode } from '@cloudforet/mirinae';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import NewMark from '@/common/components/marks/NewMark.vue';
import UpdateMark from '@/common/components/marks/UpdateMark.vue';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import type { LSBItemProps } from '@/common/modules/navigations/new-lsb/type';

const props = withDefaults(defineProps<LSBItemProps>(), {
    icon: undefined,
    displayType: 'list',
    highlightTag: undefined,
    favoriteOptions: undefined,
    favoriteVisibility: 'always',
});

</script>

<template>
    <p-tree-node :id="props.id"
                 :name="props.name"
                 :icon="props.icon"
                 :display-type="props.displayType"
                 selectable
                 :link="props.link"
    >
        <template #outer-left>
            <slot name="outer-left" />
        </template>
        <template #inner-left>
            <slot name="inner-left" />
        </template>
        <template #default>
            <slot />
        </template>
        <template #inner-right>
            <slot name="inner-right" />
            <div v-if="props.highlightTag"
                 class="h-full mt-[-0.25rem]"
            >
                <new-mark v-if="props.highlightTag === 'new'" />
                <update-mark v-else-if="props.highlightTag === 'update'" />
                <beta-mark v-else-if="props.highlightTag === 'beta'" />
            </div>
        </template>
        <template #outer-right>
            <slot name="outer-right" />
        </template>
        <template #action="{isHovered}">
            <div v-if="props.favoriteVisibility !== 'none'"
                 v-show="props.favoriteVisibility === 'hovered-only' ? isHovered : true"
                 class="flex items-center justify-center w-6 h-6 rounded-md border border-gray-100 bg-white shadow-md"
            >
                <favorite-button :item-id="props.favoriteOptions?.id ?? props.id"
                                 :favorite-type="props.favoriteOptions?.type ?? FAVORITE_TYPE.MENU"
                                 :visible-active-case-only="props.favoriteVisibility === 'active-only'"
                                 scale="0.8"
                />
            </div>
        </template>
    </p-tree-node>
</template>

