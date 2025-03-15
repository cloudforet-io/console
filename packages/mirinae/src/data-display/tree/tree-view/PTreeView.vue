<script lang="ts">
// eslint-disable-next-line import/order,import/no-duplicates
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'PTreeView',
});
</script>
<script setup lang="ts">
/* eslint-disable import/first */
// eslint-disable-next-line import/no-duplicates
import { reactive } from 'vue';

import PTreeItem from '@/data-display/tree/tree-view/PTreeItem.vue';
import type { TreeDisplayMap, TreeNode } from '@/data-display/tree/tree-view/type';
import { useProxyValue } from '@/hooks';





const props = withDefaults(defineProps<{
    treeData: TreeNode[];
    treeDisplayMap?: TreeDisplayMap;
    selectedId?: string;
    useDefaultIndent?: boolean;
}>(), {
    treeDisplayMap: () => ({}),
    selectedId: undefined,
});
const emit = defineEmits<{(event: 'click-toggle', node: TreeNode): Promise<void>|void;
    (e: 'click-item', node: TreeNode): void;
    (e: 'update:tree-display-map', value: TreeDisplayMap): void;
}>();

const state = reactive({
    proxyTreeDisplayMap: useProxyValue('treeDisplayMap', props, emit),
});

const handleClickToggle = async (item: TreeNode) => {
    await emit('click-toggle', item);
};
const handleClickItem = (item: TreeNode) => {
    emit('click-item', item);
};

const handleUpdateTreeDisplayMap = (id: string|undefined, isOpen: boolean) => {
    if (!id) return;
    state.proxyTreeDisplayMap = {
        ...state.proxyTreeDisplayMap,
        [id]: {
            isOpen,
        },
    };
};

</script>
<template>
    <div class="p-tree-view">
        <p-tree-item v-for="item in treeData"
                     :key="item.id"
                     :node="item"
                     :selected-id="selectedId"
                     :is-open="state.proxyTreeDisplayMap[item.id] ? state.proxyTreeDisplayMap[item.id].isOpen : undefined"
                     :use-default-indent="useDefaultIndent"
                     @click-toggle="handleClickToggle"
                     @click-item="handleClickItem"
                     @update:is-open="handleUpdateTreeDisplayMap(item.id, $event)"
        >
            <template #content="{ node }">
                <slot name="content"
                      v-bind="{ node }"
                />
            </template>
            <template v-if="Array.isArray(item.children)"
                      #child-content
            >
                <p-tree-view :tree-data="item.children"
                             :tree-display-map.sync="state.proxyTreeDisplayMap"
                             :selected-id="selectedId"
                             :use-default-indent="useDefaultIndent"
                             @click-toggle="handleClickToggle"
                             @click-item="handleClickItem"
                >
                    <template #content="{ node }">
                        <slot name="content"
                              v-bind="{ node }"
                        />
                    </template>
                </p-tree-view>
            </template>
        </p-tree-item>
    </div>
</template>

<style scoped lang="postcss">
.p-tree-view {
    width: 100%;
}
</style>

