import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PSkeleton from '@/components/atoms/skeletons/PSkeleton.vue';

export default {
    title: 'Feedbacks/Loading',
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

export const skeleton = () => ({
    components: { PSkeleton },
    props: {},
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
