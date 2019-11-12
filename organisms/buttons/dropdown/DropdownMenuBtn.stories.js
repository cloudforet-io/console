import { action } from '@storybook/addon-actions';
import { object } from '@storybook/addon-knobs';
import PDropdownMenuBtn from './DropdownMenuBtn';

export default {
    title: 'organisms/buttons/dropdown',
    component: PDropdownMenuBtn,
    parameters: {
        info: {
            summary: '',
            components: { PDropdownMenuBtn },
        },
    },
};
const actions = {
    clickAdd: action('clickAdd'),
    clickHello: action('clickHello'),
    clickDelete: action('clickDelete'),
    clickUpdate: action('clickUpdate'),
    clickCollect: action('clickCollect'),
    clickRemove: action('clickRemove'),
    clickMenuEvent: action('clickMenuEvent'),
};
const data = {};

export const dropdownMenuBtn = () => ({
    components: { PDropdownMenuBtn },
    template: `
<PDropdownMenuBtn
    :menu="menu"
    @clickMenuEvent="clickMenuEvent"
    @click-add="clickAdd"
    @click-hello='clickHello'
    @click-delete='clickDelete'
    @click-update='clickUpdate'
    @click-collect='clickCollect'
    @click-remove='clickRemove' 
 >
Action
</PDropdownMenuBtn>`,
    data() {
        return {
            ...data,
        };
    },
    props: {
        menu: {
            default: object('menu', [
                {
                    type: 'item', text: 'add', event: 'add', disabled: false,
                },
                {
                    type: 'item', text: 'hello', event: 'hello', disabled: false,
                },
                { type: 'divider' },
                { type: 'header', text: 'this is header' },
                {
                    type: 'item', text: 'update', event: 'update', disabled: false,
                },
                {
                    type: 'item', text: 'delete', event: 'delete', disabled: false,
                },
                { type: 'divider' },
                {
                    type: 'item', text: 'collect', event: 'collect', disabled: false,
                },
                { type: 'divider' },
                {
                    type: 'item', text: 'remove', event: 'remove', disabled: false,
                },


            ]),
        },
    },
    methods: {
        ...actions,
    },
});
