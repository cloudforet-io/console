import { number } from '@storybook/addon-knobs/vue';
import { action } from '@storybook/addon-actions';
import PTextPagination from '@/components/organisms/paginations/text-pagination/PTextPagination.vue';

export default {
    title: 'Navigation/Paginations/TextPagination',
    component: PTextPagination,
    parameters: {
        info: {
            summary: '',
            components: { PTextPagination },
        },
    },
};
const actions = {
    pageChange: action('pageChange'),
};

export const textPagination = () => ({
    components: { PTextPagination },
    template: '<p-text-pagination :thisPage.sync="thisPage" :allPage="allPage" @pageChange="pageChange"/>',
    props: {
        allPage: {
            default: number('allPage', 10, { min: 1, max: 20 }),
        },
    },
    setup() {
        return {
            thisPage: 1,
            ...actions,
        };
    },
});

export const autoDisabledButton = () => ({
    components: { PTextPagination },
    template: '<p-text-pagination :thisPage.sync="thisPage" :allPage="allPage" @pageChange="pageChange"/>',
    setup() {
        return {
            allPage: 10,
            thisPage: 10,
            ...actions,
        };
    },
});
