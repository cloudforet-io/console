import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import casual from '@/lib/casual';
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


export const defaultCase = () => ({
    components: { PTreeNode },
    props: getKnobProps(treeNodeProps, {
        data: 'root',
    }, { children: true }, { data: text }),
    template: `
    <div style="width: 80vw;">
        <PTreeNode v-bind="$props" :children.sync="children"
                   @node:click="onClick"
                   @node:mouseenter="onMouseenter"
        >
        </PTreeNode>
    </div>`,
    setup(props, context) {
        const state = reactive({
            children: [
                {
                    data: 'a',
                },
                {
                    data: 'b',
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
            ],
        });

        return {
            ...toRefs(state),
            onClick: action('click'),
            onMouseenter: action('mouseenter'),
        };
    },
});

export const slotCase = () => ({
    components: { PTreeNode },
    props: getKnobProps(treeNodeProps, {
        data: 'root',
    }, { children: true }, { data: text }),
    template: `
    <div style="width: 80vw;">
        <PTreeNode v-bind="$props" :children.sync="children"
                   @node:click="onClick"
        >
            <template #toggle>CUSTOM TOGGLE</template>
        </PTreeNode>
    </div>`,
    setup(props, context) {
        const state = reactive({
            children: [
                {
                    data: 'a',
                },
                {
                    data: 'b',
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
            ],
        });

        return {
            ...toRefs(state),
            onClick: action('click'),
        };
    },
});

export const particularNodeSlotCase = () => ({
    components: { PTreeNode },
    props: getKnobProps(treeNodeProps, {
        data: 'root',
    }, { children: true }, { data: text }),
    template: `
    <div style="width: 80vw;">
        <PTreeNode v-bind="$props" :children.sync="children"
                   @node:click="onClick"
        >
            <template #node-level-2>CUSTOM NODE</template>
        </PTreeNode>
    </div>`,
    setup(props, context) {
        const state = reactive({
            children: [
                {
                    data: 'a',
                },
                {
                    data: 'b',
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
            ],
        });

        return {
            ...toRefs(state),
            onClick: action('click'),
        };
    },
});
