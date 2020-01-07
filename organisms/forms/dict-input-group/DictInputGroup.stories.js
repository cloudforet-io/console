import _ from 'lodash';
import { boolean } from '@storybook/addon-knobs/vue';
import PDictInputGroup from './DictInputGroup.vue';

export default {
    title: 'organisms/forms/DictInputGroup',
    component: PDictInputGroup,
    parameters: {
        info: {
            summary: '',
            components: { PDictInputGroup },
        },
    },
};
const actions = {};
const data = {
    dict: {
        tag1: 'tag1 value',
        tag2: 'tag2 value',
        tag3: 'tag3 value',
        tag4: 'tag4 value',
    },
};
export const defaultCase = () => ({
    components: { PDictInputGroup },
    template: `
<div style="width: 80vw;">


<p-dict-input-group :dict.sync="dict" :editMode="editMode" >

</p-dict-input-group>
<h6>tag binding</h6>
<p>
{{destructDict}}
</p>
</div>
`,
    data() {
        return {
            ...data,
        };
    },
    methods: {
        ...actions,
    },
    props: {
        editMode: {
            default: boolean('editMode', false),
        },
    },
    computed: {
        destructDict() {
            return _.toPairsIn(this.dict);
        },
    },
});

export const editMode = () => ({
    components: { PDictInputGroup },
    template: `
<div style="width: 80vw;">
<p-dict-input-group :dict.sync="dict" :editMode="editMode" >
</p-dict-input-group>
<h6>tag binding</h6>
<p>
{{destructDict}}
</p>
</div>
`,
    data() {
        return {
            ...data,
        };
    },
    methods: {
        ...actions,
    },
    props: {
        editMode: {
            default: boolean('editMode', true),
        },
    },
    computed: {
        destructDict() {
            return _.toPairsIn(this.dict);
        },
    },
});
