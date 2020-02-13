import {
    toRefs, reactive, ref, computed,
} from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import PCollectorSchedules from './CollectorSchedules.vue';
import casual from '@/views/inventory/collector/models/collector-model';
import { mountBusEvent } from '@/lib/compostion-util';
import collectorEventBus from '@/views/inventory/collector/CollectorEventBus';

export default {
    title: 'views/inventory/collector/modules/CollectorSchedules',
    component: PCollectorSchedules,
    parameters: {
        info: {
            summary: '',
            components: { PCollectorSchedules },
        },
    },
};

const getState = (props, context) => {
    const state = reactive({
        collector: casual.collector,
    });

    return state;
};

export const defaultCase = () => ({
    components: { PCollectorSchedules },
    template: `<p-collector-schedules
                    :collector="collector"
                ></p-collector-schedules>`,
    setup(props, context) {
        const state = getState(props, context);


        return {
            ...toRefs(state),
        };
    },
});
