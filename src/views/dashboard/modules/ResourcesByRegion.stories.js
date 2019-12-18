import { toRefs, reactive } from '@vue/composition-api';
import ResourcesByRegion from '@/views/dashboard/modules/ResourcesByRegion';
import casual from '@/views/dashboard/models/dashboard-model';
import DashboardEventBus from '@/views/dashboard/DashboardEventBus';
import { mountBusEvent } from '@/lib/compostion-util';

export default {
    title: 'view/dashboard/resources-by-region',
    component: ResourcesByRegion,
};

export const mockPage = () => ({
    components: { ResourcesByRegion },
    template: '<ResourcesByRegion v-bind="$props" :data="data" style="width: 500px;"/>',
    setup() {
        const state = reactive({
            data: {},
        });

        const listRegionByServer = () => {
            setTimeout(() => {
                state.data = casual.resourcesByRegion;
            }, 1000);
        };
        const listRegionByCloudService = () => {
            setTimeout(() => {
                state.data = casual.resourcesByRegion;
            }, 1000);
        };

        mountBusEvent(DashboardEventBus, 'listRegionByServer', listRegionByServer);
        mountBusEvent(DashboardEventBus, 'listRegionByCloudService', listRegionByCloudService);

        return { ...toRefs(state) };
    },
});
