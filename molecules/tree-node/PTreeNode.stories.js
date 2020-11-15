import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import casual from '@/components/util/casual';
import PI from '@/components/atoms/icons/PI.vue';
import { clone } from 'lodash';
import PTreeNode from '@/components/molecules/tree/PTreeNode.vue';
import { treeNodeProps, TreeNodeToolSet } from '@/components/molecules/tree/PTreeNode.toolset';
import md from '@/components/molecules/tree/PTreeNode.md';
import style from './PTreeNodes.stories.scss';

export default {
    title: 'molecules/tree/TreeNode',
    component: PTreeNode,
    parameters: {
        notes: md,
        info: {
            summary: md,
            components: { PTreeNode },
        },
        knobs: { escapeHTML: false },
    },
};

const childrenData = [
    {
        data: 'a long text long text long text long text long text long text long text longlonglonglonglonglong longlonglonglonglonglonglong',
        state: { expanded: true },
    },
    {
        data: 'b',
        state: { expanded: true },
        children: [
            {
                data: 'hello',
                children: [
                    {
                        data: 'world',
                        state: { expanded: false },
                    },
                ],
            },
            {
                data: 'hi',
                state: { expanded: false },
                children: [
                    {
                        data: 'mart',
                        state: { expanded: false },
                    },
                ],
            },
        ],
    },
    {
        data: 'c',
        state: { expanded: true },
        children: [
            {
                data: 'd',
                state: { expanded: true },
            },
            {
                data: 'e',
                state: { expanded: false },
                children: [
                    {
                        data: 'f',
                        state: { expanded: false },
                    },
                    {
                        data: 'g',
                        state: { expanded: false },
                    },
                    {
                        data: 'h',
                        state: { expanded: false },
                    },
                ],
            },
        ],
    },
];


export const defaultCase = () => ({
    components: { PTreeNode },
    props: getKnobProps(treeNodeProps, {
    }, {
        children: true,
        data: true,
        state: true,
    }),
    template: `
        <div class="tree-node-story" style="width: 80vw; padding: 4rem 0;">
            <div>
                <p>Node Click: selection</p>
                <p>Toggle Click: expand</p>
                <p>Data Click: deletion</p>
            </div>
            <div class="flex">
                <div class="bg-coral-100 w-1/2">
                    <PTreeNode v-bind="$props"
                               :data.sync="state.data"
                               :children.sync="state.children"
                               :state.sync="state.state"
                               @row:click="rowClick"
                               @node:click="nodeClick"
                               @toggle:click="toggleClick"
                               @data:click="dataClick"
                               @node:mouseenter="nodeMouseenter"
                    >
                    </PTreeNode>
                </div>
                <div class="bg-yellow-200 p-4 w-1/2">
                    <pre class="whitespace-pre-wrap">{{state}}</pre>
                </div>
            </div>
        </div>`,
    setup(props, context) {
        const state = reactive({
            data: 'root',
            children: childrenData,
            state: { expanded: true },
        });

        let selectedItem = null;

        return {
            state,
            rowClick: action('row:click'),
            nodeClick({ node }, matched, e) {
                e.stopPropagation();
                if (selectedItem) {
                    selectedItem.state = {
                        ...selectedItem.state,
                        selected: false,
                    };
                }
                node.state = {
                    ...node.state,
                    selected: true,
                };
                selectedItem = node;
                action('node:click')(node, matched, e);
            },
            toggleClick({ node }, matched, e) {
                e.stopPropagation();
                node.state = {
                    ...node.state,
                    expanded: !node.state.expanded,
                };
                action('toggle:click')(node, matched, e);
            },
            dataClick({ node, parent }, matched, e) {
                e.stopPropagation();
                if (Array.isArray(parent.children)) {
                    parent.children.splice(node.key, 1);
                }
                action('data:click')(node, matched, e);
            },
            nodeMouseenter: action('node:mouseenter'),
        };
    },
});


export const apiCase = () => ({
    components: { PTreeNode },
    props: getKnobProps(treeNodeProps, {
    }, {
        children: true,
        data: true,
        state: true,
    }),
    template: `
        <div class="tree-node-story" style="display: flex; width: 80vw; padding: 4rem 0;">
            <div class="bg-coral-100 w-1/2">
                <PTreeNode v-bind="$props"
                           :data.sync="state.data"
                           :children.sync="state.children"
                           :state.sync="state.state"
                           @toggle:click="toggleClick"
                >
                </PTreeNode>
            </div>
            <div class="bg-yellow-200 p-4 w-1/2">
                <pre class="whitespace-pre-wrap">{{state}}</pre>
            </div>
        </div>`,
    setup(props, context) {
        const state = reactive({
            data: 'root',
            children: true,
            state: { expanded: false },
        });

        return {
            state,
            toggleClick(node, matched, e) {
                e.stopPropagation();
                if (!node.sync.state.expanded) {
                    node.sync.children = [];
                    setTimeout(() => {
                        node.sync.children = [
                            { data: `This is [${node.data}]'s child`, children: [] },
                        ];
                    }, 1000);
                }
                node.sync.state = {
                    ...node.sync.state,
                    expanded: !node.sync.state.expanded,
                };
                action('toggle:click')(node, matched, e);
            },
        };
    },
});

