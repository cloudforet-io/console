<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'TreeView',
});
</script>
<script setup lang="ts">
/* eslint-disable import/first */
// eslint-disable-next-line import/no-duplicates
import type { TreeNode, TreeDisplayMap } from '@/services/project/tree/type';

import TreeItem from './TreeItem.vue';

interface Props {
    treeData: TreeNode[];
    initialTreeDisplayMap?: TreeDisplayMap;
    selectedId?: string;
}

defineProps<Props>();
const emit = defineEmits<{(event: 'click-toggle', node: TreeNode): Promise<void>|void;
    (e: 'click-item', node: TreeNode): void;
}>();

const handleClickToggle = async (item: TreeNode) => {
    await emit('click-toggle', item);
};
const handleClickItem = (item: TreeNode) => {
    emit('click-item', item);
};
</script>
<template>
    <div class="tree-view">
        <tree-item v-for="item in treeData"
                   :key="item.id"
                   :node="item"
                   :selected-id="selectedId"
                   :initial-tree-display-map="initialTreeDisplayMap"
                   @click-toggle="handleClickToggle(item)"
                   @click-item="handleClickItem(item)"
        >
            <template #content="{ node }">
                <slot name="content"
                      v-bind="{ node }"
                />
            </template>
            <template v-if="Array.isArray(item.children)"
                      #child-content
            >
                <tree-view :tree-data="item.children"
                           :initial-tree-display-map="initialTreeDisplayMap"
                           :selected-id="selectedId"
                           @click-toggle="handleClickToggle"
                           @click-item="handleClickItem"
                >
                    <template #content="{ node }">
                        <slot name="content"
                              v-bind="{ node }"
                        />
                    </template>
                </tree-view>
            </template>
        </tree-item>
    </div>
</template>

<style scoped lang="postcss">
.tree-view {
    width: 100%;
}
</style>

