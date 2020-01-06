import { boolean } from '@storybook/addon-knobs/vue';
import { action } from '@storybook/addon-actions';
import Search from './Search.vue';

export default {
    title: 'molecules/search',
    component: Search,
    parameters: {
        info: {
            summary: '',
            components: { Search },
        },
    },
};
const actions = {
    onSearch: action('onSearch'),
};
const data = {
    search: 'This is Search Text',
};

export const defaultCase = () => ({
    components: { Search },
    template: `<div style="width: 80vw;">
                    <search :searchText.sync="search"  :disabled="disabled" @onSearch="onSearch"/>
                    <br>
                    <div> Search Text: {{search}}</div>
                </div>`,
    props: {
        disabled: {
            default: boolean('disabled', false),
        },
    },
    methods: {
        ...actions,
    },
    data() {
        return {
            ...data,
        };
    },
});
export const focusSync = () => ({
    components: { Search },
    template: `<div style="width: 80vw;">
                    <search :searchText.sync="search" :focused.sync="focused" :disabled="disabled" @onSearch="onSearch"/>
                    <br>
                    <div> Search Text: {{search}}</div>
        <div><input type="checkbox" v-model="focused"><label>focuse 여부</label></div>
        <p>not support force focus out</p>
                </div>`,
    props: {
        disabled: {
            default: boolean('disabled', false),
        },
    },
    methods: {
        ...actions,
    },
    data() {
        return {
            ...data,
            focused: false,
        };
    },
});
