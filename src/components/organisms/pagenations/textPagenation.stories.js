import { number } from '@storybook/addon-knobs/vue';
import { action } from '@storybook/addon-actions';
import PTextPagenation from './textPagenation';

export default {
    title: 'organisms/pagenations',
    component: PTextPagenation,
    parameters: {
        info: {
            summary: '',
            components: { PTextPagenation },
        },
    },
};
const actions = {
    pageChange: action('pageChange'),
};

export const base = () => ({
    components: { PTextPagenation },
    template: '<p-text-pagenation :thisPage.sync="thisPage" :allPage="allPage" @pageChange="pageChange"/>',
    data() {
        return {
            thisPage: 1,
        };
    },
    props: {
        allPage: {
            default: number('allPage', 10, { min: 1, max: 20 }),
        },
    },
    methods: {
        ...actions,
    },
});

export const autoDisabledButton = () => ({
    components: { PTextPagenation },
    template: '<p-text-pagenation :thisPage.sync="thisPage" :allPage="allPage" @pageChange="pageChange"/>',
    data() {
        return {
            allPage: 10,
            thisPage: 10,
        };
    },
    methods: {
        ...actions,
    },
});
