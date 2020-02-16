<script>
import { toRefs } from '@vue/composition-api';
import DashboardTemplate, { setup } from '@/views/dashboard/Dashboard.template.vue';
import DashboardEventBus from '@/views/dashboard/DashboardEventBus';
import { mountBusEvent } from '@/lib/compostion-util';

export default {
    name: 'Dashboard',
    extends: DashboardTemplate,
    setup(props, context) {
        const state = setup(props, context);
        const api = context.root.$http;

        const callApi = (url, target, params) => async () => {
            const res = await api.post(url, params);
            state[target] = res.data;
        };

        const resourcesByRegionCallApi = (url, params) => async () => {
            state.resourcesByRegionLoading = true;
            const res = await api.post(url, params);
            state.resourcesByRegionData = res.data;
            state.resourcesByRegionLoading = false;
        };

        // Summary
        mountBusEvent(DashboardEventBus, 'listSummary', callApi('/statistics/summary', 'summaryData'));

        // Resources By Region
        mountBusEvent(DashboardEventBus, 'listRegionByServer',
            resourcesByRegionCallApi('/statistics/datacenter-items', {
                item_type: 'server',
            }));
        mountBusEvent(DashboardEventBus, 'listRegionByCloudService',
            resourcesByRegionCallApi('/statistics/datacenter-items', {
                item_type: 'cloud_service',
            }));

        // Server State
        mountBusEvent(DashboardEventBus, 'listServerState', callApi('/statistics/server-state', 'serverStateData'));

        // Servers by Type
        mountBusEvent(DashboardEventBus, 'listServerType', callApi('/statistics/server-type', 'serverTypeData', { item_type: 'server_type' }));
        mountBusEvent(DashboardEventBus, 'listVmType', callApi('/statistics/server-type', 'vmTypeData', { item_type: 'vm_type' }));
        mountBusEvent(DashboardEventBus, 'listOsType', callApi('/statistics/server-type', 'osTypeData', { item_type: 'os_type' }));
        mountBusEvent(DashboardEventBus, 'listHypervisorType', callApi('/statistics/server-type', 'hypervisorTypeData', { item_type: 'hypervisor_type' }));

        return { ...toRefs(state) };
    },
};
</script>
