import { number } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import PPagination from '@/organisms/paginations/pagination/PPagination.vue';
import { reactive, toRefs } from '@vue/composition-api';

export default {
    title: 'Navigation/Paginations/Pagination',
    component: PPagination,
    parameters: {
        info: {
            summary: '',
            components: { PPagination },
        },
    },
};
const actions = {
    prevPage: action('click-prev'),
    nextPage: action('click-next'),
    clickPage: action('click-page'),
};

export const pagination = () => ({
    components: { PPagination },
    template: `<p-pagination :this-page.sync="thisPage" :page-size.sync="pageSize"
                             :total-count="totalCount" />`,
    props: {
        allPage: {
            default: number('allPage', 10, { min: 1 }),
        },
        totalCount: {
            default: number('totalCount', 100, { min: 1 }),
        },
    },
    setup(props, context) {
        const state = reactive({
            thisPage: 1,
            pageSize: 15,
        });

        return {
            ...toRefs(state),
            ...actions,
        };
    },
});
