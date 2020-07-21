import { toPairsIn } from 'lodash';
import { boolean } from '@storybook/addon-knobs/vue';
import PDictInputGroup from '@/components/organisms/forms/dict-input-group/PDictInputGroup_deprecated.vue';

export default {
    title: 'organisms/forms/DictInputGroupDeprecated',
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
<div style="width: 80vw; background-color: white;">
    <p-dict-input-group :dict.sync="dict" :editMode="editMode" >
    </p-dict-input-group>
    <br><br>
    <h5>tag binding</h5>
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
            return toPairsIn(this.dict);
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
            return toPairsIn(this.dict);
        },
    },
});
