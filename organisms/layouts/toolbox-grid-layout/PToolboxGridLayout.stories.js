import { ref } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PToolboxGridLayout from '@/components/organisms/layouts/toolbox-grid-layout/PToolboxGridLayout.vue';

export default {
    title: 'organisms/layouts/ToolboxGridLayout',
    component: PToolboxGridLayout,
    parameters: {
        info: {
            components: { PToolboxGridLayout },
        },
    },
};

const setup = (props, context) => {
    const changePageNumber = action('pageChangeNumber');
    const changePageSize = action('changePageSize');
    const clickRefresh = action('clickRefresh');

    return {
        changePageNumber,
        changePageSize,
        clickRefresh,
    };
};


export const defaultCase = () => ({
    components: { PToolboxGridLayout },
    props: {
        thisPage: {
            type: Number,
            default: 1,
        },
        pageSize: {
            type: Number,
            default: 15,
        },
    },
    template: `<PToolboxGridLayout
                v-bind="$props"
                :allPage="allPage"
                :thisPage.sync="thisPage"
                :pageSize.sync="pageSize"
                @changePageNumber="changePageNumber"
                @changePageSize="changePageSize"
                @clickRefresh="clickRefresh"
    >
    </PToolboxGridLayout>`,
    setup(props, context) {
        return setup(props, context);
    },
});
