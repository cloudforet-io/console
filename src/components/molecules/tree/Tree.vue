<template>
    <sl-vue-tree
        ref="slVueTree"
        v-model="computedTreeData"
        class="main-tree-col"
        :allow-multiselect="useMultiSelect"
        :style="{ width: initialTreeWidth }"
        @nodeclick="nodeClick"
        @beforedrop="beforeDrop"
        @toggle="nodeToggle"
        @nodecontextmenu="nodeContextMenu"
    >
        <template #title="{ node }">
            <div v-if="node.data.init" class="empty-node">
                <span>
                    <p-i :color="'transparent primary3'"
                         :width="'14rem'"
                         :height="'14rem'"
                         :name="'ic_no_project-group'"
                    />
                </span>
                <br>
                <span>{{ node.title }}</span>
            </div>

            <slot name="icon" v-bind="node">
                <span v-if="!node.data.init" class="item-icon">
                    <p-i v-if="node.isLeaf"
                         :color="'transparent inherit'"
                         :width="'1rem'"
                         :height="'1rem'"
                         :name="'ic_tree_project'"
                    />
                    <p-i v-else-if="node.isExpanded"
                         :color="'transparent inherit'"
                         :width="'1rem'"
                         :height="'1rem'"
                         :name="'ic_tree_folder--opened'"
                    />
                    <p-i v-else
                         :color="'transparent inherit'"
                         :width="'1rem'"
                         :height="'1rem'"
                         :name="'ic_tree_folder'"
                    />
                </span>
            </slot>
            <span v-if="!node.data.init" class="item-title" @mousedown="setTitle">{{ node.title }}</span>
        </template>
        <template #toggle="{ node }">
            <p-i v-if="node.isExpanded && !node.isLeaf"
                 :color="'transparent inherit'"
                 :width="'1rem'"
                 :height="'1rem'"
                 :name="'ic_tree_arrow--opened'"
            />
            <p-i v-else-if="!node.isExpanded && !node.isLeaf"
                 :color="'transparent inherit'"
                 :width="'1rem'"
                 :height="'1rem'"
                 :name="'ic_tree_arrow'"
            />
        </template>
        <template #draginfo>
            {{ selectedNodesTitle }}
        </template>
    </sl-vue-tree>
</template>

<script>
import SlVueTree from 'sl-vue-tree';
import {
    reactive, toRefs, computed,
} from '@vue/composition-api';
import PI from '@/components/atoms/icons/PI.vue';
import { Util } from '@/lib/global-util';

export default {
    name: 'PTree',
    components: { SlVueTree, PI },
    props: {
        treeData: {
            type: Array,
            default: () => [],
        },
        initialTreeWidth: {
            type: String,
            default: '300px',
        },
        useMultiSelect: {
            type: Boolean,
            default: false,
        },
        useDefaultTreeIcon: {
            type: Boolean,
            default: true,
        },
    },
    setup(props, context) {
        const state = reactive({
            currentTreeData: null,
            clickedNode: null,
            selectedNodesTitle: null,
        });

        const computedTreeData = computed({
            get: () => {
                let returnVal = props.treeData;
                if (Util.methods.isEmpty(returnVal)) {
                    returnVal = [{
                        title: 'Click right button to create a new project Group.',
                        isLeaf: true,
                        init: true,
                    }];
                }
                return returnVal;
            },
            set: (value) => { context.emit('update:treeData', value); },
        });

        const setTitle = (e) => {
            state.selectedNodesTitle = e.target.innerText;
        };

        const beforeDrop = (node, position, cancel) => {
            context.emit('beforeDrop', node, position, cancel);
        };

        const getNodeEl = (node) => {
            const slVueTree = context.refs.slVueTree;
            if (!_.isEmpty(slVueTree)) {
                return slVueTree.$el.querySelector(`[path="${node.pathStr}"]`);
            }
        };

        const addClickedClass = (node) => {
            const elem = getNodeEl(node);
            if (elem) {
                elem.classList.add('sl-vue-node-clicked');
                return true;
            }
            return false;
        };

        const removeClickedClass = (node) => {
            const elem = getNodeEl(node);
            if (elem) {
                elem.classList.remove('sl-vue-node-clicked');
            }
        };

        const nodeClick = (node) => {
            if (state.clickedNode) {
                removeClickedClass(state.clickedNode);
            }
            state.clickedNode = node;
            if (_.get(node, 'data.init') !== true) {
                addClickedClass(node);
                context.emit('nodeClick', node);
            }
        };

        const setClickedNodeItem = (node) => {
            let hasNotClickedItem = false;
            if (state.clickedNode) {
                hasNotClickedItem = node.path.some((path, i) => path !== state.clickedNode.path[i]);
            } else {
                hasNotClickedItem = true;
            }
            if (!hasNotClickedItem) {
                const addClassInterval = setInterval(() => {
                    if (addClickedClass(state.clickedNode)) {
                        clearInterval(addClassInterval);
                    }
                }, 10);
            }
        };


        const nodeToggle = (node) => {
            if (!node.isExpanded) {
                setClickedNodeItem(node);
                if (!node.data.is_cached) {
                    context.emit('nodeToggle', node);
                }
            }
        };

        const nodeContextMenu = (node, event, hasClicked) => {
            context.emit('nodeContextMenu', node, event, hasClicked);
        };

        return {
            ...toRefs(state),
            computedTreeData,
            setTitle,
            beforeDrop,
            getNodeEl,
            addClickedClass,
            removeClickedClass,
            nodeClick,
            setClickedNodeItem,
            nodeToggle,
            nodeContextMenu,
        };
    },
};
</script>

<style lang="scss" scoped>

    $main-height: calc(100vh - #{$header-height} - 30px);

    .main-tree-col {
        @extend %sheet;
        border-radius: 0;
        padding: 15px 8px;
        background-color: $primary4;
        height: $main-height;
        overflow: scroll;

        .leaf-space {
            display: inline-block;
            width: 20px;
        }

        .item-icon {
            display: inline-block;
            text-align: center;
            width: 20px;
        }

        .ellipsis {
            padding: 0px 3px 0px 10px;
            cursor: pointer;
        }
    }
    .empty-node {
        text-align: center;
        font: 18px/21px Arial;
        letter-spacing: 0;
        color: #A5ACCE;
        opacity: 1;
    }
</style>
