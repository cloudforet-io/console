<template>
    <div :class="level ? 'p-tree-node' : 'tree-root'">
        <div v-if="level" class="tree-row"
             :class="{selected, disabled, [`level-${level}`]: true}"
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
                                <template v-if="!editOptions.disabled && isEditMode">
                                    <p-field-group :invalid="invalid"
                                                   :valid="!invalid"
                                                   :invalid-text="editOptions.invalidText"
                                                   :valid-text="editOptions.validText"
                                    >
                                        <p-text-input v-model="editText" v-focus="true"
                                                      :invalid="invalid"
                                                      @blur="node.finishEdit()"
                                                      @keydown.enter="node.finishEdit()"
                                        />
                                    </p-field-group>
                                </template>
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
                       @choose="onDragChoose"
                       @start="onDragStart"
                       @end="onDragEnd"
        >
            <transition-group type="transition">
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
                             :parent="node"
                             :data.sync="child.data"
                             :children.sync="child.children"
                             :expanded.sync="child.expanded"
                             :loading.sync="child.loading"
                             :selected.sync="child.selected"
                             :disabled.sync="child.disabled"
                             :class="{
                                 draggable: !dragOptions.disabled && !child.disabled,
                             }"
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
    computed, getCurrentInstance, reactive, toRefs, UnwrapRef,
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

export default {
    name: 'PTreeNode',
    components: {
        PFieldGroup, PTextInput, PI, PTreeNode, VueDraggable,
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
        /**
         * sync
         */
        children: {
            type: [Array, Boolean],
            default: false,
        },
        /**
         * sync
         */
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
        disabled: {
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
            disabled: makeProxy('disabled', props, emit),
        });

        const getChildrenNodes = (): Promise<TreeItem[]> => new Promise(((resolve) => {
            vm.$nextTick(() => {
                // eslint-disable-next-line no-use-before-define
                if (Array.isArray(state.childrenRef)) resolve(state.childrenRef.map(d => d.node));
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
            isEditMode: false,
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
                deleteNode() {
                    emit('delete', state.node);
                },
                async addChild(data): Promise<TreeItem> {
                    const newNode = props.getDefaultNode(data);
                    if (Array.isArray(proxyNode.children)) proxyNode.children.push(newNode);
                    else {
                        proxyNode.children = [newNode];
                        proxyNode.expanded = true;
                    }

                    const res = await getChildrenNodes();
                    return res.find(d => d._id === newNode._id) as TreeItem;
                },
                startEdit(value) {
                    if (props.editOptions.disabled) return;
                    if (value) state.editText = value;
                    else state.editText = proxyNode.data;
                    state.isEditMode = true;
                },
                finishEdit(afterFinishEdit) {
                    state.isEditMode = false;
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
                    if (afterFinishEdit) afterFinishEdit(state.node);
                },
                setData(data) {
                    proxyNode.data = data;
                },
                async setChildren(children): Promise<TreeItem[]> {
                    if (Array.isArray(children)) {
                        proxyNode.children = children.map(d => props.getDefaultNode(d));
                    } else proxyNode.children = children;

                    const res = await getChildrenNodes();
                    return res;
                },
                async addChildren(children: any[]): Promise<TreeItem[]> {
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
                findChildNode(id: string|number): TreeItem|null {
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
                    if (proxyNode.disabled) return;
                    if (force) {
                        proxyNode.selected = selected;
                    } else {
                        const validator = props.selectOptions.validator;
                        if (validator && !validator(state.node)) return;

                        emit('check-select', state.node, selected);
                    }
                },
                setDisabled(disabled) {
                    proxyNode.disabled = disabled;
                },
                /* Tree Node */
                _id: proxyNode._id,
                data: proxyNode.data,
                children: proxyNode.children,
                expanded: proxyNode.expanded,
                loading: proxyNode.loading,
                selected: proxyNode.selected,
                disabled: proxyNode.disabled,
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

        const onDragChoose = async (e) => {
            if (props.dragOptions.dragValidator) {
                let res: any = props.dragOptions.dragValidator(state.node);
                if (res instanceof Promise) res = await res;
                if (!res) return;
            }
            console.log('onDragChoose', e);
        };

        const onDragStart = (e) => {
            console.log('drag start', e);
            state.draggingChild = proxyNode.children[e.oldIndex];
            emit('start-drag', proxyNode.children[e.oldIndex]);
        };

        const onDragEnd = (e) => {
            console.log('drag end', e);
            state.draggingChild = null;
            emit('end-drag');
        };

        const checkMove = (e) => {
            console.log('checkMove', e.draggedContext.element);
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
        };


        emit('init', state.node);

        return {
            proxyNode,
            ...toRefs(state),
            slotBind,
            onDragChoose,
            onDragStart,
            onDragEnd,
            checkMove,
            onToggle,
            onClickNode,
            childListeners,
        };
    },
};
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
        .right-extra {
            @apply flex-grow;
        }
        &:hover:not(.disabled) {
            @apply text-secondary bg-secondary2;
        }
        &.selected:not(.disabled) {
            @apply bg-blue-200 border border-secondary;
        }
        &.disabled {
            @apply text-gray-400;
            cursor: not-allowed;
        }
    }
    &[draggable=true] {
        > .tree-row {
            @apply text-secondary bg-secondary2;
        }
    }
    &.ghost {
        > .tree-row:not(.disabled) {
            @apply text-secondary bg-secondary2;
            opacity: 0.5;
        }
    }
}
</style>