export const slotCase = () => ({
    components: { PTreeNode, PI },
    props: getKnobProps(treeNodeProps, {
    }, {
        children: true,
        data: true,
        state: true,
    }, { data: text }),
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
                <PTreeNode data="data"
                           :classNames="() => ['basic', 'slot-case']"
                           :children="[]"
                >
                    <template #left-extra><span>left</span></template>
                    <template #icon><span>icon</span></template>
                    <template #right-extra><span class="text-right">right</span></template>
                </PTreeNode>
            </div>
            <div style="display: flex; margin-top: 2rem;">
                <div class="bg-coral-100 w-1/2">
                    <PTreeNode v-bind="$props"
                               :data.sync="state.data"
                               :children.sync="state.children"
                               :state.sync="state.state"
                               @toggle:click="toggleClick"
                    >
                        <template #toggle>
                            <p-i name="btn_ic_tree_hidden—folded"
                                 :width="toggleSize" :height="toggleSize"
                            />
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
                    </PTreeNode>
                </div>
                <div class="bg-yellow-200 p-4 w-1/2">
                    <pre class="whitespace-pre-wrap">{{state}}</pre>
                </div>
                </div>
        </div>
        `,
    setup(props, context) {
        const state = reactive({
            data: 'root',
            children: childrenData,
            state: { expanded: true },
        });

        return {
            state,
            toggleClick(node, matched, e) {
                e.stopPropagation();
                node.sync.state = {
                    ...node.sync.state,
                    expanded: !node.sync.state.expanded,
                };
                action('toggle:click')(node, matched, e);
            },
        };
    },
});

export const levelSlotCase = () => ({
    components: { PTreeNode },
    props: getKnobProps(treeNodeProps, {
    }, {
        children: true,
        data: true,
        state: true,
    }, { data: text }),
    template: `
    <div class="tree-node-story" style="display: flex; width: 80vw; padding: 4rem 0;">
        <div class="bg-coral-100 w-1/2">
            <PTreeNode v-bind="$props"
                       :data.sync="state.data"
                       :children.sync="state.children"
                       :state.sync="state.state"
            >
                <template #node-level-2>CUSTOM NODE</template>
            </PTreeNode>
        </div>
        <div class="bg-yellow-200 p-4 w-1/2">
            <pre class="whitespace-pre-wrap">{{state}}</pre>
        </div>
    </div>
    `,
    setup(props, context) {
        const state = reactive({
            data: 'root',
            children: childrenData,
            state: { expanded: true },
        });

        return {
            state,
        };
    },
});

export const customEventListener = () => ({
    components: { PTreeNode },
    props: getKnobProps(treeNodeProps, {
    }, {
        children: true,
        data: true,
        state: true,
    }, { data: text }),
    template: `
    <div class="tree-node-story" style="display: flex; width: 80vw; padding: 4rem 0;">
        <div class="bg-coral-100 w-1/2">
            <PTreeNode v-bind="$props"
                       :data.sync="state.data"
                       :children.sync="state.children"
                       :state.sync="state.state"
                       @hello:click="onHelloClick"
            >
                <template #node-level-2="{getListeners}">
                    <span class="text-primary font-bold cursor-pointer"
                          v-on="getListeners('hello')"
                    >CLICK ME~!</span>
                </template>
            </PTreeNode>
        </div>
        <div class="bg-yellow-200 p-4 w-1/2">
            <pre class="whitespace-pre-wrap">{{state}}</pre>
        </div>
    </div>
    `,
    setup(props, context) {
        const state = reactive({
            data: 'root',
            children: childrenData,
            state: { expanded: true },
        });

        return {
            state,
            onHelloClick: action('hello:click'),
        };
    },
});


export const HelperToolSetUsage = () => ({
    components: { PTreeNode },
    template: `
        <div class="tree-node-story" style="width: 80vw; padding: 4rem 0;">
            <div class="flex">
                <div class="bg-coral-100 w-1/2">
                    <PTreeNode v-bind="ts.state"
                               :data.sync="ts.syncState.data"
                               :children.sync="ts.syncState.children"
                               :state.sync="ts.syncState.state"
                               @toggle:click="toggleClick"
                    >
                    </PTreeNode>
                </div>
                <div class="bg-yellow-200 p-4 w-1/2">
                    <pre class="whitespace-pre-wrap">{{ts.syncState}}</pre>
                </div>
            </div>
        </div>`,
    setup(props, context) {
        const ts = new TreeNodeToolSet(undefined, {
            data: 'using state helper',
            children: childrenData,
        });
        return {
            ts,
            toggleClick(node, matched, e) {
                e.stopPropagation();
                ts.setNodeState(node, { expanded: !node.sync.state.expanded });
                action('toggle:click')(node, matched, e);
            },
        };
    },
});
