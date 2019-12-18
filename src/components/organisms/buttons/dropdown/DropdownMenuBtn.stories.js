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
    clickMenuname: action('clickMenuEvent'),
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
                    type: 'item', label: 'add', name: 'add', disabled: false,
                },
                {
                    type: 'item', label: 'hello', name: 'hello', disabled: false,
                },
                { type: 'divider' },
                { type: 'header', label: 'this is header' },
                {
                    type: 'item', label: 'update', name: 'update', disabled: false,
                },
                {
                    type: 'item', label: 'delete', name: 'delete', disabled: false,
                },
                { type: 'divider' },
                {
                    type: 'item', label: 'collect', name: 'collect', disabled: false,
                },
                { type: 'divider' },
                {
                    type: 'item', label: 'remove', name: 'remove', disabled: false,
                },


            ]),
        },
    },
    methods: {
        ...actions,
    },
});
