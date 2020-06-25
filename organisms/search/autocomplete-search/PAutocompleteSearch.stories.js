import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import PAutocompleteSearch from './PAutocompleteSearch.vue';
import { autocompleteSearchProps, plainAutocompleteHandler } from './PAutocompleteSearch.toolset';
import casual, { arrayOf } from '../../../../lib/casual';

export default {
    title: 'organisms/search/AutocompleteSearch',
    component: PAutocompleteSearch,
    parameters: {
        info: {
            summary: '',
            components: { PAutocompleteSearch },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { PAutocompleteSearch },
    props: getKnobProps(autocompleteSearchProps, {
    }, {
        menu: true,
        searchFocused: true,
        visibleMenu: true,
        searchText: true,
    }),
    template: `
    <div style="width: 80vw;">
        <PAutocompleteSearch v-model="searchText" 
                             v-bind="$props"
                             :menu="menu"
                             @search="search"
                             @input="input"
                             class="mt-10"
        >
            
        </PAutocompleteSearch>
        <div class="mt-8 bg-blue-100 flex w-full">
            <div>
                <p>Data</p>
                <pre>{{data}}</pre>
            </div>
            <div class="ml-8">
                <p>Menu</p>
                <pre>{{menu}}</pre>
            </div>
        </div>
    </div>`,
    setup(props, context) {
        const state = reactive({
            searchText: 'test',
            menu: [],
        });

        const data = arrayOf(10, () => ({ name: casual.name, phone: casual.phone }));

        return {
            ...toRefs(state),
            data,
            search: action('search'),
            input(val) {
                action('input')(val);
                state.menu = plainAutocompleteHandler(val, data, 'name');
            },
        };
    },
});
