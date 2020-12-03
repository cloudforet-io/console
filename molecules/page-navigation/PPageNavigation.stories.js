import { text, number } from '@storybook/addon-knobs/vue';
import { autoProps } from '@sb/storybook-util';
import PPageNavigation from './PPageNavigation.vue';

export default {
    title: 'Navigation/PageNavigation',
    component: PPageNavigation,
    parameters: {
        info: {
            summary: '',
            components: { PPageNavigation },
        },
        centered: { disable: true },
    },
};

export const pageNavigation = () => ({
    components: { PPageNavigation },
    template: `<div style="width: 80vw;">
                    
                </div>`,
    data() {
        return {
        };
    },
    props: {
    },
    methods: {
    },
});
