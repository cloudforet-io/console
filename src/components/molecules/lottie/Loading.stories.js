import PLottie from './PLottie.vue';
import { text, select } from '@storybook/addon-knobs/vue';
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
                <p-lottie :name="name" :size="size" ref="load"/>
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
            default: text('size', '2'),
        },
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
