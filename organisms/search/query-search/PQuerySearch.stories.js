/* eslint-disable camelcase */
import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PQuerySearch from './PQuerySearch.vue';
import casual, { arrayOf } from '../../../../lib/casual';

export default {
    title: 'organisms/search/QuerySearch',
    component: PQuerySearch,
    parameters: {
        info: {
            summary: '',
            components: { PQuerySearch },
        },
        knobs: { escapeHTML: false },
    },
};

const querySearchProps = {
    value: {
        type: String,
        default: '',
        required: true,
    },
    placeholder: {
        type: String,
        default: 'Search',
    },
    focused: {
        type: Boolean,
        default: true,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    keyItems: {
        type: Array,
        default: () => [],
    },
    valueItems: {
        type: Array,
        default: () => [],
    },
};

export const defaultCase = () => ({
    components: { PQuerySearch },
    props: getKnobProps(querySearchProps, {
    }, {
        value: true,
        keyItems: true,
        valueItems: true,
    }),
    template: `
    <div style="width: 80vw;">
        <PQuerySearch v-bind="$props"
                      v-model="value"
                      :keyItems="keyItems"
                      :valueItems="valueItems"
                      @key:select="onKeySelect"
                      @search="onSearch"
                      @key:input="onKeyInput"
                      @value:input="onValueInput"
        ></PQuerySearch>
        <pre class="mt-8">{{queries}}</pre>
    </div>`,
    setup(props, context) {
        const keyItems = [{
            label: 'Project ID', name: 'project_id',
        }, {
            label: 'Project Name', name: 'name',
        }, {
            label: 'Project Group ID', name: 'project_group_id',
        }];

        const state = reactive({
            value: '',
            keyItems,
            valueItems: [],
            queries: [],
        });


        const valueItems = {
            project_id: arrayOf(10, () => casual.make_id('project')),
            name: arrayOf(10, () => casual.word),
            project_group_id: arrayOf(10, () => casual.make_id('pg')),
        };


        const keyHandler = (inputText) => {
            let res = keyItems;
            if (inputText) {
                res = keyItems.reduce((result, item) => {
                    if (item.label.includes(inputText) || item.name.includes(inputText)) result.push(item);
                    return result;
                }, []);
            }

            return res;
        };

        const valueHandler = (inputText, keyItem) => {
            const items = valueItems[keyItem.key];
            let res = items;
            if (inputText) {
                res = items.reduce((result, d) => {
                    if (d.includes(inputText)) result.push(d);
                    return result;
                }, []);
            }

            return res;
        };

        return {
            ...toRefs(state),
            onKeySelect(keyItem) {
                state.valueItems = valueHandler('', keyItem);
                action('key:select')(keyItem);
            },
            onSearch(query) {
                state.queries.push(query);
                action('search')(query);
            },
            onKeyInput(val) {
                state.keyItems = keyHandler(val);
                action('key:input')(val);
            },
            onValueInput(val, keyItem) {
                state.valueItems = valueHandler(val, keyItem);
                action('value:input')(val, keyItem);
            },
        };
    },
});
