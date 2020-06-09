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
    <div class="bg-coral-100" style="width: 80vw;">
        <PTreeNode v-bind="$props" :children.sync="children"
                   @row:click="rowClick"
                   @node:click="nodeClick"
                   @toggle:click.stop="toggleClick"
                   @data:click.stop="dataClick"
                   @node:mouseenter="nodeMouseenter"
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
            rowClick: action('row:click'),
            nodeClick: action('node:click'),
            toggleClick: action('toggle:click'),
            dataClick: action('data:click'),
            nodeMouseenter: action('node:mouseenter'),
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
        };
    },
});
