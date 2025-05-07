<script setup lang="ts">
import { computed, ref, toRef } from 'vue';

import type { TranslateResult } from 'vue-i18n';

import PTooltip from '@/data-display/tooltips/PTooltip.vue';
import { useTreeNodeIcon } from '@/data-display/tree/new-tree/composables/use-tree-node-icon';
import { useTreeNodeSelect } from '@/data-display/tree/new-tree/composables/use-tree-node-select';
import { useTreeNodeToggle } from '@/data-display/tree/new-tree/composables/use-tree-node-toggle';
import type {
    TreeNodeDisplayType, TreeNodeIcon, TreeNodeLink,
} from '@/data-display/tree/new-tree/type';
import PLazyImg from '@/feedbacks/loading/lazy-img/PLazyImg.vue';
import PSpinner from '@/feedbacks/loading/spinner/PSpinner.vue';
import PI from '@/foundation/icons/PI.vue';
import { useTextEllipsis } from '@/hooks/use-text-ellipsis/use-text-ellipsis';

// CAUTION: Props should be defined here due to the limitation of `script setup` of Vue 2.7.
const props = withDefaults(defineProps<{
  id: string;
  name?: TranslateResult;
  icon?: TreeNodeIcon;
  displayType?: TreeNodeDisplayType;
  selectable?: boolean;
  draggable?: boolean;
  // work only when displayType is 'tree'
  depth?: number;
  expanded?: boolean; // toggle state
  loading?: boolean; // loading state for children
  hasChildren?: boolean;
  // select and link
  link?: TreeNodeLink; // for router link. work only when selectable is true
  selected?: boolean; // for manual selection without link. work only when selectable is true
}>(), {
    name: undefined,
    icon: undefined,
    displayType: 'tree',
    selectable: false,
    draggable: false,
    depth: 0,
    expanded: false,
    loading: false,
    hasChildren: false,
    link: undefined,
    selected: false,
});
// CAUTION: Emit should be defined here due to the limitation of `script setup` of Vue 2.7.
const emit = defineEmits<{(e: 'update:selected', value: boolean): void;
  (e: 'update:expanded', value: boolean): void;
}>();

/* hover */
const hoveredItem = ref<string>('');
const isHovered = computed(() => hoveredItem.value && hoveredItem.value === props.id);

/* text ellipsis */
const textEl = ref<HTMLElement | null>(null);
const { isEllipsis } = useTextEllipsis({ textEl });

/* route */
const {
    isSelected,
    target,
    to,
} = useTreeNodeSelect({
    selectable: toRef(props, 'selectable'),
    link: toRef(props, 'link'),
    selected: toRef(props, 'selected'),
}, emit);

/* icon */
const {
    iconName,
    iconColor,
    imgUrl,
} = useTreeNodeIcon(toRef(props, 'icon'));

/* toggle */
const {
    enableToggle, showToggle, isExpanded,
} = useTreeNodeToggle({
    loading: toRef(props, 'loading'),
    expanded: toRef(props, 'expanded'),
    hasChildren: toRef(props, 'hasChildren'),
    displayType: toRef(props, 'displayType'),
}, emit);


/* depth */
const depthArray = computed(() => Array.from({ length: props.depth }, (_, i) => `${i}`));

/* component */
const component = computed(() => (props.link ? 'router-link' : 'div'));

/* slot props */
const slotProps = computed(() => ({
    ...props,
    isHovered,
    enableToggle,
    showToggle,
    isExpanded,
    isSelected,
    isEllipsis,
}));

const handleClick = () => {
    if (props.link) return;
    isSelected.value = !isSelected.value;
};
</script>

