import { text, number, boolean } from '@storybook/addon-knobs/vue';
import PLottie from './PLottie.vue';
import { autoProps } from '@/setup/storybook-util';

export default {
    title: 'molecules/lottie/lottie',
    component: PLottie,
    parameters: {
        info: {
            summary: '',
            components: { PLottie },
        },
        centered: { disable: true },
    },
};

export const loading = () => ({
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


export const autoLoading = () => ({
    components: { PLottie },
    template: `<div style="width: 80vw;">
                <p-lottie v-bind="$props"/>
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
        auto: {
            default: boolean('auto', true),
        },
    },
});

