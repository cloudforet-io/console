import { number, select } from '@storybook/addon-knobs/vue';
import PSelect from '@/components/molecules/forms/select/PSelect.vue';
import { autoProps } from '@sb/storybook-util';

export default {
    title: 'others/select',
    component: PSelect,
    parameters: {
        info: {
            summary: '',
            components: { PSelect },
        },
    },
};
const actions = {};

export const base = () => ({
    components: { PSelect },
    template: `
<div>
<p-select
    :options="options"
    :selected.sync="selected"
    :customStyle="customStyle"
    :selectSize="selectSize"
>
</p-select>
<p> select data: {{selected}}</p>
</div>
`,
    data() {
        return {
            options: [
                { value: '1', text: 'choice' },
                { value: '2', text: 'two' },
                { value: '3' }, // value == text == 3
                { value: '4', text: 'four', disabled: true },
            ],
            selected: '1',
        };
    },
    props: {
        optionSize: number('option size', 0),
        selectSize: select('selectSize', ['', 'sm', 'lg'], ''),
        ...autoProps(PSelect, [
            { name: 'customStyle' },
        ]),
    },
    methods: {
        ...actions,
    },
});

export const multiSelect = () => ({
    components: { PSelect },
    template: `
<div>
<p-select
    :options="options"
    :selected.sync="selected"
    :customStyle="customStyle"
    :selectSize="selectSize"
    :multiple="true"
>
</p-select>
<p> select data: {{show}}</p>
</div>
`,
    data() {
        return {
            options: [
                { value: '1', text: 'choice' },
                { value: '2', text: 'two' },
                { value: '3' }, // value == text == 3
                { value: '4', text: 'four', disabled: true },
            ],
            selected: [],
        };
    },
    props: {
        optionSize: number('option size', 0),
        selectSize: select('selectSize', ['', 'sm', 'lg'], ''),
        ...autoProps(PSelect, [
            { name: 'customStyle' },
        ]),
    },
    computed: {
        show() {
            return this.selected;
        },
    },
    methods: {
        ...actions,
    },
});

export const objectOptions = () => ({
    components: { PSelect },
    template: `
<div>
<p-select
    :options="options"
    :selected.sync="selected"
    :customStyle="customStyle"
    :selectSize="selectSize"
>
</p-select>
<p> select data: {{show}}</p>
</div>
`,
    data() {
        return {
            options: [
                { value: { num: 1 }, text: 'choice' },
                { value: { num: 2 }, text: 'two' },
                { value: { num: 3 } }, // value == text == 3
                { value: { num: 4 }, text: 'four', disabled: true },
            ],
            selected: { num: 2 },
        };
    },
    props: {
        optionSize: number('option size', 0),
        selectSize: select('selectSize', ['', 'sm', 'lg'], ''),
        ...autoProps(PSelect, [
            { name: 'customStyle' },
        ]),
    },
    computed: {
        show() {
            return this.selected;
        },
    },
    methods: {
        ...actions,
    },
});
