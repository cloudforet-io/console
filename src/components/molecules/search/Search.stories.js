import Search from './Search.vue';
import { boolean } from '@storybook/addon-knobs/vue';

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

};
const data = {
    search: 'This is Search Text',
};

export const search = () => ({
    components: { Search },
    template: `<div style="width: 80vw;">
                    <search :searchText.sync="search" :disabled="disabled"/>
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
