<script>
import { toRefs } from '@vue/composition-api';
import DashboardTemplate, { setup } from '@/views/dashboard/Dashboard.template';
import DashboardEventBus from '@/views/dashboard/DashboardEventBus';
import casual from '@/views/dashboard/models/dashboard-model';
import { mountBusEvent } from '@/lib/compostion-util';

export default {
    name: 'Dashboard',
    extends: DashboardTemplate,
    setup(props, context) {
        const state = setup(props, context);

        // ResourcesByRegion
        const listRegionByServer = () => {
            setTimeout(() => {
                state.resourcesByRegionData.value = casual.resourcesByRegion;
            }, 1000);
        };
        const listRegionByCloudService = () => {
            setTimeout(() => {
                state.resourcesByRegionData.value = casual.resourcesByRegion;
            }, 1000);
        };

        mountBusEvent(DashboardEventBus, 'listRegionByServer', listRegionByServer);
        mountBusEvent(DashboardEventBus, 'listRegionByCloudService', listRegionByCloudService);

        // ServerState
        const listServerState = () => {
            setTimeout(() => {
                state.serverStateData.value = casual.serverStates;
            }, 1000);
        };

        mountBusEvent(DashboardEventBus, 'listServerState', listServerState);
        return { ...toRefs(state) };
    },
};
</script>
