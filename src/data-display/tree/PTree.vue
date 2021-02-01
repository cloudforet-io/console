<template>
    <div class="p-tree">
        <p-tree-node v-for="(node, idx) in nodes" :key="idx"
                     :pad-size="padSize"
                     :toggle-size="toggleSize"
                     :disable-toggle="disableToggle"
                     :data.sync="node.data"
                     :children.sync="node.children"
                     :state.sync="node.state"
                     v-on="$listeners"
        >
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope" />
            </template>
        </p-tree-node>
    </div>
</template>

<script lang="ts">
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';
import PTreeNode from '@/data-display/tree/tree-node/PTreeNode.vue';
import {
    TreeItem, TreeNode,
} from '@/data-display/tree/tree-node/type';

export default {
    name: 'PTree',
    components: { PTreeNode },
    props: {
        padSize: {
            type: String,
            default: undefined,
        },
        toggleSize: {
            type: String,
            default: undefined,
        },
        disableToggle: {
            type: Boolean,
            default: undefined,
        },
        classNames: {
            type: Function,
            default: undefined,
        },
    },
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            nodes: [] as TreeNode[],
            selectedNodes: [] as TreeItem[],
            firstSelectedNode: computed(() => state.selectedNodes[0]),
        });


        const applyState = ({ node }: TreeItem) => {
            node.state = {
                ...node.state,
            };
        };

        const setNodeState = ({ node }: TreeItem, _state: {[name: string]: boolean}) => {
            node.state = {
                ...node.state,
                ..._state,
            };
        };

        const deleteNode = ({ parent, node, key }: TreeItem) => {
            if (parent && Array.isArray(parent.node.children)) {
                parent.node.children.splice(key, 1);
                if (parent.node.children.length === 0) parent.node.children = false;
            } else {
                state.nodes.splice(key, 1);
            }
        };

        const setSelectedNodes = (item: TreeItem): void => {
            if (state.firstSelectedNode) {
                setNodeState(state.firstSelectedNode, { selected: false });
                if (state.firstSelectedNode.key === item.key && state.firstSelectedNode.level === item.level) {
                    state.selectedNodes = [];
                    return;
                }
            }
            setNodeState(item, { selected: true });
            state.selectedNodes = [item];
        };


        return {
            ...toRefs(state),
            applyState,
            setNodeState,
            deleteNode,
            setSelectedNodes,
        };
    },
};
</script>
