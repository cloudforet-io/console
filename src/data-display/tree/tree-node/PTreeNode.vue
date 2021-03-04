<template>
    <div :class="{
        'p-tree-node': level !== 0,
        dragging: draggingChild && draggingChild._id === proxyNode._id
    }"
    >
        <div v-if="level" class="tree-row"
             :class="classNames"
             :style="{paddingLeft: depth}"
        >
            <slot :name="`row-${level}`" v-bind="slotBind">
                <slot name="row" v-bind="slotBind">
                    <div class="node" @click.stop="onClickNode">
                        <slot :name="`node-level-${level}`" v-bind="slotBind">
                            <slot name="node" v-bind="slotBind">
                                <span v-if="$scopedSlots[`left-extra-${level}`] || $scopedSlots[`left-extra`]"
                                      class="left-extra"
                                >
                                    <slot :name="`left-extra-level-${level}`" v-bind="slotBind">
                                        <slot name="left-extra" v-bind="slotBind" />
                                    </slot>
                                </span>
                                <span v-if="!disableToggle || $scopedSlots[`toggle-${level}`] || $scopedSlots[`toggle`]"
                                      class="toggle"
                                      @click.stop="onToggle"
                                >
                                    <slot name="toggle" v-bind="slotBind">
                                        <slot :name="`toggle-${level}`" v-bind="slotBind">
                                            <slot name="toggle" v-bind="slotBind">
                                                <p-i v-if="children"
                                                     :name="expanded ? 'ic_tree_arrow--opened' : 'ic_tree_arrow'"
                                                     width="1em" height="1em"
                                                     color="inherit transparent"
                                                />
                                            </slot>
                                        </slot>
                                    </slot>
                                </span>
                                <p-text-input v-if="!editOptions.disabled && isEditing"
                                              v-model="editText" v-focus="true"
                                              :invalid="invalid"
                                              @blur="node.finishEdit()"
                                              @keydown.enter="node.finishEdit()"
                                />
                                <template v-else>
                                    <span v-if="$scopedSlots[`toggle-right-${level}`] || $scopedSlots[`toggle-right`]"
                                          class="toggle-right"
                                    >
                                        <slot :name="`toggle-right-level-${level}`" v-bind="slotBind">
                                            <slot name="toggle-right" v-bind="slotBind" />
                                        </slot>
                                    </span>
                                    <span v-if="$scopedSlots[`icon-${level}`] || $scopedSlots[`icon`]"
                                          class="icon"
                                    >
                                        <slot :name="`icon-level-${level}`" v-bind="slotBind">
                                            <slot name="icon" v-bind="slotBind" />
                                        </slot>
                                    </span>
                                    <span class="data">
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
                                </template>
                            </slot>
                        </slot>
                    </div>
                </slot>
            </slot>
        </div>
        <vue-draggable v-if="Array.isArray(proxyNode.children)"
                       v-model="proxyNode.children"
                       :group="{name: 'g1'}"
                       draggable=".draggable"
                       :disabled="dragOptions.disabled"
                       ghost-class="ghost"
                       :sort="false"
                       :move="checkMove"
                       @start="onDragStart"
                       @add="onDragAdd"
                       @end="onDragEnd"
                       @update="onDragUpdate"
        >
            <transition-group>
                <p-tree-node v-for="(child, idx) in proxyNode.children"
                             ref="childrenRef"
                             :key="child._id"
                             :level="level + 1"
                             :index="idx"
                             :pad-size="padSize"
                             :disable-toggle="disableToggle"
                             :select-options="selectOptions"
                             :edit-options="editOptions"
                             :drag-options="dragOptions"
                             :get-default-node="getDefaultNode"
                             :get-class-names="getClassNames"
                             :parent="node"
                             :data.sync="child.data"
                             :children.sync="child.children"
                             :expanded.sync="child.expanded"
                             :loading.sync="child.loading"
                             :selected.sync="child.selected"
                             class="draggable"
                             v-on="childListeners"
                >
                    <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                        <slot :name="slot" v-bind="scope" />
                    </template>
                </p-tree-node>
            </transition-group>
        </vue-draggable>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
    computed, defineComponent, getCurrentInstance, reactive, toRefs, UnwrapRef,
} from '@vue/composition-api';
import PI from '@/foundation/icons/PI.vue';
import { makeProxy } from '@/util/composition-helpers';
import {
    forEach,
} from 'lodash';
import {
    TreeItem, TreeNodeProps, TreeNode,
} from '@/data-display/tree/tree-node/type';
import PTextInput from '@/inputs/input/PTextInput.vue';
import PFieldGroup from '@/inputs/forms/field-group/PFieldGroup.vue';
import { focus } from 'vue-focus';
import VueDraggable from 'vuedraggable';

const PTreeNode = import('@/data-display/tree/tree-node/PTreeNode.vue');

