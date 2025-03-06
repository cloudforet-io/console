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
import { reactive } from 'vue';

import { useProxyValue } from '@/common/composables/proxy-state';

import type { TreeNode, TreeDisplayMap } from '@/services/project/tree/type';

import TreeItem from './TreeItem.vue';

interface Props {
    treeData: TreeNode[];
    treeDisplayMap?: TreeDisplayMap;
    selectedId?: string;
}

const props = withDefaults(defineProps<Props>(), {
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
    <div class="tree-view">
        <tree-item v-for="item in treeData"
                   :key="item.id"
                   :node="item"
                   :selected-id="selectedId"
                   :is-open="state.proxyTreeDisplayMap[item.id]?.isOpen"
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
                <tree-view :tree-data="item.children"
                           :tree-display-map.sync="state.proxyTreeDisplayMap"
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

