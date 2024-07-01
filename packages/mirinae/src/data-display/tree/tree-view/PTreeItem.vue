<script setup lang="ts">

import {
    computed, reactive, useSlots,
} from 'vue';
import type { SetupContext } from 'vue/types/v3-setup-context';


import type { TreeNode } from '@/data-display/tree/tree-view/type';
import PSpinner from '@/feedbacks/loading/spinner/PSpinner.vue';
import PI from '@/foundation/icons/PI.vue';
import { useProxyValue } from '@/hooks';


interface Props {
    node: TreeNode;
    selectedId?: string;
    isOpen?: boolean;
    useDefaultIndent?: boolean;
}

const props = defineProps<Props>();
const slots = useSlots();
const isExpandable = (_slots: SetupContext['slots']) => _slots['child-content'] !== undefined;

const emit = defineEmits<{(e: 'click-toggle', node: TreeNode): Promise<void>|void;
    (e: 'click-item', node: TreeNode): void;
    (e: 'update:is-open', value: boolean): void;
}>();

const state = reactive({
    toggleIcon: computed(() => (state.proxyIsOpen ? 'ic_caret-down-filled-alt' : 'ic_caret-right')),
    fetchLoading: false,
    isSelected: computed(() => props.selectedId === props.node.id),
    proxyIsOpen: useProxyValue('isOpen', props, emit),
});

const openToggle = () => {
    state.proxyIsOpen = true;
};
const closeToggle = () => {
    state.proxyIsOpen = false;
};

const handleClickToggle = async () => {
    if (state.proxyIsOpen) {
        closeToggle();
    } else {
        openToggle();
    }
};

const handleClickItem = () => {
    emit('click-item', props.node);
};


// watch(() => state.proxyIsOpen, async (isOpen) => {
//     if (!props.node.id) return;
//     if (isOpen) {
//         await emit('click-toggle', props.node);
//     } else state.proxyIsOpen = false;
// }, { immediate: true });
//
// onMounted(() => {
//     if (state.proxyIsOpen) {
//         openToggle();
//     }
// });

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
            <div v-if="isExpandable(slots) || props.useDefaultIndent"
                 class="toggle-icon"
            >
                <p-spinner v-if="props.node.loading"
                           size="sm"
                />
                <p-i v-else-if="isExpandable(slots)"
                     :name="state.toggleIcon"
                     width="1rem"
                     height="1rem"
                     @click.prevent="handleClickToggle"
                />
            </div>
            <div :class="{'content-text': true, 'expandable': isExpandable(slots) || useDefaultIndent}">
                <slot name="content"
                      v-bind="{ node: props.node }"
                />
            </div>
        </component>
        <div v-if="slots && state.proxyIsOpen"
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

        .toggle-icon {
            min-width: 1rem;
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