export default defineComponent({
    name: 'PTreeNode',
    components: {
        PFieldGroup,
        PTextInput: (PTextInput as any),
        PI,
        PTreeNode: (PTreeNode as any),
        VueDraggable,
    },
    directives: { focus },
    props: {
        level: {
            type: Number,
            default: 0,
        },
        index: {
            type: Number,
            default: 0,
        },
        padSize: {
            type: String,
            default: '1rem',
        },
        disableToggle: {
            type: Boolean,
            default: false,
        },
        selectOptions: {
            type: Object,
            default: () => ({}),
        },
        editOptions: {
            type: Object,
            default: () => ({}),
        },
        dragOptions: {
            type: Object,
            default: () => ({}),
        },
        getClassNames: {
            type: Function,
            default: () => ({}),
        },
        getDefaultNode: {
            type: Function,
            default: () => ({}),
        },
        parent: {
            type: Object,
            default: null,
        },
        /**
         * sync
         */
        data: {
            type: [Array, Object, String, Number, Boolean],
            default: '',
            required: true,
        },
        children: {
            type: [Array, Boolean],
            default: false,
        },
        expanded: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        selected: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: Required<TreeNodeProps>, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const proxyNode: UnwrapRef<Required<TreeNode>> = reactive({
            _id: vm.$vnode.key as string,
            data: makeProxy('data', props, emit),
            children: makeProxy<TreeNode[]|boolean>('children', props, emit),
            expanded: makeProxy('expanded', props, emit),
            loading: makeProxy('loading', props, emit),
            selected: makeProxy('selected', props, emit),
        });

        const getChildrenNodes = (): Promise<TreeItem[]> => new Promise(((resolve) => {
            vm.$nextTick(() => {
                // eslint-disable-next-line no-use-before-define
                if (Array.isArray(state.childrenRef)) resolve(state.childrenRef.map(d => d.node));
                else resolve([]);
            });
        }));


        const state = reactive({
            nodeRef: undefined,
            childrenRef: undefined,
            depth: computed(() => {
                if (!props.padSize) return `${props.level}rem`;
                const size = props.padSize.match(/\d+/g);
                const unit = props.padSize.match(/[a-zA-Z]+/g);
                return `${(props.level || 0) * (size ? Number(size[0]) : 1)}${unit ? unit[0] : 'rem'}`;
            }),
            classNames: computed(() => {
                let res = {
                    selected: props.selected,
                    [`level-${props.level}`]: true,
                };
                const custom = props.getClassNames(state.node);
                if (!custom) return res;

                if (Array.isArray(custom)) custom.forEach((d) => { res[d] = true; });
                else if (typeof custom === 'string') res[custom] = true;
                else res = { ...res, ...custom };
                return res;
            }),
            isEditing: false,
            editText: '',
            invalid: computed(() => {
                if (props.editOptions.validator) return !props.editOptions.validator(state.editText);
                return undefined;
            }),
            draggingChild: null as null|TreeNode,
            node: computed<TreeItem>(() => ({
                index: props.index,
                level: props.level || 0,
                parent: props.parent,
                el: state.nodeRef,
                getChildrenNodes() {
                    if (Array.isArray(state.childrenRef)) return state.childrenRef.map(d => d.node);
                    return [];
                },
                deleteNode() {
                    emit('delete', state.node);
                },
                async addChild<T>(data): Promise<TreeItem<T>> {
                    const newNode = props.getDefaultNode(data);
                    if (Array.isArray(proxyNode.children)) proxyNode.children.push(newNode);
                    else {
                        proxyNode.children = [newNode];
                        proxyNode.expanded = true;
                    }

                    const res = await getChildrenNodes();
                    return res.find(d => d._id === newNode._id) as TreeItem;
                },
                startEdit() {
                    if (props.editOptions.disabled) return;
                    if (props.editOptions.dataGetter) state.editText = props.editOptions.dataGetter(proxyNode.data);
                    else state.editText = proxyNode.data;
                    state.isEditing = true;
                },
                finishEdit() {
                    if (!state.isEditing) return;

                    state.isEditing = false;
                    if (state.invalid) return;

                    const dataSetter = props.editOptions.dataSetter;
                    const originData = proxyNode.data;
                    let newData;
                    if (dataSetter) {
                        newData = dataSetter(state.editText, originData);
                    } else {
                        newData = state.editText;
                    }
                    proxyNode.data = newData;

                    emit('finish-edit', state.node);
                },
                setData(data) {
                    proxyNode.data = data;
                },
                async setChildren<T>(children): Promise<TreeItem<T>[]> {
                    if (Array.isArray(children)) {
                        proxyNode.children = children.map(d => props.getDefaultNode(d));
                    } else proxyNode.children = children;

                    const res = await getChildrenNodes();
                    return res;
                },
                async addChildren<T>(children: any[]): Promise<TreeItem<T>[]> {
                    const ids = {};
                    if (Array.isArray(proxyNode.children)) {
                        proxyNode.children.push(...children.map((d) => {
                            const res = props.getDefaultNode(d);
                            ids[res._id] = true;
                            return res;
                        }));
                    } else {
                        proxyNode.children = children.map((d) => {
                            const res = props.getDefaultNode(d);
                            ids[res._id] = true;
                            return res;
                        });
                    }

                    const res = await getChildrenNodes();
                    return res.filter(d => ids[d._id]);
                },
                findChildNode<T>(id: string|number): TreeItem<T>|null {
                    if (!Array.isArray(state.childrenRef)) return null;
                    const item = state.childrenRef.find(d => d.node._id === id);
                    if (item) return item.node;
                    return null;
                },
                setExpanded(expanded) {
                    proxyNode.expanded = expanded;
                },
                setLoading(loading) {
                    proxyNode.loading = loading;
                },
                setSelected(selected, force = false) {
                    if (force) {
                        proxyNode.selected = selected;
                    } else {
                        const validator = props.selectOptions.validator;
                        if (validator && !validator(state.node)) return;

                        emit('check-select', state.node, selected);
                    }
                },
                /* Tree Node */
                _id: proxyNode._id,
                data: proxyNode.data,
                children: proxyNode.children,
                expanded: proxyNode.expanded,
                loading: proxyNode.loading,
                selected: proxyNode.selected,
            })),
        });


        const getListeners = (type: string) => {
            const res = {};
            forEach(vm.$listeners, (l, eventName: string) => {
                if (eventName.startsWith(type)) {
                    res[`${eventName.substring(type.length + 1)}`] = (e: MouseEvent) => {
                        emit(eventName, state.node, e);
                    };
                }
            });
            return res;
        };

        const slotBind = computed(() => ({
            depth: state.depth,
            node: state.node,
            getListeners,
        }));


        const onDragStart = (e) => {
            state.draggingChild = proxyNode.children[e.oldIndex];
            emit('start-drag', state.draggingChild);
        };

        const onDragAdd = (e) => {
            const node = proxyNode.children[e.newIndex];
            if (node) {
                const item = state.node.findChildNode(node._id);
                if (item) emit('add-drag', item);
            }
        };

        const onDragEnd = () => {
            state.draggingChild = null;
            emit('end-drag');
        };

        const onDragUpdate = (e) => {
            const node = proxyNode.children[e.newIndex];
            if (node) {
                const item = state.node.findChildNode(node._id);
                if (item) emit('update-drag', item);
            }
        };

        const checkMove = (e, t) => {
            const dragValidator = props.dragOptions.dragValidator;
            if (dragValidator && !dragValidator(e.draggedContext.element)) return false;

            const dropValidator = props.dragOptions.dropValidator;
            if (dropValidator && !dropValidator(e.relatedContext.element)) return false;

            return true;
        };

        const onToggle = () => {
            if (proxyNode.expanded) {
                emit('fold', state.node);
            } else {
                emit('toggle', state.node);
            }
        };

        const onClickNode = () => {
            emit('click-node', state.node);
        };


        const childListeners = {
            delete: (...args) => { emit('delete', ...args); },
            'check-select': (...args) => { emit('check-select', ...args); },
            'click-node': (...args) => { emit('click-node', ...args); },
            toggle: (...args) => { emit('toggle', ...args); },
            fold: (...args) => { emit('fold', ...args); },
            select: (...args) => { emit('select', ...args); },
            unselect: (...args) => { emit('unselect', ...args); },
            'start-drag': (...args) => { emit('start-drag', ...args); },
            'end-drag': (...args) => { emit('end-drag', ...args); },
            'add-drag': (...args) => { emit('add-drag', ...args); },
            'update-drag': (...args) => { emit('update-drag', ...args); },
            'finish-edit': (...args) => { emit('finish-edit', ...args); },
        };


        emit('init', state.node);

        return {
            proxyNode,
            ...toRefs(state),
            slotBind,
            onDragStart,
            onDragAdd,
            onDragEnd,
            onDragUpdate,
            checkMove,
            onToggle,
            onClickNode,
            childListeners,
        };
    },
});
</script>

<style lang="postcss">
.p-tree-node {
    > .tree-row {
        @apply h-8 rounded-sm text-sm text-black cursor-pointer;
        .node {
            @apply h-full w-full inline-flex items-center;
        }
        .toggle {
            @apply cursor-pointer;
            color: inherit;
            width: 1rem;
            font-size: 1rem;
        }
        .icon {
            @apply flex-shrink-0 flex-grow-0;
        }
        .data {
            @apply leading-normal truncate;
        }
        .p-text-input {
            @apply ml-1 w-full;
        }
        .right-extra {
            @apply flex-grow;
        }
        &:hover {
            @apply text-secondary bg-secondary2;
        }
        &.selected {
            @apply bg-blue-200;
        }
    }
    &.dragging {
        > .tree-row {
            @apply text-secondary bg-secondary2;
        }
    }
    &.ghost {
        > .tree-row {
            @apply text-secondary bg-secondary2;
            opacity: 0.5;
        }
    }
}
</style>
