import { text } from '@storybook/addon-knobs/vue';
import PLoading from './Loading.vue';

export default {
    title: 'molecules/loading/loading',
    component: PLoading,
    parameters: {
        info: {
            summary: '',
            components: { PLoading },
        },
    },
};
const actions = {

};

export const loading = () => ({
    components: { PLoading },
    template: `<div style="width: 80vw;"><p-loading ></p-loading></div>`,
    props: {
        ...autoProps(PLoading),
    },
    methods: {
        ...actions,
    },
});
