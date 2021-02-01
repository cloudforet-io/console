import {
    reactive, toRefs,
} from '@vue/composition-api';
import {
    text, number, boolean, withKnobs,
} from '@storybook/addon-knobs';
import PI from '@/foundation/icons/PI.vue';
import PTreeNode from '@/data-display/tree/tree-node/PTreeNode.vue';
import { TreeNode } from '@/data-display/tree/tree-node/type';
import PTextEditor from '@/inputs/text-editor/PTextEditor.vue';
import { cloneDeep } from 'lodash';


export default {
    title: 'Data Display/Tree',
    component: PTreeNode,
    decorators: [withKnobs],
    parameters: {
        knobs: { escapeHTML: false },
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5443%3A141753',
        },
    },
};

const childrenData: TreeNode[] = [
    {
        data: 'a long text long text long text long text long text long text long text longlonglonglonglonglong longlonglonglonglonglonglong',
        state: { expanded: true, selected: false, loading: false },
        children: false,
    },
    {
        data: 'b',
        state: { expanded: true, selected: false, loading: false },
        children: [
            {
                data: 'hello',
                state: { expanded: false, selected: false, loading: false },
                children: [
                    {
                        data: 'world',
                        state: { expanded: false, selected: false, loading: false },
                        children: false,
                    },
                ],
            },
            {
                data: 'hi',
                state: { expanded: false, selected: false, loading: false },
                children: [
                    {
                        data: 'mart',
                        state: { expanded: false, selected: false, loading: false },
                        children: false,
                    },
                ],
            },
        ],
    },
    {
        data: 'c',
        state: { expanded: true, selected: false, loading: false },
        children: [
            {
                data: 'd',
                state: { expanded: true, selected: false, loading: false },
                children: false,
            },
            {
                data: 'e',
                state: { expanded: false, selected: false, loading: false },
                children: [
                    {
                        data: 'f',
                        state: { expanded: false, selected: false, loading: false },
                        children: false,
                    },
                    {
                        data: 'g',
                        state: { expanded: false, selected: false, loading: false },
                        children: false,
                    },
                    {
                        data: 'h',
                        state: { expanded: false, selected: false, loading: false },
                        children: false,
                    },
                ],
            },
        ],
    },
];


export const treeNode = () => ({
    components: { PTreeNode, PTextEditor },
    props: {
        level: {
            default: number('level', 0),
        },
        padSize: {
            default: text('padSize', '1rem'),
        },
        toggleSize: {
            default: text('toggleSize', '1rem'),
        },
        disableToggle: {
            default: boolean('disableToggle', false),
        },
    },
    template: `
        <div class="tree-node-story" style="width: 80vw; padding: 4rem 0;">
            <p class="text-lg font-bold mb-2">Expand on toggle click</p>
            <div class="flex">
                <div class="w-1/2 h-full p-4 bg-coral-100">
                    <p-tree-node class="border border-gray-400"
                                 v-bind="$props"
                                 :data.sync="node.data"
                                 :children.sync="node.children"
                                 :state.sync="node.state"
                                 @toggle:click="expandNode"
                    >
                    </p-tree-node>
                </div>
                    <p-text-editor class="m-0 ml-2 w-1/2 h-full"
                                   :code="JSON.stringify(node, undefined, 2)"
                                   mode="readOnly"></p-text-editor>
            </div>
        </div>`,
    setup(props) {
        const state = reactive({
            node: {
                data: 'node',
                state: { expanded: false },
                children: true,
            },
        });

        return {
            ...toRefs(state),
            expandNode({ node }, matched, e) {
                e.stopPropagation();
                node.state = {
                    ...node.state,
                    expanded: !node.state.expanded,
                };
            },
        };
    },
});


