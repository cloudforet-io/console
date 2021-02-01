import { action } from '@storybook/addon-actions';
import {
    select, boolean, text, withKnobs,
} from '@storybook/addon-knobs';

import icon from 'vue-svgicon';
import PIconTextButton from '@/inputs/buttons/icon-text-button/PIconTextButton.vue';

const sizeMapping = {
    xs: 'fa-xs',
    sm: 'fa-sm',
    lg: 'fa-lg',
    '2x': 'fa-2x',
    '3x': 'fa-3x',
    '4x': 'fa-4x',
    '5x': 'fa-5x',
    '6x': 'fa-6x',
    '7x': 'fa-7x',
    '8x': 'fa-8x',
    '9x': 'fa-9x',
    '10x': 'fa-10x',
};

const icons = Object.keys(icon.icons);

export default {
    title: 'Inputs/Buttons/Button/With Icons',
    component: PIconTextButton,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5152%3A122457',
        },
    },
};

export const withIcons = () => ({
    components: { PIconTextButton },
    template: `
        <p-icon-text-button 
            @click="click"
            :name="name"
            :disabled="disabled"
            :styleType="styleType"
            :size="size"
            :iconDirection="iconDirection"
            :href="href"
        >
           icon text button 
        </p-icon-text-button>`,
    props: {
        name: {
            default: select('name', icons, 'ic_plus_bold'),
        },
        disabled: {
            default: boolean('disabled', false),
        },
        size: {
            default: select('size', ['', ...Object.keys(sizeMapping)], ''),
        },
        styleType: {
            default: select('style', [
                'primary', 'primary-dark', 'primary1', 'primary2', 'primary3', 'primary4',
                'secondary', 'secondary1', 'secondary2',
                'coral', 'yellow'], 'primary'),
        },
        iconDirection: {
            default: select('iconDirection', ['left', 'right'], 'left'),
        },
        href: {
            default: text('href', ''),
        },
    },
    setup() {
        const click = action('click');
        return {
            click,
        };
    },
});
