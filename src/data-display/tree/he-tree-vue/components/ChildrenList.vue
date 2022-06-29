<template>
    <div class="tree-children" :class="{'tree-root': rootNode === parent}">
        <div v-for="(node, index) in nodes" :key="index"
             class="tree-branch"
             :class="{'he-tree--hidden': node.$hidden}"
             :data-tree-node-path="getTreeNodePath(index).join(',')"
        >
            <div class="tree-node-back" :style="node.$nodeBackStyle ? getNodeBackStyle(node) : indentStyle">
                <div class="tree-node">
                    <slot v-bind="{node, index, path: getTreeNodePath(index)}">
                        {{ node.text ? node.text : node.data }}
                    </slot>
                </div>
            </div>
            <transition v-if="(node.children && node.children.length) > 0">
                <children-list v-if="!node.$folded"
                               :nodes="node.children"
                               :indent="indent"
                               :parent="node"
                               :parent-path="getTreeNodePath(index)"
                               :root-node="rootNode"
                               :rtl="rtl"
                >
                    <template #default="scope">
                        <slot v-bind="scope" />
                    </template>
                </children-list>
            </transition>
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent, reactive, toRefs,
} from '@vue/composition-api';

interface ChildrenListProps {
  rtl: boolean;
  parentPath: number[];
  indent: number;
  nodes: any[];
  parent: any;
  rootNode: any;
}
export default defineComponent<ChildrenListProps>({
    name: 'ChildrenList',
    props: {
        rtl: {
            type: Boolean,
            default: false,
        },
        parentPath: {
            type: Array,
            default: () => [],
        },
        indent: {
            type: Number,
            default: 16,
        },
        nodes: {
            type: Array,
            default: () => [],
        },
        parent: {
            type: Object,
            default: () => ({}),
        },
        rootNode: {
            type: Object,
            default: () => ({}),
        },
    },
    setup(props) {
        const state = reactive({
            indentStyle: computed(() => ({
                [!props.rtl ? 'paddingLeft' : 'paddingRight']: `${props.parentPath.length * props.indent}px`,
            })),
        });
        const getTreeNodePath = (index: number) => [...props.parentPath, index];
        const getNodeBackStyle = node => ({ ...state.indentStyle, ...node.$nodeBackStyle });
        return {
            ...toRefs(state),
            getTreeNodePath,
            getNodeBackStyle,
        };
    },
});
</script>
