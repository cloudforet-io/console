import { toRefs, reactive } from '@vue/composition-api';
import ServerState from '@/views/dashboard/modules/ServerState';
import casual from '@/views/dashboard/models/dashboard-model';
import DashboardEventBus from '@/views/dashboard/DashboardEventBus';
import { mountBusEvent } from '@/lib/compostion-util';

export default {
    title: 'view/dashboard/server-state',
    component: ServerState,
};

export const mockPage = () => ({
    components: { ServerState },
    template: '<ServerState v-bind="$props" :data="data"/>',
    setup() {
        const state = reactive({
            data: {},
        });

        const listServerState = () => {
            setTimeout(() => {
                state.data = casual.serverStates;
            }, 1000);
        };

        mountBusEvent(DashboardEventBus, 'listServerState', listServerState);

        return { ...toRefs(state) };
    },
});
