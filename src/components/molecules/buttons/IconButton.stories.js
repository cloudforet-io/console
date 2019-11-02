import { action } from '@storybook/addon-actions';
import { text, select } from '@storybook/addon-knobs/vue';
import PIconButton from './IconButton.vue';

import { autoProps } from '../../../setup/storybook-util';
import {
    animationMapping, flipMapping,
    iconStyleMapping,
    rotatingMapping,
    sizeMapping,
} from '../../atoms/icons/FiMapping';

export default {
    title: 'molecules/buttons/icon_button',
    component: PIconButton,
    parameters: {
        info: {
            summary: '',
            components: { PIconButton },
        },
    },
};
const actions = {
    click: action('click'),
};

export const button = () => ({
    components: { PIconButton },
    template: `
<p-icon-button 
    @click="click"
    :icon="icon"
    :dark="dark"
    :disabled="disabled"
    :iconStyle="iconStyle"
    :buttonStyle="buttonStyle"
    :size="size"
    :animation="animation"
    :rotating="rotating"
    :flip="flip"
>

</p-icon-button>`,
    props: {
        ...autoProps(PIconButton),
        icon: {
            default: text('icon', 'fa-cog'),
        },
        iconStyle: {
            default: select('icon_style', [...Object.keys(iconStyleMapping)], 'solid'),
        },
        size: {
            default: select('size', [null, ...Object.keys(sizeMapping)], null),
        },
        animation: {
            default: select('animation', [null, ...Object.keys(animationMapping)], null),
        },
        rotating: {
            default: select('rotating', [null, ...Object.keys(rotatingMapping)], null),
        },
        flip: {
            default: select('flip', [null, ...Object.keys(flipMapping)], null),
        },
        buttonStyle: {
            default: select('style', ['white', 'transparent', 'dark'], 'white'),
        },
    },
    methods: {
        ...actions,
    },
});
