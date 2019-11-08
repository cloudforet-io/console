import { action } from '@storybook/addon-actions';
import { object, boolean, select } from '@storybook/addon-knobs';
import PDropdown from './Dropdown';

export default {
    title: 'organisms/buttons/dropdown',
    component: PDropdown,
    parameters: {
        info: {
            summary: '',
            components: { PDropdown },
        },
    },
};
const actions = {
    clickAdd: action('clickAdd'),
    clickHello: action('clickHello'),
    clickDelete: action('clickDelete'),
};
const data = {};

export const simple = () => ({
    components: { PDropdown },
    template: `
<PDropdown 
    @click-hello="clickHello" 
    @click-add="clickAdd"
    :styleType="styleType"
    :menu="menu"
    :disabled="disabled"
    :size="size"
    :outline="outline"
>
Action
</PDropdown>`,
    data() {
        return {
            ...data,
        };
    },
    props: {
        styleType: {
            default: select('styleType', [
                null, 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark',
            ], 'primary'),
        },
        size: {
            default: select('size', [null, 'sm', 'lg'], null),
        },
        disabled: {
            default: boolean('disabled', false),
        },
        outline: {
            default: boolean('outline', false),
        },
        menu: {
            default: object('menu', [
                { type: 'header', text: 'this is header' },
                { type: 'divider' },
                {
                    type: 'item', text: 'add', event: 'add', disabled: false,
                },
                {
                    type: 'item', text: 'hello', event: 'hello', disabled: false,
                },
                { type: 'divider' },
                { type: 'text', text: 'this is text' },
            ]),
        },
    },
    methods: {
        ...actions,
    },
});
export const buttonOnly = () => ({
    components: { PDropdown },
    template: `
<PDropdown 
    @click-hello="clickHello" 
    @click-add="clickAdd"
    @click-delete="clickDelete"
    :styleType="styleType"
    :menu="menu"
    :disabled="disabled"
    :size="size"
    :outline="outline"
>
Action
</PDropdown>`,
    data() {
        return {
            ...data,
        };
    },
    props: {
        styleType: {
            default: select('styleType', [
                null, 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark',
            ], 'primary'),
        },
        size: {
            default: select('size', [null, 'sm', 'lg'], null),
        },
        disabled: {
            default: boolean('disabled', false),
        },
        outline: {
            default: boolean('outline', false),
        },
        menu: {
            default: object('menu', [
                {
                    type: 'item', text: 'add', event: 'add', disabled: false,
                },
                {
                    type: 'item', text: 'hello', event: 'hello', disabled: false,
                },
                {
                    type: 'item', text: 'delete', event: 'delete', disabled: false,
                },
            ]),
        },
    },
    methods: {
        ...actions,
    },
});
