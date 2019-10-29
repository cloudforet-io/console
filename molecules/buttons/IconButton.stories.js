import { action } from '@storybook/addon-actions';
import { text, select } from '@storybook/addon-knobs/vue';
import PIconButton from './IconButton.vue';

import { autoProps } from '../../../setup/storybook-util';
import {
    animation_mapping, flip_mapping,
    icon_style_mapping,
    rotating_mapping,
    size_mapping,
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
    :size="size"
    :animation="animation"
    :rotating="rotating"
    :flip="flip"
>

</p-icon-button>`,
    props: {
        icon: {
            default: text('icon', 'fa-cog'),
        },
        iconStyle: {
            default: select('icon_style', [...Object.keys(icon_style_mapping)], 'solid'),
        },
        size: {
            default: select('size', [null, ...Object.keys(size_mapping)], null),
        },
        animation: {
            default: select('animation', [null, ...Object.keys(animation_mapping)], null),
        },
        rotating: {
            default: select('rotating', [null, ...Object.keys(rotating_mapping)], null),
        },
        flip: {
            default: select('flip', [null, ...Object.keys(flip_mapping)], null),
        },
        ...autoProps(PIconButton),
    },
    methods: {
        ...actions,
    },
});
