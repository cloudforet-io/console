import PAnchor from '@/components/molecules/anchors/PAnchor.vue';
import { text } from '@storybook/addon-knobs';


export default {
    title: 'Inputs/Anchors',
    component: PAnchor,
    parameters: {
        info: {
            summary: '',
            components: { PAnchor },
        },
    },
};

export const anchor = () => ({
    components: { PAnchor },
    props: {
        href: {
            default: text('href', 'www.naver.com'),
        },
        target: {
            default: text('target', '_blank'),
        },
    },
    template: '<p-anchor v-bind="$props">This is anchor to {{href}}.</p-anchor>',
});
