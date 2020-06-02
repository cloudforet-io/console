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
        data: casual.word,
    }, { children: true }, { data: text }),
    template: `
    <div style="width: 80vw;">
        <PTreeNode v-bind="$props" :children.sync="children" @click="onClick"></PTreeNode>
    </div>`,
    setup(props, context) {
        const state = reactive({
            children: [
                {
                    data: casual.word,
                },
                {
                    data: casual.word,
                },
                {
                    data: casual.word,
                    children: [
                        {
                            data: casual.word,
                        },
                        {
                            data: casual.word,
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
