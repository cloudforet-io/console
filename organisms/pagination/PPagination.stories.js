import { number } from '@storybook/addon-knobs/vue';
import { action } from '@storybook/addon-actions';
import PBottomPagination from '@/components/organisms/pagination/PPagination.vue';
import { reactive, toRefs } from '@vue/composition-api';

export default {
    title: 'organisms/bottom-pagination',
    component: PBottomPagination,
    parameters: {
        info: {
            summary: '',
            components: { PBottomPagination },
        },
    },
};
const actions = {
    updatePage: action('pageChange'),
    clickPage: action('clickPage'),
};

export const base = () => ({
    components: { PBottomPagination },
    template: '<p-bottom-pagination :thisPage.sync="thisPage" :allPage="allPage" @updatePage="updatePage" @clickPage="clickPage"/>',
    props: {
        allPage: {
            default: number('allPage', 10, { min: 1 }),
        },
    },
    methods: {
        ...actions,
    },
    setup(props, context) {
        const state = reactive({
            thisPage: 1,
        });

        const updatePage = (pageStart, allPage) => {
            console.debug(pageStart, allPage);
            state.thisPage = allPage + 1;
        };

        return {
            ...toRefs(state),
            updatePage,
        };
    },
});

export const autoDisabledButton = () => ({
    components: { PBottomPagination },
    template: '<p-bottom-pagination :thisPage.sync="thisPage" :allPage="allPage" @pageChange="pageChange"/>',
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
