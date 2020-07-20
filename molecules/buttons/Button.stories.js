import { action } from '@storybook/addon-actions';
import { text, select, boolean } from '@storybook/addon-knobs/vue';

import icon from 'vue-svgicon';
import PIconButton from '@/components/molecules/buttons/icon-button/PIconButton.vue';
import PIconTextButton from '@/components/molecules/buttons/icon-text-button/PIconTextButton.vue';
import PCopyButton from '@/components/molecules/buttons/copy-button/PCopyButton.vue';

import {
    animationMapping, flipMapping,
    iconStyleMapping,
    rotatingMapping,
    sizeMapping,
} from './Button.stories.toolset';

const icons = Object.keys(icon.icons);


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
    :name="name"
    :disabled="disabled"
    :iconStyle="iconStyle"
    :size="size"
    :animation="animation"
    :rotating="rotating"
    :flip="flip"
>
</p-icon-button>`,
    props: {
        name: {
            default: select('name', icons, 'ic_refresh'),
        },
        // ...autoProps(PIconButton),
        iconStyle: {
            default: select('icon_style', [...Object.keys(iconStyleMapping)], 'solid'),
        },
        disabled: {
            default: boolean('disabled', false),
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
    },
    methods: {
        ...actions,
    },
});


export const iconTextButton = () => ({
    components: { PIconTextButton },
    template: `
<p-icon-text-button 
    @click="click"
    :name="name"
    :disabled="disabled"
    :styleType="styleType"
    :size="size"
    :iconDirection="iconDirection"
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
            default: text('value', 'Please, place any string to copy by button next to.'),
        },
    },
    methods: {
        ...actions,
    },
});
