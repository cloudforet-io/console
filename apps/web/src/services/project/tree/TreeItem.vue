<script setup lang="ts">

import {
    computed, reactive, useSlots, watch,
} from 'vue';
import type { SetupContext } from 'vue/types/v3-setup-context';

import { PI, PSpinner } from '@spaceone/design-system';

import type { TreeNode, TreeDisplayMap } from '@/services/project/tree/type';

interface Props {
    node: TreeNode;
    selectedId?: string;
    initialTreeDisplayMap?: TreeDisplayMap;
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
    fetchLoading: false,
    isSelected: computed(() => props.selectedId === props.node.id),
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

watch(() => props.initialTreeDisplayMap, (treeOpenStateMap) => {
    if (treeOpenStateMap && treeOpenStateMap[props.node.id]) {
        openToggle();
    }
});

watch(() => state.isCollapsed, async (collapsed) => {
    if (!collapsed) {
        await emit('click-toggle', state.node);
    }
}, { immediate: true });

</script>

<template>
    <div class="tree-item">
        <component :is="props.node.data.to ? 'router-link' : 'div'"
                   :to="props.node.data.to"
                   class="content-wrapper"
                   :class="{ selected: props.node.id === props.selectedId }"
                   :style="{ 'padding-left': `${0.125 + (props.node.depth || 0) * 1}rem`}"
                   @click.native="handleClickItem"
        >
            <div v-if="isExpandable(slots)"
                 class="toggle-icon"
            >
                <p-spinner v-if="props.node.loading"
                           size="sm"
                />
                <p-i v-else
                     :name="state.toggleIcon"
                     width="1rem"
                     height="1rem"
                     @click.prevent="handleClickToggle"
                />
            </div>
            <div :class="{'content-text': true, 'expandable': isExpandable(slots)}">
                <slot name="content"
                      v-bind="{ node: props.node }"
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
        padding-right: 0.5rem;

        &:hover {
            @apply bg-blue-100 cursor-pointer;
        }

        &.selected {
            @apply bg-blue-200;
        }

        .content-text {
            @apply w-full;

            &.expandable {
                width: calc(100% - 1rem);
            }
        }
    }

    .child-group {
        @apply flex items-center;
    }
}
</style>
