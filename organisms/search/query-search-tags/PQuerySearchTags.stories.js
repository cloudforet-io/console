import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PQuerySearchTags from './PQuerySearchTags.vue';

export default {
    title: 'organisms/search/QuerySearchTags',
    component: PQuerySearchTags,
    parameters: {
        info: {
            summary: '',
            components: { PQuerySearchTags },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PQuerySearchTags },
    props: {},
    template: `
    <div style="width: 80vw;">
        <PQuerySearchTags v-bind="$props"
                          :tags="tags"
                          @delete:tag="deleteTag"
                          @delete:all="deleteAll"
        ></PQuerySearchTags>
    </div>`,
    setup(props, context) {
        const state = reactive({
            tags: [
                { key: { label: 'ID', name: 'id' }, value: 'hello', operator: ':' },
                { key: null, value: 'this is query tag', operator: ':' },
            ],
        });

        return {
            ...toRefs(state),
            deleteTag: action('delete:tag'),
            deleteAll: action('delete:all'),
        };
    },
});
