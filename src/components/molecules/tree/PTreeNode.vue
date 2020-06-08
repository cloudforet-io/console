<template>
    <div class="p-tree-node" :class="classNames">
        <div class="row" :class="nodeClasses"
             :style="{paddingLeft: depth}"
             v-on="getListeners('row')"
        >
            <slot :name="`row-${level}`" v-bind="slotBind">
                <slot name="row" v-bind="slotBind">
                    <div class="node" v-on="getListeners('node')">
                        <slot :name="`node-level-${level}`" v-bind="slotBind">
                            <slot name="node" v-bind="slotBind">
                                <slot :name="`left-extra-level-${level}`" v-bind="slotBind">
                                    <slot name="left-extra" v-bind="slotBind" />
                                </slot>
                                <span v-if="!disableToggle" class="toggle"
                                      :style="{width: toggleSize}"
                                      v-on="getListeners('toggle')"
                                >
                                    <slot v-if="children" :name="`toggle-${level}`" v-bind="slotBind">
                                        <slot name="toggle" v-bind="slotBind">
                                            <p-i :name="expanded ? 'ic_tree_arrow--opened' : 'ic_tree_arrow'"
                                                 :width="toggleSize" :height="toggleSize"
                                            />
                                        </slot>
                                    </slot>
                                </span>
                                <slot :name="`icon-level-${level}`" v-bind="slotBind">
                                    <slot name="icon" v-bind="slotBind" />
                                </slot>
                                <span class="data" v-on="getListeners('data')">
                                    <slot :name="`data-${level}`" v-bind="slotBind">
                                        <slot name="data" v-bind="slotBind">
                                            {{ data }}
                                        </slot>
                                    </slot>
                                </span>
                                <span v-if="$scopedSlots[`right-extra-${level}`] || $scopedSlots[`right-extra`]"
                                      class="right-extra"
                                >
                                    <slot :name="`right-extra-${level}`" v-bind="slotBind">
                                        <slot name="right-extra" v-bind="slotBind" />
                                    </slot>
                                </span>
                            </slot>
                        </slot>
                    </div>
                </slot>
            </slot>
        </div>
        <div v-if="children && expanded" class="children">
            <p-tree-node v-for="(child, idx) in children" :key="idx"
                         v-bind="child"
                         :data.sync="child.data"
                         :expanded.sync="child.expanded"
                         :selected.sync="child.selected"
                         :disabled.sync="child.disabled"
                         :children.sync="child.children"
                         :level="level + 1"
                         v-on="getChildListeners(idx)"
            >
                <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                    <slot :name="slot" v-bind="scope" />
                </template>
            </p-tree-node>
        </div>
    </div>
</template>

<script lang="ts">
import { TreeNodeProps, treeNodeProps } from '@/components/molecules/tree/PTreeNode.toolset';
import {
    computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import { makeProxy } from '@/lib/compostion-util';
import { findIndex, clone, forEach } from 'lodash';
import { ComponentInstance } from '@vue/composition-api/dist/component';

const PTreeNode = import('@/components/molecules/tree/PTreeNode.vue');
export default {
    name: 'PTreeNode',
    components: { PI, PTreeNode },
    props: treeNodeProps,
    setup(props: TreeNodeProps, { emit }) {
        const vm: ComponentInstance = getCurrentInstance() as ComponentInstance;
        const proxyChildren = makeProxy('children', props, emit);
        const depth = computed(() => {
            if (!props.padSize) return `${props.level}rem`;
            const size = props.padSize.match(/\d+/g);
            const unit = props.padSize.match(/[a-zA-Z]+/g);
            return `${props.level * (size ? Number(size[0]) : 1)}${unit ? unit[0] : 'rem'}`;
        });
        return {
            proxyChildren,
            depth,
            slotBind: computed(() => ({ ...props, depth: depth.value })),
            nodeClasses: computed(() => ({
                disabled: props.disabled,
                selected: props.selected,
            })),
            getListeners(type: string) {
                const res = {};
                forEach(vm.$listeners, (l, eventName: string) => {
                    if (eventName.startsWith(type)) {
                        res[`${eventName.substring(type.length + 1)}`] = (e: MouseEvent) => {
                            emit(eventName, reactive({
                                data: makeProxy('data', props, emit),
                                expanded: makeProxy('expanded', props, emit),
                                selected: makeProxy('selected', props, emit),
                                disabled: makeProxy('disabled', props, emit),
                                children: proxyChildren,
                            }), [{
                                node: props,
                                key: vm.$vnode.key || 0,
                            }], e);
                        };
                    }
                });
                return res;
            },
            getChildListeners(idx) {
                const res = {};
                forEach(vm.$listeners, (l, eventName: string) => {
                    if (!eventName.startsWith('update')) {
                        res[eventName] = (child, matched, e) => {
                            emit(eventName, child, [{ node: props, key: vm.$vnode.key || 0 }, ...matched], e);
                        };
                    }
                });
                return res;
            },

        };
    },
};
</script>

<style lang="postcss" scoped>
.basic {
    .row {
        @apply h-8 rounded-sm text-sm;
    }
    .node {
        @apply h-full w-full inline-flex items-center;
    }
    .toggle {
        @apply cursor-pointer;
    }
    .data {
        @apply truncate;
    }
    .right-extra {
        @apply flex-grow;
    }
    .selected {
        @apply bg-blue-200 border border-secondary;
    }
    .disabled {
        @apply text-gray-300;
    }
}
</style>
