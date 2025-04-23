<script setup lang="ts">
import type { TranslateResult } from 'vue-i18n';

import {
    PTreeNode,
} from '@cloudforet/mirinae';
import type { TreeNodeIcon, TreeNodeLink } from '@cloudforet/mirinae/types/data-display/tree/new-tree/type';

const props = withDefaults(defineProps<{
    id: string;
    name?: TranslateResult;
    icon?: TreeNodeIcon;
    selectable?: boolean;
    link?: TreeNodeLink;
}>(), {
    name: undefined,
    icon: undefined,
    selectable: false,
    link: undefined,
});


</script>

<template>
    <p-tree-node :id="props.id"
                 :name="props.name"
                 :icon="props.icon"
                 display-type="list"
                 :selectable="props.selectable"
                 :link="props.link"
    >
        <template v-for="(_, slot) of $scopedSlots"
                  #[slot]="scope"
        >
            <slot :name="slot"
                  v-bind="scope"
            />
        </template>
        <template #default>
            <span class="font-bold">
                <slot>
                    {{ props.name }}
                </slot>
            </span>
        </template>
    </p-tree-node>
</template>
