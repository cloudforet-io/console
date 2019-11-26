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
        const api = context.root.$http;
        const baseParam = { domain_id: sessionStorage.getItem('domainId') };

        // Summary
        const listSummary = async () => {
            const res = await api.post('/statistics/summary', {
                ...baseParam,
            });
            state.summaryData.value = res.data;
        };

        mountBusEvent(DashboardEventBus, 'listSummary', listSummary);

        // Resources By Region
        const listRegionByServer = async () => {
            setTimeout(() => {
                state.resourcesByRegionData.value = casual.resourcesByRegion;
            }, 1000);
            // const res = await api.post('/statistics/summary', {
            //     ...baseParam,
            //     item_type: 'server',
            // });
            // state.resourcesByRegionData.value = res.data;
        };
        const listRegionByCloudService = () => {
            setTimeout(() => {
                state.resourcesByRegionData.value = casual.resourcesByRegion;
            }, 1000);
        };

        mountBusEvent(DashboardEventBus, 'listRegionByServer', listRegionByServer);
        mountBusEvent(DashboardEventBus, 'listRegionByCloudService', listRegionByCloudService);

        // Server State
        const listServerState = async () => {
            const res = await api.post('/statistics/server-state', {
                ...baseParam,
            });
            state.serverStateData.value = res.data;
        };

        mountBusEvent(DashboardEventBus, 'listServerState', listServerState);

        // Servers by Type
        const listServerType = async () => {
            const res = await api.post('/statistics/server-type', {
                ...baseParam,
                item_type: 'server_type',
            });
            state.serverTypeData.value = res.data;
        };
        mountBusEvent(DashboardEventBus, 'listServerType', listServerType);

        const listVmType = async () => {
            const res = await api.post('/statistics/server-type', {
                ...baseParam,
                item_type: 'vm_type',
            });
            state.vmTypeData.value = res.data;
        };
        mountBusEvent(DashboardEventBus, 'listServerType', listVmType);

        const listOsType = async () => {
            const res = await api.post('/statistics/server-type', {
                ...baseParam,
                item_type: 'os_type',
            });
            state.osTypeData.value = res.data;
        };
        mountBusEvent(DashboardEventBus, 'listOsType', listOsType);

        const listHypervisorType = async () => {
            const res = await api.post('/statistics/server-type', {
                ...baseParam,
                item_type: 'hypervisor_type',
            });
            state.hypervisorTypeData.value = res.data;
        };
        mountBusEvent(DashboardEventBus, 'listHypervisorType', listHypervisorType);

        return { ...toRefs(state) };
    },
};
</script>
