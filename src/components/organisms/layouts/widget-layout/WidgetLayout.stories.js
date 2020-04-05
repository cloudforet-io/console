import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean,
} from '@storybook/addon-knobs/vue';
import { getKnobProps } from '@sb/storybook-util';
import { widgetLayoutProps } from '@/components/organisms/layouts/widget-layout/WidgetLayout.toolset';
import PWidgetLayout from './WidgetLayout.vue';

export default {
    title: 'orgaisms/layouts/WidgetLayout',
    component: PWidgetLayout,
    parameters: {
        info: {
            summary: '',
            components: { PWidgetLayout },
        },
        knobs: { escapeHTML: false },
    },
};


const getState = (props, context) => {
    const state = reactive({});

    return state;
};

export const defaultCase = () => ({
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
