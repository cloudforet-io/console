import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import {
    text, number, select, object, boolean, color,
} from '@storybook/addon-knobs/vue';
import ServiceSummary from '@/views/common/widgets/service-summary/ServiceSummary.vue';
import { getKnobProps } from '@sb/storybook-util';
import { serviceSummaryProps } from '@/views/common/widgets/service-summary/ServiceSummary.toolset';
import { fluentApi } from '@/lib/fluent-api';

export default {
    title: 'views/widgets/ServiceSummary',
    component: ServiceSummary,
    parameters: {
        info: {
            summary: '',
            components: { ServiceSummary },
        },
        knobs: { escapeHTML: false },
    },
};


export const defaultCase = () => ({
    components: { ServiceSummary },
    props: getKnobProps(serviceSummaryProps, {
        title: 'projects',
        api: fluentApi.statisticsTest().history().diff().setTopic('topic'),
    }, {
    }, {
        color,
    }),
    template: `
    <div style="width: 80vw;">
        <ServiceSummary v-bind="$props"></ServiceSummary>
    </div>`,
    setup(props, context) {
        const state = reactive({
        });

        return {
            ...toRefs(state),
        };
    },
});
