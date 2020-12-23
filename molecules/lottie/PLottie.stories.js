import { text, number } from '@storybook/addon-knobs/vue';
import { autoProps } from '@sb/storybook-util';
import { ref } from '@vue/composition-api';
import PLottie from './PLottie.vue';

export default {
    title: 'Foundation/Graphics',
    component: PLottie,
    parameters: {
        info: {
            summary: '',
            components: { PLottie },
        },
        centered: { disable: true },
    },
};

export const lottie = () => ({
    components: { PLottie },
    template: `<div style="width: 80vw;">
                    <button @click="show">display loading</button>
                    <button @click="hide">stop loading</button>
                        <p-lottie v-bind="$props" ref="load"/>
                </div>`,
    props: {
        name: {
            default: text('name', 'spinner'),
        },
        size: {
            default: number('size', 2),
        },
        ...autoProps(PLottie),
    },
    setup() {
        const load = ref(null);
        const show = () => {
            load.create();
        };
        const hide = () => {
            load.destroy();
        };
        return {
            show,
            hide,
        };
    },
});
