import { withKnobs, text, boolean, number, object } from '@storybook/addon-knobs/vue';
import BaseInput from './BAIN_001_BaseInput';
import { action } from '@storybook/addon-actions';

export default {
    title: 'base/Input',
    component: BaseInput,
    decorators: [withKnobs],
    parameters: {
        info: {
            summary: ``,
            components: { BaseInput }
        },
        cssresources: [{
            id: 'guid',
            code: `
                <style>
                    #guid { 
                        border: lightblue 1px solid !important; 
                        }
                    :focus{
                        background-color: red !important;
                    }
                </style>
                `,
        },
        ],
    }
};
const actions = {
    onFocus() {
        return action('focus');
    },
    onBlur() {
        return action('blur');
    }
};

const props = {
    value: {
        default: text('value', 'input value')
    },
    autofocus: {
        default: boolean('autofocus', false)
    },
    autowidth: {
        default: object('autowidth', { maxWidth: '960px', minWidth: '10px', comfortZone: 0 })
    },
};

export const simple = () => ({
    components: { BaseInput },
    template: `<BaseInput id="guid" :value="value"  @focus="onFocus" @blur="onBlur"></BaseInput>`,
    props: {
        ...props
    },
    computed: {
        ...actions
    },
});
