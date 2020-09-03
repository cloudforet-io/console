import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import md from './PQuerySearchTags.md';
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
        notes: md,
    },
};

const actions = {
    init: action('init'),
    add: action('add'),
    delete: action('delete'),
    'delete:tag': action('delete:tag'),
    'delete:all': action('delete:all'),
    change: action('change'),
};

export const defaultCase = () => ({
    components: { PQuerySearchTags },
    props: {
        timezone: {
            default: text('timezone', 'UTC'),
        },
    },
    template: `
    <div style="width: 80vw;">
        <PQuerySearchTags :timezone="timezone"
                          :tags="tags"
                          v-on="actions"
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
            actions,
        };
    },
});
