<template>
    <div class="p-tree-node" :class="classNames">
        <div class="node" :class="nodeClasses" v-on="getListeners(false)">
            <slot :name="`row-${level}`" v-bind="slotBind">
                <slot name="row" v-bind="slotBind">
                    <span :style="{paddingLeft: depth}" class="bg-primary" />
                    <slot :name="`node-level-${level}`" v-bind="slotBind">
                        <slot name="node" v-bind="slotBind">
                            <span>
                                <slot :name="`left-extra-level-${level}`" v-bind="slotBind">
                                    <slot name="left-extra" v-bind="slotBind">
                                        @
                                    </slot>
                                </slot>
                                <slot v-if="!disableToggle && children" :name="`toggle-${level}`" v-bind="slotBind">
                                    <slot name="toggle" v-bind="slotBind">
                                        <p-i :name="expanded ? 'ic_tree_arrow--opened' : 'ic_tree_arrow'"
                                             width="1rem" height="1rem"
                                             class="toggle"
                                        />
                                    </slot>
                                </slot>
                            </span>
                            <slot :name="`data-${level}`" v-bind="slotBind">
                                <slot name="data" v-bind="slotBind">
                                    {{ data }}
                                </slot>
                            </slot>
                            <slot :name="`right-extra-${level}-${$vnode.key || 0}`" v-bind="slotBind">
                                <slot name="right-extra" v-bind="slotBind" />
                            </slot>
                        </slot>
                    </slot>
                </slot>
            </slot>
        </div>
        <div v-if="children" class="children">
            <p-tree-node v-for="(child, idx) in children" :key="idx"
                         v-bind="child"
                         :children.sync="child.children"
                         :matched="getMatched(child, idx)"
                         :level="level + 1"
                         v-on="getListeners(true)"
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

            getMatched(item, idx) {
                const res = props.matched ? [...props.matched] : [{
                    ...props,
                    key: 0,
                }];
                res.push({
                    ...props,
                    level: props.level + 1,
                    key: idx,
                });
                return res;
            },
            getListeners(isChild: boolean) {
                let res = {};
                if (isChild) {
                    res = { ...vm.$listeners };
                } else {
                    forEach(vm.$listeners, (l, event) => {
                        if (event !== 'update:children') {
                            res[`${event.substring(5)}`] = () => { emit(event, props); };
                        }
                    });
                }
                delete res['update:children'];
                return res;
            },
        };
    },
};
</script>

<style lang="postcss" scoped>
.basic {
    @apply rounded-sm text-sm leading-normal;
    .node {
        @apply h-8;
    }
    .selected {
        @apply bg-blue-200 border border-secondary;
    }
    .disabled {
        @apply text-gray-300;
    }
}
</style>
