import PTextInput from './TextInput';

export default {
    title: 'atoms/inputs',
    component: PTextInput,
    parameters: {
        info: {
            summary: '',
            components: { PTextInput },
        },
    },
};


export const textInput = () => ({
    components: { PTextInput },
    template: `
<div>
<p-text-input v-model="value" ></p-text-input>
<p>{{value}}</p>
</div>
`,
    data() {
        return {
            value: '입력',
        };
    },


});
