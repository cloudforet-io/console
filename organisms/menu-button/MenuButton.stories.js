import MenuButton from './MenuButton.vue';
import { autoProps } from '../../../setup/storybook-util';

export default {
    title: 'Organisms/menu-button',
    component: MenuButton,
};

export const defaultCase = () => ({
    components: { MenuButton },
    props: {
        ...autoProps(MenuButton),
    },
    template: '<menu-button :icon="icon" :tooltip="tooltip"/>',
});
