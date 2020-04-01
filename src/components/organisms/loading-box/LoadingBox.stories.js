import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import { loadingBoxProps } from '@/components/organisms/loading-box/LoadingBox.toolset';
import PLoadingBox from './LoadingBox.vue';

export default {
    title: 'organisms/LoadingBox',
    component: PLoadingBox,
    parameters: {
        info: {
            summary: '',
            components: { PLoadingBox },
        },
        knobs: { escapeHTML: false },
    },
};


const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const defaultCase = () => ({
    components: { PLoadingBox },
    props: getKnobProps(loadingBoxProps),
    template: `
    <div style="width: 80vw;">
        <PLoadingBox v-bind="$props" class="h-40 w-40 border border-secondary">
            <div class="w-full h-full flex justify-center items-center">
                <p>HELLO WORLD</p>
            </div>
        </PLoadingBox>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
