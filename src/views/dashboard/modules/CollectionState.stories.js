import { toRefs, reactive } from '@vue/composition-api';
import CollectionState from '@/views/dashboard/modules/CollectionState';
import casual from '@/views/dashboard/models/dashboard-model';
import DashboardEventBus from '@/views/dashboard/DashboardEventBus';
import { mountBusEvent } from '@/lib/compostion-util';

export default {
    title: 'view/dashboard/collection-state',
    component: CollectionState,
};

export const mockPage = () => ({
    components: { CollectionState },
    template: '<CollectionState />',
    props: {

    },
    setup() {
        const state = reactive({
            data: {},
        });

        const listServerState = () => {
            setTimeout(() => {
                // state.data = casual.serverStates;
            }, 1000);
        };

        mountBusEvent(DashboardEventBus, 'listServerState', listServerState);

        return { ...toRefs(state) };
    },
});
