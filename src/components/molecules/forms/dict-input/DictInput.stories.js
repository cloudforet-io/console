import { boolean, text } from '@storybook/addon-knobs/vue';
import PDictInput from './DictInput.vue';

export default {
    title: 'molecules/forms/DictInput',
    component: PDictInput,
    parameters: {
        info: {
            summary: '',
            components: { PDictInput },
        },
    },
};
const data = {
    key: '태그명',
    value: '',
};

export const defaultCase = () => ({
    components: { PDictInput },
    template: `
<div class="flex flex-wrap" style="width: 80vw">
<p-dict-input
style="width: 100%" 
    :name.sync="key" 
    :value.sync="value" 
    :disabled="disabled"
    :tagKeyPlaceholder="tagKeyPlaceholder"
    :tagValuePlaceholder="tagValuePlaceholder"
></p-dict-input>
<p>{{key}} : {{value}}</p>

</div>
`,
    props: {
        disabled: {
            default: boolean('disabled', false),
        },
        tagKeyPlaceholder: {
            default: text('tagKeyPlaceholder', '태그 키 입력'),
        },
        tagValuePlaceholder: {
            default: text('tagValuePlaceholder', '태그 값 입력'),
        },

    },
    data() {
        return {
            ...data,
        };
    },
});
