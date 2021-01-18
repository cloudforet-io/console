import { action } from '@storybook/addon-actions';
import { object } from '@storybook/addon-knobs';
import PDropdownMenuBtn from '@/organisms/dropdown/dropdown-menu-btn/PDropdownMenuBtn.vue';
import { reactive, toRefs } from '@vue/composition-api';

export default {
    title: 'Others/Dropdown/DropdownMenuBtn',
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
    menuSelect: action('select'),
};

export const dropdownMenuBtn = () => ({
    components: { PDropdownMenuBtn },
    template: `
<PDropdownMenuBtn
    :menu="menu"
    @select="menuSelect"
    @click-add="clickAdd"
    @click-hello='clickHello'
    @click-delete='clickDelete'
    @click-update='clickUpdate'
    @click-collect='clickCollect'
    @click-remove='clickRemove' 
 >
Action
</PDropdownMenuBtn>`,
    setup() {
        const state = reactive({
            menu: [
                {
                    type: 'item', label: 'Add', name: 'add', disabled: false,
                },
                {
                    type: 'item', label: 'Hello', name: 'hello', disabled: false,
                },
                { type: 'divider' },
                { type: 'header', label: 'this is header' },
                {
                    type: 'item', label: 'Update', name: 'update', disabled: false,
                },
                {
                    type: 'item', label: 'Delete', name: 'delete', disabled: false,
                },
                { type: 'divider' },
                {
                    type: 'item', label: 'Collect', name: 'collect', disabled: false,
                },
                { type: 'divider' },
                {
                    type: 'item', label: 'Remove', name: 'remove', disabled: true,
                },
            ],
        });
        return {
            ...toRefs(state),
            ...actions,
        };
    },
});
