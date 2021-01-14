import { toRefs, reactive } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, boolean,
} from '@storybook/addon-knobs';
import casual, { arrayOf } from '@/util/casual';
import PAutocompleteSearch from '@/organisms/search/autocomplete-search/PAutocompleteSearch.vue';
import PRawData from '@/organisms/raw-data/PRawData.vue';
import Fuse from 'fuse.js';


function plainAutocompleteHandler(inputText, list, key) {
    let res = list;
    if (inputText.trim()) {
        const options = { keys: [] as any };
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
        info: {
            summary: '',
            components: { PAutocompleteSearch },
        },
        knobs: { escapeHTML: false },
    },
};

const actions = {
    'focus-menu': action('focus-menu'),
    input: action('input'),
    'select-menu': action('select-menu'),
    'hide-menu': action('hide-menu'),
    search: action('search'),
};


export const autoCompleteSearch = () => ({
    components: { PAutocompleteSearch, PRawData },
    props: {
        placeholder: {
            default: text('placeholder', 'Search'),
        },
        disableIcon: {
            default: boolean('disableIcon', false),
        },
        loading: {
            default: boolean('loading', false),
        },
    },
    template: `
        <div style="width: 80vw;">
            <p-autocomplete-search v-model="value" 
                                   v-bind="$props" 
                                   :menu="menu" 
                                   @search="search" 
                                   @select-menu="search" 
                                   @input="input" 
                                   v-on="actions" 
                                   class="mt-10"
            >
                
            </p-autocomplete-search>
            <div class="mt-8 bg-blue-100 flex w-full">
                <div class="w-1/2 p-4">
                    <p>Data</p>
                    <p-raw-data :item="data"
                                class="w-full"
                    />
                </div>
                <div class="ml-8 w-1/2 p-4">
                    <p>Menu</p>
                    <p-raw-data :item="menu"
                                class="w-full"
                    />
                </div>
            </div>
        </div>`,
    setup(props, context) {
        const data = arrayOf(10, () => ({ name: casual.name, phone: casual.phone }));

        const state = reactive({
            value: '',
            menu: plainAutocompleteHandler('', data, 'name'),
        });

        return {
            ...toRefs(state),
            data,
            actions,
            search: action('search'),
            input(val) {
                action('input')(val);
                state.menu = plainAutocompleteHandler(val, data, 'name');
            },
        };
    },
});


export const usingHandler = () => ({
    components: { PAutocompleteSearch, PRawData },
    props: {
        placeholder: {
            default: text('placeholder', 'Search'),
        },
        disableIcon: {
            default: boolean('disableIcon', false),
        },
        loading: {
            default: boolean('loading', false),
        },
    },
    template: `
        <div style="width: 80vw;">
            <p-autocomplete-search v-bind="$props" 
                                   :handler="handler" 
                                   v-on="actions" 
                                   class="mt-10"
            >
                
            </p-autocomplete-search>
            <div class="mt-8 bg-blue-100 flex w-full">
                <div class="w-1/2 p-4">
                    <p>Data</p>
                    <p-raw-data :item="data"
                                class="w-full"
                    />
                </div>
<!--                <div class="ml-8 w-1/2 p-4">-->
<!--                    <p>Menu</p>-->
<!--                    <p-raw-data :item="menu"-->
<!--                                class="w-full"-->
<!--                    />-->
<!--                </div>-->
            </div>
        </div>`,
    setup(props, context) {
        const data = arrayOf(10, () => ({ name: casual.name, phone: casual.phone }));

        return {
            data,
            handler(val) {
                const items = plainAutocompleteHandler(val, data, 'name');
                return {
                    results: items,
                    totalCount: items.length,
                };
            },
            actions,
        };
    },
});

export const controlMenuVisibilityAndFocus = () => ({
    components: { PAutocompleteSearch, PRawData },
    props: {
        placeholder: {
            default: text('placeholder', 'Search'),
        },
        disableIcon: {
            default: boolean('disableIcon', false),
        },
        loading: {
            default: boolean('loading', false),
        },
    },
    template: `
        <div style="width: 80vw;">
            <p class="my-8 font-bold capitalize">Control menu visibility and focus</p>
            <p-autocomplete-search v-model="value" 
                                   v-bind="$props" 
                                   :menu="menu" 
                                   :visibleMenu.sync="visibleMenu"
                                   :isFocused.sync="isFocused"
                                   @search="search" 
                                   @input="input" 
                                   @mousedown.stop="mousedown" 
                                   @hide-menu="onMenuHide" 
                                   v-on="actions" 
                                   class="mt-10"
            >
    
            </p-autocomplete-search>
            <div class="mt-8 bg-blue-100 flex w-full">
                <div class="w-1/2 p-4">
                    <p>Data</p>
                    <p-raw-data :item="data"
                                class="w-full"
                    />
                </div>
                <div class="ml-8 w-1/2 p-4">
                    <p>Menu</p>
                    <p-raw-data :item="menu"
                                class="w-full"
                    />
                </div>
            </div>
        </div>`,
    setup(props, context) {
        const state = reactive({
            value: 'test',
            menu: [{ type: null, label: null }],
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
            },
            input(val) {
                state.visibleMenu = true;
                state.menu = plainAutocompleteHandler(val, data, 'name');
            },
            mousedown(e) {
                state.visibleMenu = true;
            },
            onMenuHide(e) {
                state.visibleMenu = false;
            },
            actions,
        };
    },
});
