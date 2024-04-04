<script setup lang="ts">

import {
    computed, reactive, useSlots, watch,
} from 'vue';
import type { SetupContext } from 'vue/types/v3-setup-context';

import { PI, PSpinner } from '@spaceone/design-system';

import type { TreeNode, TreeOpenMap } from '@/services/project/tree/type';

interface Props {
    node: TreeNode;
    selectedId?: string;
    initialTreeOpenStateMap?: TreeOpenMap;
}

const props = defineProps<Props>();
const slots = useSlots();
const isExpandable = (_slots: SetupContext['slots']) => _slots['child-content'] !== undefined;

const emit = defineEmits<{(e: 'click-toggle', node: TreeNode): Promise<void>|void;
    (e: 'click-item', node: TreeNode): void;
}>();

const state = reactive({
    isCollapsed: true,
    toggleIcon: computed(() => (state.isCollapsed ? 'ic_caret-right' : 'ic_caret-down-filled-alt')),
    expandable: isExpandable(slots),
    fetchLoading: false,
    node: computed(() => props.node),
    isSelected: computed(() => props.selectedId === state.node.id),
});

const openToggle = () => {
    state.isCollapsed = false;
};
const closeToggle = () => {
    state.isCollapsed = true;
};

const handleClickToggle = async () => {
    if (state.isCollapsed) {
        openToggle();
    } else {
        closeToggle();
    }
};

const handleClickItem = () => {
    emit('click-item', state.node);
};

watch(() => props.initialTreeOpenStateMap, (treeOpenStateMap) => {
    if (treeOpenStateMap && treeOpenStateMap[state.node.id]) {
        openToggle();
    }
}, { immediate: true });

watch(() => state.isCollapsed, async (collapsed) => {
    if (!collapsed) {
        await emit('click-toggle', state.node);
    }
}, { immediate: true });

</script>

<template>
    <div class="tree-item">
        <component :is="state.node.data.to ? 'router-link' : 'div'"
                   :to="state.node.data.to"
                   class="content-wrapper"
                   :class="{ selected: state.node.id === props.selectedId }"
                   :style="{ 'padding-left': `${(state.node.depth || 0) * 1}rem`}"
                   @click.native="handleClickItem"
        >
            <div v-if="state.expandable"
                 class="toggle-icon"
            >
                <p-spinner v-if="state.node.loading"
                           size="sm"
                />
                <p-i v-else
                     :name="state.toggleIcon"
                     width="1rem"
                     height="1rem"
                     @click.prevent="handleClickToggle"
                />
            </div>
            <div class="content-text">
                <slot name="content"
                      v-bind="{ node: state.node }"
                />
            </div>
        </component>
        <div v-if="slots && !state.isCollapsed"
             class="child-group"
        >
            <slot name="child-content" />
        </div>
    </div>
</template>

<style lang="postcss" scoped>
.tree-item {
    @apply w-full;

    .content-wrapper {
        @apply flex items-center rounded w-full;
        padding-left: 0.125rem;

        &.selected {
            @apply bg-blue-200;
        }

        &:hover {
            @apply bg-blue-100 cursor-pointer;
        }
    }

    .child-group {
        @apply flex items-center;
    }
}
</style>
