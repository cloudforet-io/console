import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import casual from '@/lib/casual';
import PI from '@/components/atoms/icons/PI.vue';
import { clone } from 'lodash';
import PTreeNode from './PTreeNode.vue';
import { treeNodeProps } from './PTreeNode.toolset';
import md from './PTreeNode.md';
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
    },
    {
        data: 'b',
        expanded: true,
        children: [
            {
                data: 'hello',
                children: [
                    { data: 'world' },
                ],
            },
            {
                data: 'hi',
                children: [
                    { data: 'mart' },
                ],
            },
        ],
    },
    {
        data: 'c',
        children: [
            {
                data: 'd',
            },
            {
                data: 'e',
                children: [
                    {
                        data: 'f',
                    },
                    {
                        data: 'g',
                    },
                    {
                        data: 'h',
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
        expanded: true,
        selected: true,
        disabled: true,
    }),
    template: `
        <div style="display: flex; width: 80vw; padding: 4rem 0;">
            <div class="bg-coral-100 w-1/2">
                <PTreeNode v-bind="$props"
                           :data.sync="state.data"
                           :expanded.sync="state.expanded"
                           :selected.sync="state.selected"
                           :disabled.sync="state.disabled"
                           :children.sync="state.children"
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
        </div>`,
    setup(props, context) {
        const state = reactive({
            data: 'root',
            expanded: true,
            selected: false,
            disabled: false,
            children: childrenData,
        });

        let selectedItem = null;

        return {
            state,
            rowClick: action('row:click'),
            nodeClick(item, matched, e) {
                e.stopPropagation();
                if (selectedItem) selectedItem.selected = false;
                item.selected = !item.selected;
                selectedItem = item;
                action('node:click')(item, matched, e);
            },
            toggleClick(item, matched, e) {
                e.stopPropagation();
                if (!item.expanded) {
                    item.children = [];
                    setTimeout(() => {
                        item.children = [
                            { data: `This is [${item.data}]'s child`, children: [] },
                        ];
                    }, 2000);
                }
                item.expanded = !item.expanded;
                action('toggle:click')(item, matched, e);
            },
            dataClick: action('data:click'),
            nodeMouseenter: action('node:mouseenter'),
        };
    },
});

export const slotCase = () => ({
    components: { PTreeNode, PI },
    props: getKnobProps(treeNodeProps, {
        data: 'root',
    }, {
        children: true,
        data: true,
        expanded: true,
        selected: true,
        disabled: true,
    }, { data: text }),
    template: `
        <div style="width: 80vw; padding: 4rem 0;">
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
                               :expanded.sync="state.expanded"
                               :selected.sync="state.selected"
                               :disabled.sync="state.disabled"
                               :children.sync="state.children"
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
                        <template #icon="{props}">
                            <p-i :name="props.children ? 
                                        (props.expanded ? 'ic_tree_folder--opened' : 'ic_tree_folder') 
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
            expanded: true,
            selected: false,
            disabled: false,
            children: childrenData,
        });

        return {
            state,
            toggleClick(item, matched, e) {
                e.stopPropagation();
                if (!item.expanded) {
                    item.children = [];
                    setTimeout(() => {
                        item.children = [
                            { data: `This is [${item.data}]'s child`, children: [] },
                        ];
                    }, 2000);
                }
                item.expanded = !item.expanded;
                action('toggle:click')(item, matched, e);
            },
        };
    },
});

export const levelSlotCase = () => ({
    components: { PTreeNode },
    props: getKnobProps(treeNodeProps, {
        data: 'root',
    }, {
        children: true,
        data: true,
        expanded: true,
        selected: true,
        disabled: true,
    }, { data: text }),
    template: `
    <div style="display: flex; width: 80vw; padding: 4rem 0;">
        <div class="bg-coral-100 w-1/2">
            <PTreeNode v-bind="$props"
                       :data.sync="state.data"
                       :expanded.sync="state.expanded"
                       :selected.sync="state.selected"
                       :disabled.sync="state.disabled"
                       :children.sync="state.children"
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
            expanded: true,
            selected: false,
            disabled: false,
            children: childrenData,
        });

        return {
            state,
        };
    },
});

export const customEventListener = () => ({
    components: { PTreeNode },
    props: getKnobProps(treeNodeProps, {
        data: 'root',
    }, {
        children: true,
        data: true,
        expanded: true,
        selected: true,
        disabled: true,
    }, { data: text }),
    template: `
    <div style="display: flex; width: 80vw; padding: 4rem 0;">
        <div class="bg-coral-100 w-1/2">
            <PTreeNode v-bind="$props"
                       :data.sync="state.data"
                       :expanded.sync="state.expanded"
                       :selected.sync="state.selected"
                       :disabled.sync="state.disabled"
                       :children.sync="state.children"
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
            expanded: true,
            selected: false,
            disabled: false,
            children: childrenData,
        });

        return {
            state,
            onHelloClick: action('hello:click'),
        };
    },
});
