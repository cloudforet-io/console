import { withKnobs, text, boolean, number, object } from '@storybook/addon-knobs/vue';
import BaseInput from './BAIN_001_BaseInput';
import { action } from '@storybook/addon-actions';
import { autoProps } from '../../../setup/storybook_util';

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

export const simple = () => ({
    components: { BaseInput },
    template: `<BaseInput id="guid" :value="value"  @focus="onFocus" @blur="onBlur"></BaseInput>`,
    props: {
        ...autoProps(BaseInput, [
            { name: 'value', default: 'typing here!' }
        ])
    },
    computed: {
        ...actions
    },
});
