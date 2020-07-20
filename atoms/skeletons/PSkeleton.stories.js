import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';
import { getKnobProps } from '@sb/storybook-util';
import { skeletonProps } from '@/components/atoms/skeletons/PSkeleton.toolset';

export default {
    title: 'atoms/skeletons/ItemSkeleton',
    component: PSkeleton,
    parameters: {
        info: {
            summary: '',
            components: { PSkeleton },
        },
        knobs: { escapeHTML: false },
    },
};

/**
 * propName: {
 *      default: object('propName', {}),
 * }
 */
const getProps = () => ({});

const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const defaultCase = () => ({
    components: { PSkeleton },
    props: getKnobProps(skeletonProps),
    template: `
    <div style="width: 80vw;">
        <PSkeleton v-bind="$props">text</PSkeleton>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
