import Search from './Search.vue';
import { boolean } from '@storybook/addon-knobs/vue';

export default {
    title: 'molecules/search/search',
    component: Search,
    parameters: {
        info: {
            summary: '',
            components: { Search },
        },
    },
};
const actions = {

};
const data = {
    search: 'this is wrong',
};

export const search = () => ({
    components: { Search },
    template: `<div style="width: 80vw;">
    <search :searchText.sync="search" 
            :disabled="disabled"></search>
     <div> {{search}}</div>
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
