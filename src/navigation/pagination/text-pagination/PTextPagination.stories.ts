import { number, withKnobs } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import PTextPagination from '@/navigation/pagination/text-pagination/PTextPagination.vue';

export default {
    title: 'Navigation/Pagination',
    component: PTextPagination,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5894%3A178955',
        },
    },
};
const actions = {
    pageChange: action('pageChange'),
};

export const simple = () => ({
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

export const simpleAutoDisabled = () => ({
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
