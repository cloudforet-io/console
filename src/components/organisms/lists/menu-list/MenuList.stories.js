import { object, select } from '@storybook/addon-knobs/vue';
import MenuList from './MenuList.vue';
import { action } from '@storybook/addon-actions';

export default {
    title: 'Organisms/menu-list',
    component: MenuList,
};

export const defaultCase = () => ({
    components: { 'p-menu-list': MenuList },
    props: {
        listItems: {
            default: object('list-items', [
                { contents: 'item1', indent: 0 },
                { contents: 'item2', indent: 1 },
                { contents: 'item3' },
            ]),
        },
        value: {
            default: select('v-model', [true, false], false),
        },
    },
    template: '<p-menu-list v-model="value" :list-items="listItems"  @show="show" @hide="hide" @change="change" />',
    methods: {
        show: action('show'),
        hide: action('hide'),
        change: action('change'),
    },
});
