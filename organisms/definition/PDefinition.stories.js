import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { definitionProps } from '@/components/organisms/definition/PDefinition.toolset';
import PDefinition from '@/components/organisms/definition/PDefinition.vue';

export default {
    title: 'organisms/Definition',
    component: PDefinition,
    parameters: {
        info: {
            summary: '',
            components: { PDefinition },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PDefinition },
    props: getKnobProps(definitionProps, {
        name: 'name',
        data: 'data',
    }),
    template: `
    <div style="width: 80vw;">
        <PDefinition v-bind="$props"></PDefinition>
    </div>`,
    setup(props, context) {
        const state = reactive({});

        return {
            ...toRefs(state),
        };
    },
});
