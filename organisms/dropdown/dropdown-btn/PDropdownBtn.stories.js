import { action } from '@storybook/addon-actions';
import { boolean, select } from '@storybook/addon-knobs';
import PDropdownBtn from '@/components/organisms/dropdown/dropdown-btn/PDropdownBtn.vue';

export default {
    title: 'organisms/dropdown/default',
    component: PDropdownBtn,
    parameters: {
        info: {
            summary: '',
            components: { PDropdownBtn },
        },
    },
};
const actions = {
    clickAdd: action('clickAdd'),
    clickHello: action('clickHello'),
    clickDelete: action('clickDelete'),
};
const data = {
    popup: false,
};

export const DefaultCase = () => ({
    components: { PDropdownBtn },
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
    data() {
        return {
            ...data,
        };
    },
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
    methods: {
        ...actions,
    },
});

