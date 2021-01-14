import { text, object } from '@storybook/addon-knobs';
import PWidgetLayout from '@/organisms/layouts/widget-layout/PWidgetLayout.vue';

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


export const widgetLayout = () => ({
    components: { PWidgetLayout },
    props: {
        title: {
            default: text('title', 'title'),
        },
        help: {
            default: text('help', 'help'),
        },
        titleStyle: {
            default: object('titleStyle', {}),
        },
        subTitle: {
            default: text('subTitle', ''),
        },
    },
    template: `
        <div style="width: 80vw;">
            <PWidgetLayout v-bind="$props"></PWidgetLayout>
        </div>`,
    setup() {
        return {
        };
    },
});
