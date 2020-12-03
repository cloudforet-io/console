import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs/vue';
import PCopyButton from '@/components/molecules/buttons/copy-button/PCopyButton.vue';

export default {
    title: 'Inputs/Buttons',
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
    template: ` <div> Copy Text: {{copyText}}
                    <p-copy-button :value="copyText"/>
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
