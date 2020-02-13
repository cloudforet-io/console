import { toRefs, reactive } from '@vue/composition-api';
import ServersByType from '@/views/dashboard/modules/ServersByType';
import casual from '@/views/dashboard/models/dashboard-model';
import DashboardEventBus from '@/views/dashboard/DashboardEventBus';
import { mountBusEvent } from '@/lib/compostion-util';

export default {
    title: 'views/dashboard/servers-by-type',
    component: ServersByType,
};

export const mockPage = () => ({
    components: { ServersByType },
    template: `<div>
                <button @click="refresh">refresh</button>
                <div style="width: 100%;">
                    <ServersByType v-bind="$props" 
                        :serverData="serverTypeData"
                        :vmData="vmData"
                        :osData="osData"
                        :hypervisorData="hypervisorData"
                    />
                </div>
               </div>`,
    setup() {
        const state = reactive({
            serverTypeData: {},
            vmData: {},
            osData: {},
            hypervisorData: {},
        });

        const listServerType = () => {
            setTimeout(() => {
                state.serverTypeData = casual.serverType;
            }, 1000);
        };
        mountBusEvent(DashboardEventBus, 'listServerType', listServerType);

        const listVmType = () => {
            setTimeout(() => {
                state.vmData = casual.vmType;
            }, 1000);
        };
        mountBusEvent(DashboardEventBus, 'listServerType', listVmType);

        const listOsType = () => {
            setTimeout(() => {
                state.osData = casual.osType;
            }, 1000);
        };
        mountBusEvent(DashboardEventBus, 'listOsType', listOsType);

        const listHypervisorType = () => {
            setTimeout(() => {
                state.hypervisorData = casual.hypervisorType;
            }, 1000);
        };
        mountBusEvent(DashboardEventBus, 'listHypervisorType', listHypervisorType);

        const refresh = () => {
            listServerType();
            listVmType();
            listOsType();
            listHypervisorType();
        };

        return {
            ...toRefs(state),
            refresh,
        };
    },
});
