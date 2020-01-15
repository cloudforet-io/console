import { action } from '@storybook/addon-actions';
import { text, select, boolean } from '@storybook/addon-knobs/vue';

import PIconButton from './IconButton.vue';
import PCopyButton from './CopyButton.vue';

import {
    animationMapping, flipMapping,
    iconStyleMapping,
    rotatingMapping,
    sizeMapping,
} from '../../atoms/icons/PiMapping';

export default {
    title: 'molecules/buttons',
    component: PIconButton,
    parameters: {
        info: {
            summary: '',
            components: { PIconButton, PCopyButton },
        },
    },
};

const actions = {
    click: action('click'),
};


export const iconButton = () => ({
    components: { PIconButton },
    template: `
<p-icon-button 
    @click="click"
    name="ic_refresh"
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
        // ...autoProps(PIconButton),
        dark: {
            default: boolean('dark', false),
        },
        iconStyle: {
            default: select('icon_style', [...Object.keys(iconStyleMapping)], 'solid'),
        },
        size: {
            default: select('size', ['', ...Object.keys(sizeMapping)], ''),
        },
        animation: {
            default: select('animation', ['', ...Object.keys(animationMapping)], ''),
        },
        rotating: {
            default: select('rotating', ['', ...Object.keys(rotatingMapping)], ''),
        },
        flip: {
            default: select('flip', ['', ...Object.keys(flipMapping)], ''),
        },
        buttonStyle: {
            default: select('style', ['white', 'transparent', 'dark'], 'white'),
        },
    },
    methods: {
        ...actions,
    },
});


export const copyButton = () => ({
    components: { PCopyButton },
    template: ` <div> Copy Text: {{copyText}}
                    <p-copy-button :value="copyText"/>
                </div>`,

    props: {
        copyText: {
            default: text('title', 'Please, place any string to copy by button next to.'),
        },
    },
    methods: {
        ...actions,
    },
});
