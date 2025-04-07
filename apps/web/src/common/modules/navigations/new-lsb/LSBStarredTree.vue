<script setup lang="ts">
import { PTreeNode, PEmpty } from '@cloudforet/mirinae';

import LSBItem from '@/common/modules/navigations/new-lsb/LSBItem.vue';
import type { LSBItemProps } from '@/common/modules/navigations/new-lsb/type';

const props = defineProps<{
    expanded?: boolean;
    items: LSBItemProps[];
}>();
</script>

<template>
    <p-tree-node id="starred"
                 icon="ic_multi-favorite"
                 display-type="tree"
                 :expanded="props.expanded"
                 has-children
    >
        <template v-for="(_, slot) of $scopedSlots"
                  #[slot]="scope"
        >
            <slot :name="slot"
                  v-bind="scope"
            />
        </template>
        <span class="font-bold">{{ $t('COMMON.STARRED') }}</span>
        <template #children>
            <div v-if="props.items.length > 0"
                 class="max-h-[21rem] overflow-x-auto"
            >
                <l-s-b-item v-for="item in props.items"
                            :id="item.id"
                            :key="item.id"
                            :name="item.name"
                            display-type="tree"
                            :icon="item.icon"
                            :link="item.link"
                            :favorite-options="item.favoriteOptions"
                            favorite-visibility="hovered-only"
                />
            </div>
            <p-empty v-else>
                {{ $t('COMMON.STARRED_NO_DATA') }}
            </p-empty>
        </template>
    </p-tree-node>
</template>
