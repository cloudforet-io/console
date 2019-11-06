import { boolean, text } from '@storybook/addon-knobs/vue';
import PTagInput from './TagInput';

export default {
    title: 'molecules/forms/tagInput',
    component: PTagInput,
    parameters: {
        info: {
            summary: '',
            components: { PTagInput },
        },
    },
};
const data = {
    key: '태그명',
    value: '',
};

export const tagInput = () => ({
    components: { PTagInput },
    template: `
<div class="row" style="width: 80vw">
<p-tag-input
style="width: 100%" 
    :tagKey.sync="key" 
    :tagValue.sync="value" 
    :disabled="disabled"
    :tagKeyPlaceholder="tagKeyPlaceholder"
    :tagValuePlaceholder="tagValuePlaceholder"
></p-tag-input>
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
