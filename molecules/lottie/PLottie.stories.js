import { text, number } from '@storybook/addon-knobs/vue';
import { autoProps } from '@sb/storybook-util';
import PLottie from './PLottie.vue';

export default {
    title: 'molecules/lottie',
    component: PLottie,
    parameters: {
        info: {
            summary: '',
            components: { PLottie },
        },
        centered: { disable: true },
    },
};

export const DefaultCase = () => ({
    components: { PLottie },
    template: `<div style="width: 80vw;">
                    <button @click="show">display loading</button>
                    <button @click="hide">stop loading</button>
                        <p-lottie v-bind="$props" ref="load"/>
                </div>`,
    data() {
        return {
        };
    },
    props: {
        name: {
            default: text('name', 'spinner'),
        },
        size: {
            default: number('size', 2),
        },
        ...autoProps(PLottie),
    },
    methods: {
        show() {
            this.$refs.load.create();
        },
        hide() {
            this.$refs.load.destroy();
        },
    },
});
