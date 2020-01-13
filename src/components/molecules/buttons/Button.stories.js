import { action } from '@storybook/addon-actions';
import { text, select } from '@storybook/addon-knobs';
import { autoProps } from '@sb/storybook-util';
import { boolean } from '@storybook/addon-knobs';
import PIconButton from './IconButton';
import PCopyButton from './CopyButton';

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

const data = {
    sampleCopyData: 'This is a String to copy.',

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
