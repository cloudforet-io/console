import {
    computed, onMounted, reactive, toRefs,
} from '@vue/composition-api';
import PServerData from '@/views/inventory/server/modules/ServerData';
import { arrayOf } from '@/lib/casual';
import casual from '@/views/inventory/server/models/server-model';
import ServerEventBus from '@/views/inventory/server/ServerEventBus';
import { mountBusEvent } from '@/lib/compostion-util';

export default {
    title: 'view/inventory/server/modules/data',
    component: PServerData,
    parameters: {
        info: {
            summary: '',
            components: { PServerData },
        },
    },
};

export const serverData = () => ({
    components: { PServerData },
    template: `
<div style="width: 60vw">
<PServerData
    server_id="asd"
    :items="state.items"
    :sortBy.sync="state.sortBy"
    :sortDesc.sync="state.sortDesc"
    :pageSize.sync="state.pageSize"
    :allPage="state.allPage"
    :thisPage.sync="state.thisPage"
    :getServerSubData="state.getServerSubData"
>
</PServerData>
</div>`,
    setup() {
        const state = reactive({
            items: [],
            sortBy: '',
            sortDesc: true,
            pageSize: 15,
            allPage: 1,
            thisPage: 1,
            getServerSubData: 'subdata', // event name
        });
        const getSubDate = (serverId, name) => {
            const mock = {
                disk: casual._disk,
                nic: casual._nic,
                security_group: casual._security_group_rule,
            };
            state.items = arrayOf(state.pageSize, mock[name]);
        };
        mountBusEvent(ServerEventBus, state.getServerSubData, getSubDate);
        onMounted(() => {
            getSubDate('aa','disk');
        });


        return {
            state,
        };
    },

});
