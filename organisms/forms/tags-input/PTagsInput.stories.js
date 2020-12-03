import {
    withKnobs, select, text, boolean,
} from '@storybook/addon-knobs';
import { reactive } from '@vue/composition-api';
import { autoProps } from '@sb/storybook-util';
import PTagsInput from '@/components/organisms/forms/tags-input/PTagsInput.vue';

export default {
    title: 'others/tags-input',
    component: PTagsInput,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: '',
            components: { PTagsInput },
        },
    },
};

const actions = {};


const getData = () => reactive({
    tags: ['a', 'b', 'c'],
});

export const defaultCase = () => ({
    components: { PTagsInput },
    props: {
        boxStyle: { default: select('boxStyle', ['primary4']) },
        placeholder: { default: text('placeholder', 'placeholder') },
        focus: { default: boolean('focus', true) },
        noDuplicate: { default: boolean('noDuplicate', true) },
    },
    template: `<div style="width: 100vw; height: 100vh; position: relative; background-color: white;">
                <p-tags-input :tags.sync="tags"
                              v-bind="$props"
                              style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%;"
                />
                    <br>
                    This tags : {{ tags }}
                    <br>
                </div>`,
    setup() {
        return {
            ...getData(),
        };
    },
});
