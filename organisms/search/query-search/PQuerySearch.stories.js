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
import { querySearchProps, keyHandler, plainStringHandler } from './PQuerySearch.toolset';
import { OPERATOR_MAP } from '../../../../lib/api/query';
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


export const defaultCase = () => ({
    components: { PQuerySearch },
    props: getKnobProps(querySearchProps, {
    }, {
        value: true,
        contextItems: true,
        items: true,
    }),
    template: `
    <div style="width: 80vw;">
        <PQuerySearch v-bind="$props"
                      v-model="value"
                      :contextItems="contextItems"
                      :items="items"
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
            contextItems: keyItems,
            items: [],
            queries: [],
        });


        const valueItems = {
            project_id: arrayOf(10, () => casual.make_id('project')),
            name: arrayOf(10, () => casual.word),
            project_group_id: arrayOf(10, () => casual.make_id('pg')),
        };

        return {
            ...toRefs(state),
            onKeySelect(keyItem) {
                state.items = valueItems[keyItem.name];
                action('key:select')(keyItem);
            },
            onSearch(query) {
                state.queries.push(query);
                action('search')(query);
            },
            onKeyInput(val) {
                state.contextItems = keyHandler(val, keyItems);
                action('key:input')(val);
            },
            onValueInput(val, keyItem) {
                state.items = plainStringHandler(val, valueItems[keyItem.name]);
                action('value:input')(val, keyItem);
            },
        };
    },
});
