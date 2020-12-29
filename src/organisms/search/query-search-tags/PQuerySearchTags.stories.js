import {
    toRefs, reactive,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text,
} from '@storybook/addon-knobs/vue';
import md from './PQuerySearchTags.md';
import PQuerySearchTags from './PQuerySearchTags.vue';

export default {
    title: 'Inputs/Search/QuerySearchTags',
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

export const querySearchTags = () => ({
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
                { key: { label: 'ID', name: 'id' }, value: { label: 'Hello', name: 'hello' }, operator: '' },
                { key: null, value: { label: 'No key', name: 'no key' }, operator: '' },
                {
                    key: { label: 'DataTypes', name: 'data types' },
                    value: { label: 'The same with QuerySearch data types.', name: 'datetime, integer, ...' },
                    operator: '',
                },
                {
                    key: { label: 'Operators', name: 'operators' },
                    value: { label: 'The same with QuerySearch operators.', name: '=, !=, ...' },
                    operator: '=',
                },
                {
                    key: { label: 'Invalid Case', name: 'invalid case', dataType: 'datetime' },
                    value: { label: 'If the value is not suitable format for data type, it displays tags like this.', name: 'invalid!' },
                    operator: '',
                },
                {
                    key: { label: 'Clear all', name: 'clear all' },
                    value: { label: 'If there is no tag, nothing will be displayed.', name: 'no tags' },
                    operator: '',
                },
            ],
        });

        return {
            ...toRefs(state),
            actions,
        };
    },
});


export const slotCase = () => ({
    components: { PQuerySearchTags },
    props: {
        timezone: {
            default: text('timezone', 'UTC'),
        },
    },
    template: `
        <div style="width: 80vw;">
            <div class="my-8">
                It has slots per data type.<br>
                - data-type-string<br>
                - data-type-integer<br>
                - data-type-float<br>
                - data-type-datetime<br>
                <br>
                Slot props: <br>
                - all props <br>
                - tag: current QueryTag item.<br>
            </div>
            <PQuerySearchTags :timezone="timezone"
                              :tags="tags"
                              v-on="actions"
            >
                <template #data-type-datetime="{tag}">
                    {{tag.value.label}}
                </template>
            </PQuerySearchTags>
        </div>`,
    setup(props, context) {
        const state = reactive({
            tags: [
                { key: { label: 'ID', name: 'id' }, value: { label: 'Hello', name: 'hello' }, operator: '' },
                { key: null, value: { label: 'No key', name: 'no key' }, operator: '' },
                {
                    key: { label: 'DataTypes', name: 'data types' },
                    value: { label: 'The same with QuerySearch data types.', name: 'datetime, integer, ...' },
                    operator: '',
                },
                {
                    key: { label: 'Operators', name: 'operators' },
                    value: { label: 'The same with QuerySearch operators.', name: '=, !=, ...' },
                    operator: '=',
                },
                {
                    key: { label: 'Invalid Case', name: 'invalid case', dataType: 'datetime' },
                    value: { label: 'If the value is not suitable format for data type, it displays tags like this.', name: 'invalid!' },
                    operator: '',
                },
                {
                    key: { label: 'Clear all', name: 'clear all' },
                    value: { label: 'If there is no tag, nothing will be displayed.', name: 'no tags' },
                    operator: '',
                },
            ],
        });

        return {
            ...toRefs(state),
            actions,
        };
    },
});
