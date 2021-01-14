import { select, text, number } from '@storybook/addon-knobs';
import PLottie from './PLottie.vue';
import { names } from './p-lotties/names';


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
    template: `<div>
                    <p-lottie v-bind="$props"
                              style="width: 80vw; height: 80vh;"
                    />
                </div>`,
    props: {
        name: {
            default: select('name', names, names[0]),
        },
        size: {
            default: number('size', 1),
        },
        height: {
            type: String,
            default: text('height', '100%'),
        },
        width: {
            type: String,
            default: text('width', '100%'),
        },
    },
    setup() {
        return {
        };
    },
});
