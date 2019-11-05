import { action } from '@storybook/addon-actions';
import _ from 'lodash';
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


<PTagInputGroup :tags.sync="tags" >

</PTagInputGroup>
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
    computed: {
        destructTags() {
            return _.toPairsIn(this.tags);
        },
    },
});
