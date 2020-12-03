import { select, text, boolean } from '@storybook/addon-knobs/vue';
import { withDesign } from 'storybook-addon-designs';
import { action } from '@storybook/addon-actions';
import PButton from '@/components/atoms/buttons/PButton.vue';

export default {
    title: 'others/Buttons(old)',
    component: PButton,
    decorators: [withDesign],
    parameters: {
        info: {
            summary: '',
            components: { PButton },
        },
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=100%3A47',
        },
    },
};
const actions = {
    click: action('click'),
};
const data = {};

export const button = () => ({
    components: { PButton },
    template: `
<p-button
        @click="click"
        :href="href" 
        :styleType="styleType" 
        :size="size"
        :disabled="disabled"
        :outline="outline"
        :link="link"
        :shpae="shape"
        >
       {{defaultSlot}} 
</p-button>`,
    data() {
        return {
            ...data,
        };
    },
    props: {
        styleType: {
            default: select('styleType', [
                '',
                'primary', 'primary-dark', 'primary1', 'primary2', 'primary3', 'primary4',
                'secondary', 'secondary1', 'secondary2',
                'coral', 'yellow',
                'gray', 'gray200', 'gray100',
                'alert', 'safe', 'gray900', 'gray900-hover',
            ], 'primary'),
        },
        size: {
            default: select('size', ['', 'sm', 'lg'], ''),
        },
        shape: {
            default: select('shape', ['', 'circle'], ''),
        },
        defaultSlot: {
            default: text('default slot', 'button'),
        },
        href: {
            default: text('href', ''),
        },
        disabled: {
            default: boolean('disabled', false),
        },
        outline: {
            default: boolean('outline', false),
        },
        link: {
            default: boolean('link', false),
        },
    },
    methods: {
        ...actions,
    },
});

export const block = () => ({
    components: { PButton },
    template: `
<div style="width: 600px;height: 100px;border: #1a1f3e solid 1px;">
<p-button
        @click="click"
        :href="href" 
        :styleType="styleType" 
        :size="size" 
        :disabled="disabled"
        :outline="outline"
        :link="link"
        :block="block"
        :shpae="shape"
        >
       {{defaultSlot}} 
</p-button>
</div>`,
    data() {
        return {
            ...data,
        };
    },
    props: {
        styleType: {
            default: select('styleType', [
                '', 'primary', 'primary-dark', 'primary1', 'primary2', 'primary3', 'primary4',
                'secondary', 'secondary1', 'secondary2',
                'coral', 'yellow',
                'gray', 'gray200', 'gray100',
                'alert', 'safe', 'gray900', 'gray900-hover',
            ], 'primary'),
        },
        size: {
            default: select('size', ['', 'sm', 'lg'], ''),
        },
        shape: {
            default: select('shape', ['', 'circle'], ''),
        },
        defaultSlot: {
            default: text('default slot', 'button', 'slot'),
        },
        href: {
            default: text('href', ''),
        },
        disabled: {
            default: boolean('disabled', false),
        },
        outline: {
            default: boolean('outline', false),
        },
        link: {
            default: boolean('link', false),
        },
        block: {
            default: boolean('block', false),
        },
    },
    methods: {
        ...actions,
    },
});
