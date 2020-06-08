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

export default {
    title: 'molecules/tree/TreeNode',
    component: PTreeNode,
    parameters: {
        info: {
            summary: '',
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
                           :data="state.data"
                           :expanded="state.expanded"
                           :selected="state.selected"
                           :disabled="state.disabled"
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

                if (selectedItem) {
                    selectedItem.selected = false;
                }
                let current;
                matched.forEach((d, i) => {
                    if (i === 0) {
                        current = state;
                    } else {
                        current = current.children[d.key];
                    }

                    if (i === matched.length - 1) {
                        current.selected = !item.selected;
                        selectedItem = current;
                    }
                });
                state.children = [...state.children];
                action('node:click')(item, matched, e);
            },
            toggleClick(item, matched, e) {
                e.stopPropagation();
                let current;
                matched.forEach((d, i) => {
                    if (i === 0) {
                        current = state;
                    } else {
                        current = current.children[d.key];
                    }

                    if (i === matched.length - 1) {
                        current.expanded = !item.expanded;
                    }
                });
                state.children = [...state.children];
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
    }, { children: true }, { data: text }),
    template: `
        <div class="bg-coral-100" style="width: 80vw;">
            <PTreeNode v-bind="$props" :children.sync="children"
            >
                <template #toggle>
                    <p-i name="btn_ic_tree_hidden—folded"
                         :width="toggleSize" :height="toggleSize"
                    />
                </template>
                <template #right-extra>
                    <div class="text-right"><p-i name="common-gear"></p-i></div>
                </template>
            </PTreeNode>
        </div>
        `,
    setup(props, context) {
        const state = reactive({
            children: childrenData,
        });

        return {
            ...toRefs(state),
        };
    },
});

export const levelSlotCase = () => ({
    components: { PTreeNode },
    props: getKnobProps(treeNodeProps, {
        data: 'root',
    }, { children: true }, { data: text }),
    template: `
    <div class="bg-coral-100" style="width: 80vw;">
        <PTreeNode v-bind="$props" :children.sync="children"
        >
            <template #node-level-2>CUSTOM NODE</template>
        </PTreeNode>
    </div>`,
    setup(props, context) {
        const state = reactive({
            children: childrenData,
        });

        return {
            ...toRefs(state),
        };
    },
});
