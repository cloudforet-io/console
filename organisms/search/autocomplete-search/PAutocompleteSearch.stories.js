import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import { getKnobProps } from '@sb/storybook-util';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import casual, { arrayOf } from '@/components/util/casual';
import md from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.md';
import PAutocompleteSearch from '@/components/organisms/search/autocomplete-search/PAutocompleteSearch.vue';
import Fuse from 'fuse.js';


const autocompleteSearchProps = {
    value: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: 'Search',
    },
    focused: {
        type: Boolean,
        default: false,
    },
    disableIcon: {
        type: Boolean,
        default: false,
    },
    menu: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    visibleMenu: {
        type: Boolean,
        default: undefined,
    },
    isFocused: {
        type: Boolean,
        default: undefined,
    },
    handler: {
        type: Function,
        default: null,
    },
};

function plainAutocompleteHandler(inputText, list, key) {
    let res = list;
    if (inputText.trim()) {
        const options = {};
        if (key) options.keys = [key];
        const fuse = new Fuse(list, options);
        res = fuse.search(inputText);
    }

    // @ts-ignore
    return res.map((d) => {
        const value = key ? d[key] : d;
        return {
            type: 'item',
            label: value,
            name: value,
        };
    });
}

export default {
    title: 'Inputs/Search/AutoCompleteSearch',
    component: PAutocompleteSearch,
    parameters: {
        notes: md,
        info: {
            summary: md,
            components: { PAutocompleteSearch },
        },
        knobs: { escapeHTML: false },
    },
};


export const autoCompleteSearch = () => ({
    components: { PAutocompleteSearch },
    props: getKnobProps(autocompleteSearchProps, {
    }, {
        menu: true,
        value: true,
        visibleMenu: true,
        isFocused: true,
    }),
    template: `
        <div style="width: 80vw;">
            <PAutocompleteSearch v-model="value" 
                                 v-bind="$props"
                                 :menu="menu"
                                 @search="search"
                                 @menu:select="search"
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
            value: '',
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


export const controlCase = () => ({
    components: { PAutocompleteSearch },
    props: getKnobProps(autocompleteSearchProps, {
    }, {
        menu: true,
        value: true,
        visibleMenu: true,
        isFocused: true,
        focused: true,
    }),
    template: `
        <div style="width: 80vw;">
            <p class="my-8 font-bold capitalize">Control menu visibility and focus</p>
            <PAutocompleteSearch v-model="value"
                                 v-bind="$props"
                                 :menu="menu"
                                 :visibleMenu.sync="visibleMenu"
                                 :isFocused.sync="isFocused"
                                 @search="search"
                                 @menu:select="search"
                                 @input="input"
                                 @mousedown.stop="mousedown"
                                 @menu:hide="onMenuHide"
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
            value: 'test',
            menu: [],
            visibleMenu: false,
            isFocused: true,
        });

        const data = arrayOf(10, () => ({ name: casual.name, phone: casual.phone }));

        return {
            ...toRefs(state),
            data,
            search: (val) => {
                if (state.visibleMenu) {
                    const isExist = state.menu.some(d => d.type === 'item' && d.label === val);
                    if (isExist) {
                        state.visibleMenu = false;
                        state.isFocused = false;
                    }
                }
                action('search')(val);
            },
            input(val) {
                action('input')(val);
                state.visibleMenu = true;
                state.menu = plainAutocompleteHandler(val, data, 'name');
            },
            mousedown(e) {
                action('mousedown')(e);
                state.visibleMenu = true;
            },
            onMenuHide(e) {
                action('menu:hide')(e);
                state.visibleMenu = false;
            },
        };
    },
});
