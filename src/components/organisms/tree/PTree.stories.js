import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { treeProps } from '@/components/organisms/tree/PTree.toolset';
import PTree from '@/components/organisms/tree/PTree.vue';

export default {
    title: 'organisms/tree',
    component: PTree,
    parameters: {
        info: {
            summary: '',
            components: { PTree },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PTree },
    props: getKnobProps(treeProps),
    template: `
    <div style="width: 80vw;">
        <PTree v-bind="$props"></PTree>
    </div>`,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});
