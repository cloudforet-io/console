import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { getKnobProps } from '@sb/storybook-util';
import PWidgetLayout from '@/components/organisms/layouts/widget-layout/PWidgetLayout.vue';

const widgetLayoutProps = {
    title: {
        type: String,
        default: '',
    },
    help: {
        type: String,
        default: '',
    },
    titleStyle: {
        type: Object,
        default: () => ({}),
    },
    subTitle: {
        type: String,
        default: '',
    },
};
export default {
    title: 'Layouts/WidgetLayout',
    component: PWidgetLayout,
    parameters: {
        info: {
            summary: '',
            components: { PWidgetLayout },
        },
        knobs: { escapeHTML: false },
    },
};


const getState = () => {
    const state = reactive({});

    return state;
};

export const widgetLayout = () => ({
    components: { PWidgetLayout },
    props: getKnobProps(widgetLayoutProps, {
        title: 'title',
        help: 'help',
    }),
    template: `
    <div style="width: 80vw;">
        <PWidgetLayout v-bind="$props"></PWidgetLayout>
    </div>`,
    setup(props, context) {
        const state = getState(props, context);

        return {
            ...toRefs(state),
        };
    },
});
