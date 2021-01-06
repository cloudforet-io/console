import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs/vue';
import PCopyButton from '@/components/molecules/buttons/copy-button/PCopyButton.vue';
import { ref } from '@vue/composition-api';

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
                    <p-copy-button :value="copyText">{{copyText}}</p-copy-button>
                </div>`,

    props: {
        copyText: {
            default: text('value', 'Please, place any string to copy by button next to.'),
        },
    },
    setup() {
        const click = action('click');
        return {
            click,
        };
    },
});