<template>
    <div class="p-tree-node">
        <div class="tree-node-wrapper"
             :class="{'selected': isSelected, 'selectable': props.selectable, 'draggable': props.draggable}"
             @mouseenter="hoveredItem = props.id"
             @mouseleave="hoveredItem = ''"
        >
            <component :is="component"
                       class="node-outer-container"
                       :target="target"
                       :to="to"
                       @click.native.prevent="handleClick"
                       @click.prevent="handleClick"
            >
                <div v-for="dep in depthArray"
                     :key="`depth-${dep}`"
                     class="depth-spacer"
                />
                <slot name="outer-left"
                      v-bind="slotProps"
                />
                <div v-if="props.draggable"
                     class="drag-handle"
                >
                    <p-i name="ic_drag-handle"
                         width="1rem"
                         height="1rem"
                    />
                </div>
                <div v-if="enableToggle"
                     class="toggle-container"
                >
                    <template v-if="showToggle">
                        <p-spinner v-if="props.loading"
                                   size="xs"
                                   style-type="gray"
                                   class="toggle-button"
                        />
                        <p-i v-else
                             name="ic_chevron-down"
                             width="1rem"
                             height="1rem"
                             color="inherit transparent"
                             class="toggle-button"
                             :class="{ 'is-collapsed': !isExpanded }"
                             @click.prevent="isExpanded = !isExpanded"
                        />
                    </template>
                </div>
                <div class="node-inner-container">
                    <p-i v-if="iconName"
                         :name="iconName"
                         :color="iconColor"
                         width="1rem"
                         height="1rem"
                         class="icon"
                    />
                    <p-lazy-img v-else-if="imgUrl"
                                :src="imgUrl"
                                width="1rem"
                                height="1rem"
                                class="icon"
                    />
                    <slot name="inner-left"
                          v-bind="slotProps"
                    />
                    <div ref="textEl"
                         class="text-container"
                    >
                        <p-tooltip :key="`${props.id}-tooltip-${isEllipsis}`"
                                   position="bottom-start"
                                   :contents="isHovered && isEllipsis ? props.name : ''"
                        >
                            <slot v-bind="slotProps">
                                {{ props.name }}
                            </slot>
                        </p-tooltip>
                    </div>
                    <slot name="inner-right"
                          v-bind="slotProps"
                    />
                </div>
                <slot name="outer-right"
                      v-bind="slotProps"
                />
            </component>
            <div v-show="isHovered"
                 class="node-action-container"
            >
                <slot name="action"
                      v-bind="slotProps"
                />
            </div>
        </div>
        <div v-if="showToggle && isExpanded"
             class="children-wrapper"
        >
            <slot name="children"
                  v-bind="slotProps"
            />
        </div>
    </div>
</template>

<style lang="postcss">
.p-tree-node {
    > .tree-node-wrapper {
        @apply relative border border-transparent outline-none rounded-md text-label-md;
        &.draggable {
            @apply cursor-move;
        }
        &.selectable {
            &:focus {
                @apply bg-white border-secondary1;
                box-shadow: 0 0 0 2px rgba(theme('colors.secondary1'), 0.2);
            }
            &:active {
                box-shadow: none;
            }
        }
        &.selected {
            @apply bg-blue-200;
        }
        &.selectable:hover {
            @apply cursor-pointer;
            &:not(.selected) {
                @apply bg-blue-100;
            }
        }
        > .node-outer-container {
            @apply inline-flex items-center w-full h-8 justify-between px-1 text-gray-800;
            > .depth-spacer {
                @apply w-4 flex-shrink-0;
            }
            > .drag-handle {
                @apply w-6 flex-shrink-0 cursor-grab inline-flex items-center justify-center;
            }
            > .toggle-container {
                @apply w-4 flex-shrink-0;
                > .toggle-button {
                    cursor: pointer;
                    transition: transform 0.3s ease-in-out;
                    &.is-collapsed {
                        transform: rotate(-90deg);
                    }
                }
            }
            > .node-inner-container {
                @apply inline-flex items-center flex-grow overflow-hidden gap-1;
                > .icon {
                    @apply flex-shrink-0;
                }
                > .text-container {
                    @apply overflow-hidden whitespace-nowrap text-ellipsis;
                }
            }
        }
        > .node-action-container {
            @apply absolute right-1 top-1/2 -translate-y-1/2;
        }
    }
}
</style>
