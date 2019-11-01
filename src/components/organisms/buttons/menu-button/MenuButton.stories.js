// eslint-disable-next-line import/no-extraneous-dependencies
import { text } from '@storybook/addon-knobs/vue';
import MenuButton from './MenuButton.vue';

export default {
    title: 'Organisms/menu-button',
    component: MenuButton,
};

export const defaultCase = () => ({
    components: { MenuButton },
    props: {
        icon: {
            default: text('icon', 'fa-smile-wink'),
        },
        tooltip: {
            default: text('tooltip', 'tooltip contents'),
        },
    },
    template: '<menu-button :icon="icon" :tooltip="tooltip"/>',
});
