import { action } from '@storybook/addon-actions';
import { boolean, select } from '@storybook/addon-knobs';
import PDropdownBtn from '@/inputs/dropdown/dropdown-btn/PDropdownBtn.vue';
import { reactive, ref, toRefs } from '@vue/composition-api';

export default {
    title: 'Inputs/Dropdown/Deprecated',
    component: PDropdownBtn,
};
const actions = {
    clickAdd: action('clickAdd'),
    clickHello: action('clickHello'),
    clickDelete: action('clickDelete'),
};
const data = {
    popup: false,
};

export const dropdownButtonOnly = () => ({
    components: { PDropdownBtn },
    props: {
        styleType: {
            default: select('styleType', [
                '', 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'gray900',
            ], 'primary'),
        },
        size: {
            default: select('size', ['', 'sm', 'lg'], ''),
        },
        disabled: {
            default: boolean('disabled', false),
        },
        outline: {
            default: boolean('outline', false),
        },
    },
    template: `
<PDropdownBtn 
    :styleType="styleType"
    :disabled="disabled"
    :size="size"
    :outline="outline"
    :popup.sync="popup"
>
Action
</PDropdownBtn>`,
    setup(props) {
        const state = reactive({
            popup: false,
        });

        return {
            ...toRefs(state),
            ...actions,
        };
    },
});
