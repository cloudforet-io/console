<template>
    <div class="p-tree-node">
        <div :class="classNames(node)" :style="{paddingLeft: depth}"
             v-on="getListeners('row')"
        >
            <slot :name="`row-${level}`" v-bind="slotBind">
                <slot name="row" v-bind="slotBind">
                    <div class="node" v-on="getListeners('node')">
                        <slot :name="`node-level-${level}`" v-bind="slotBind">
                            <slot name="node" v-bind="slotBind">
                                <span v-if="$scopedSlots[`left-extra-${level}`] || $scopedSlots[`left-extra`]"
                                      class="left-extra" v-on="getListeners('left-extra')"
                                >
                                    <slot :name="`left-extra-level-${level}`" v-bind="slotBind">
                                        <slot name="left-extra" v-bind="slotBind" />
                                    </slot>
                                </span>
                                <span v-if="!disableToggle" class="toggle"
                                      :style="{width: toggleSize}"
                                      v-on="getListeners('toggle')"
                                >
                                    <slot v-if="children" :name="`toggle-${level}`" v-bind="slotBind">
                                        <slot name="toggle" v-bind="slotBind">
                                            <p-i :name="state.expanded ? 'ic_tree_arrow--opened' : 'ic_tree_arrow'"
                                                 :width="toggleSize" :height="toggleSize"
                                                 color="inherit transparent"
                                            />
                                        </slot>
                                    </slot>
                                </span>
                                <span v-if="$scopedSlots[`icon-${level}`] || $scopedSlots[`icon`]"
                                      class="icon" v-on="getListeners('icon')"
                                >
                                    <slot :name="`icon-level-${level}`" v-bind="slotBind">
                                        <slot name="icon" v-bind="slotBind" />
                                    </slot>
                                </span>
                                <span class="data" v-on="getListeners('data')">
                                    <slot :name="`data-${level}`" v-bind="slotBind">
                                        <slot name="data" v-bind="slotBind">
                                            {{ data }}
                                        </slot>
                                    </slot>
                                </span>
                                <span v-if="$scopedSlots[`right-extra-${level}`] || $scopedSlots[`right-extra`]"
                                      class="right-extra" v-on="getListeners('right-extra')"
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
        <div v-if="children && state.expanded" class="children">
            <p-tree-node v-for="(child, idx) in children"
                         :key="idx"
                         :level="level + 1"
                         :pad-size="child.padSize || padSize"
                         :toggle-size="child.toggleSize || toggleSize"
                         :disable-toggle="child.disableToggle || disableToggle"
                         :class-names="child.classNames || classNames"
                         :data.sync="child.data"
                         :children.sync="child.children"
                         :state.sync="child.state"
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
    computed, getCurrentInstance, reactive, toRefs, watch,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import { makeProxy } from '@/lib/compostion-util';
import {
    findIndex, clone, forEach, map, isEmpty,
} from 'lodash';
import { ComponentInstance } from '@vue/composition-api/dist/component';

const PTreeNode = import('@/components/molecules/tree/PTreeNode.vue');
export default {
    name: 'PTreeNode',
    components: { PI, PTreeNode },
    props: treeNodeProps,
    setup(props: TreeNodeProps, { emit }) {
        const vm: ComponentInstance = getCurrentInstance() as ComponentInstance;
        const depth = computed(() => {
            if (!props.padSize) return `${props.level}rem`;
            const size = props.padSize.match(/\d+/g);
            const unit = props.padSize.match(/[a-zA-Z]+/g);
            return `${props.level * (size ? Number(size[0]) : 1)}${unit ? unit[0] : 'rem'}`;
        });

        const node: any = computed(() => ({
            key: vm.$vnode.key || 0,
            ...props,
            sync: reactive({
                data: makeProxy('data', props, emit),
                children: makeProxy('children', props, emit),
                state: computed({
                    set(val) { emit('update:state', val); },
                    get() {
                        const res = {};
                        forEach(props.state, (v, k) => {
                            res[k] = computed({
                                set(val) {
                                    emit('update:state', { ...props.state, [k]: val });
                                },
                                get() { return props.state[k]; },
                            });
                        });
                        return reactive(res);
                    },
                }),
            }),
        }));

        // const childrenHaveState = computed(() => {
        //     if (Array.isArray(props.children)) {
        //         return props.children.every(child => child.state);
        //     }
        //     return false;
        // });

        // const setChildrenState = () => {
        //     if (!childrenHaveState.value && Array.isArray(props.children)) {
        //         node.value.sync.children = props.children.map(child => ({
        //             ...child,
        //             state: child.state
        //                 ? { ...props.defaultState, ...child.state }
        //                 : { ...props.state, ...props.defaultState },
        //         }));
        //     }
        // };
        //
        // setChildrenState();
        //
        // watch(() => props.children, (before, after) => {
        //     if (before !== after) setChildrenState();
        // });


        const getListeners = (type: string) => {
            const res = {};
            forEach(vm.$listeners, (l, eventName: string) => {
                if (eventName.startsWith(type)) {
                    res[`${eventName.substring(type.length + 1)}`] = (e: MouseEvent) => {
                        emit(eventName, node.value, [node.value], e);
                    };
                }
            });
            return res;
        };

        return {
            depth,
            slotBind: computed(() => ({
                depth: depth.value, getListeners, node,
            })),
            node,
            // childrenHaveState,
            getListeners,
            getChildListeners(idx) {
                const res = {};
                forEach(vm.$listeners, (l, eventName: string) => {
                    if (!eventName.startsWith('update')) {
                        res[eventName] = (_node, matched, e) => {
                            emit(eventName, _node, [node.value, ...matched], e);
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
    @apply h-10 rounded-sm text-sm text-black cursor-pointer;
    .node {
        @apply h-full w-full inline-flex items-center;
    }
    .toggle {
        @apply cursor-pointer;
        color: inherit;
    }
    .icon {
        @apply flex-shrink-0 flex-grow-0;
    }
    .data {
        @apply leading-normal truncate;
    }
    .right-extra {
        @apply flex-grow;
    }
    &:hover {
        @apply text-secondary bg-secondary2;
    }
    &.selected {
        @apply bg-blue-200 border border-secondary;
    }
}
</style>
