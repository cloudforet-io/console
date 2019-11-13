import { action } from '@storybook/addon-actions';
import { object, boolean, select } from '@storybook/addon-knobs';
import PDropdownBtn from '@/components/organisms/buttons/dropdown/DropdownBtn';

export default {
    title: 'organisms/buttons/dropdown/btn',
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

export const simple = () => ({
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
    },
    methods: {
        ...actions,
    },
});

