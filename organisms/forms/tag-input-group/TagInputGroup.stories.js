import _ from 'lodash';
import { boolean } from '@storybook/addon-knobs/vue';
import PTagInputGroup from './TagInputGroup';

export default {
    title: 'organisms/forms/tag-input-group',
    component: PTagInputGroup,
    parameters: {
        info: {
            summary: '',
            components: { PTagInputGroup },
        },
    },
};
const actions = {};
const data = {
    tags: {
        tag1: 'tag1 value',
        tag2: 'tag2 value',
        tag3: 'tag3 value',
        tag4: 'tag4 value',
    },
};

export const tagInputGroup = () => ({
    components: { PTagInputGroup },
    template: `
<div style="width: 80vw;">


<PTagInputGroup :tags.sync="tags" :editMode="editMode" >

</PTagInputGroup>
<h6>tag binding</h6>
<p>
{{destructTags}}
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
        destructTags() {
            return _.toPairsIn(this.tags);
        },
    },
});

export const editMode = () => ({
    components: { PTagInputGroup },
    template: `
<div style="width: 80vw;">
<PTagInputGroup :tags.sync="tags" :editMode="editMode" >
</PTagInputGroup>
<h6>tag binding</h6>
<p>
{{destructTags}}
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
        destructTags() {
            return _.toPairsIn(this.tags);
        },
    },
});
