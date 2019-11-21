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

        // Resources By Region
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

        // Server State
        const listServerState = () => {
            setTimeout(() => {
                state.serverStateData.value = casual.serverStates;
            }, 1000);
        };

        mountBusEvent(DashboardEventBus, 'listServerState', listServerState);

        // Servers by Type
        const listServerType = () => {
            setTimeout(() => {
                state.serverTypeData.value = casual.serverType;
            }, 1000);
        };
        mountBusEvent(DashboardEventBus, 'listServerType', listServerType);

        const listVmType = () => {
            setTimeout(() => {
                state.vmTypeData.value = casual.vmType;
            }, 1000);
        };
        mountBusEvent(DashboardEventBus, 'listServerType', listVmType);

        const listOsType = () => {
            setTimeout(() => {
                state.osTypeData.value = casual.osType;
            }, 1000);
        };
        mountBusEvent(DashboardEventBus, 'listOsType', listOsType);

        const listHypervisorType = () => {
            setTimeout(() => {
                state.hypervisorTypeData.value = casual.hypervisorType;
            }, 1000);
        };
        mountBusEvent(DashboardEventBus, 'listHypervisorType', listHypervisorType);

        return { ...toRefs(state) };
    },
};
</script>
