import { withKnobs, text } from '@storybook/addon-knobs/vue';
import { toRefs, reactive } from '@vue/composition-api';
import { autoProps } from '../../../../.storybook/storybook-util';
import Summary from './Summary';
import { mountBusEvent } from '@/lib/compostion-util';
import DashboardEventBus from '@/views/dashboard/DashboardEventBus';
import casual from '@/views/dashboard/models/dashboard-model';


export default {
    title: 'view/dashboard/summary',
    component: Summary,
    decorators: [withKnobs],
};


export const defaultCase = () => ({
    components: { Summary },
    props: {
        ...autoProps(Summary),
    },
    template: `<div style="width: 100%;">
                    <button @click="refresh">refresh</button>
                    <Summary v-bind="$props" :data="summaryData"/>
                </div>`,
    setup() {
        const state = reactive({
            summaryData: {},
        });

        const listSummary = () => {
            setTimeout(() => {
                state.summaryData = casual.summary;
            }, 1000);
        };

        mountBusEvent(DashboardEventBus, 'listSummary', listSummary);

        const refresh = () => {
            listSummary();
        };

        return {
            ...toRefs(state),
            refresh,
        };
    },
});
