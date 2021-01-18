import { action } from '@storybook/addon-actions';
import { select, text } from '@storybook/addon-knobs';
import PCopyButton from '@/molecules/buttons/copy-button/PCopyButton.vue';

export default {
    title: 'Inputs/Buttons/CopyButton',
    component: PCopyButton,
    parameters: {
        info: {
            summary: '',
            components: { PCopyButton },
        },
    },
};

export const copyButton = () => ({
    components: { PCopyButton },
    template: ` <div>
                    <p-copy-button :icon-color="iconColor" :alert-position="alertPosition" :value="copyText">{{copyText}}</p-copy-button>
                </div>`,

    props: {
        copyText: {
            default: text('value', 'Please, place any string to copy by button next to.'),
        },
        alertPosition: {
            default: select('alertPosition', ['right', 'bottom-end'], 'right'),
        },
        iconColor: {
            default: text('iconColor', ''),
        },
    },
    setup() {
        const click = action('click');
        return {
            click,
        };
    },
});