export const slotCase = ({ treeNodeProps }) => ({
    components: { PTreeNode, PI },
    props: {
        level: {
            default: number('level', 0),
        },
        padSize: {
            default: text('padSize', '1rem'),
        },
        toggleSize: {
            default: text('toggleSize', '1rem'),
        },
        disableToggle: {
            default: boolean('disableToggle', false),
        },
    },
    template: `
        <div class="tree-node-story" style="width: 80vw; padding: 4rem 0;">
            <div>
                <ul class="mb-4">
                    <li>row: <span class="color row"></span></li>
                    <li>node: <span class="color node"></span></li>
                    <li>left-extra: <span class="color left-extra"></span></li>
                    <li>toggle: <span class="color toggle"></span></li>
                    <li>icon: <span class="color icon"></span></li>
                    <li>data: <span class="color data"></span></li>
                    <li>right-extra: <span class="color right-extra"></span></li>
                </ul>
                <p-tree-node data="data" 
                             :classNames="() => ({basic: true, 'slot-case': true})" 
                             :state="{ expanded: false }"
                             children
                >
                    <template #left-extra><span>left</span></template>
                    <template #icon><span>icon</span></template>
                    <template #right-extra><span class="text-right">right</span></template>
                </p-tree-node>
            </div>
            <div class="flex mt-8">
                <div class="w-1/2 p-2">
                    <p-tree-node v-for="(node, idx) in nodes" :key="idx"
                                 v-bind="$props"
                                 :class-names="() => ({basic: true, 'bg-coral-100 my-1 p-1': true})"
                                 :data.sync="node.data" 
                                 :children.sync="node.children" 
                                 :state.sync="node.state" 
                                 @toggle:click="toggleClick"
                    >
                        <template #toggle="{state}">
                            <span class="pl-1">
                                <p-i v-if="!state.expanded" name="btn_ic_tree_hidden—folded"
                                    :width="toggleSize" :height="toggleSize"
                                />
                            </span>
                        </template>
                        <template #right-extra>
                            <div class="text-right"><p-i name="common-gear"></p-i></div>
                        </template>
                        <template #icon="{children, state}">
                            <p-i :name="children ?
                                        (state.expanded ? 'ic_tree_folder--opened' : 'ic_tree_folder')
                                        : 'ic_tree_project'"
                                 width="1rem" height="1rem"
                                 class="mx-2"
                            ></p-i>
                        </template>
                    </p-tree-node>
                </div>
                <div class="bg-yellow-200 p-4 w-1/2">
                    <pre class="whitespace-pre-wrap">{{nodes}}</pre>
                </div>
                </div>
        </div>
        `,
    setup(props, context) {
        const state = reactive({
            nodes: cloneDeep(childrenData),
        });

        return {
            ...toRefs(state),
            toggleClick({ node }, matched, e) {
                e.stopPropagation();
                node.state = {
                    ...node.state,
                    expanded: !node.state.expanded,
                };
            },
        };
    },
});


export const customEventListener = ({ treeNodeProps }) => ({
    components: { PTreeNode },
    props: {
        padSize: {
            default: text('padSize', '1rem'),
        },
        toggleSize: {
            default: text('toggleSize', '1rem'),
        },
        disableToggle: {
            default: boolean('disableToggle', false),
        },
    },
    template: `
    <div class="tree-node-story" style="display: flex; width: 80vw; padding: 4rem 0;">
        <div class="bg-coral-100 w-1/2">
            <p-tree-node v-bind="$props"
                       :data.sync="node.data"
                       :children.sync="node.children"
                       :state.sync="node.state"
                       @hello:click="onHelloClick"
            >
                <template #node-level-2="{getListeners}">
                    <span class="text-primary font-bold cursor-pointer"
                          v-on="getListeners('hello')"
                    >CLICK ME~!</span>
                </template>
            </p-tree-node>
        </div>
        <div class="bg-yellow-200 p-4 w-1/2">
            <pre class="whitespace-pre-wrap">{{clickedItem}}</pre>
        </div>
    </div>
    `,
    setup(props, context) {
        const state = reactive({
            node: {
                data: 'root',
                children: cloneDeep(childrenData),
                state: { expanded: true },
            },
            clickedItem: null,
        });

        return {
            ...toRefs(state),
            onHelloClick({ node }) {
                state.clickedItem = node;
            },
        };
    },
});
