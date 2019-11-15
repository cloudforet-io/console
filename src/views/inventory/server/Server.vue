
<script>
import { toRefs, computed } from '@vue/composition-api';
import ServerTemplate, { serverSetup, eventNames } from '@/views/inventory/server/Server.template';
import { arrayOf } from '@/lib/casual';
import casual from '@/views/inventory/server/models/server-model';
import serverEventBus from '@/views/inventory/server/ServerEventBus';
import { mountBusEvent } from '@/lib/compostion-util';


export default {
    name: 'Server',
    extends: ServerTemplate,
    setup(props, context) {
        const serverEventNames = eventNames;
        serverEventNames.getServerList = 'getServerData';
        serverEventNames.tagConfirmEvent = 'tagConfirmEvent';
        serverEventNames.tagResetEvent = 'resetTagEvent';

        const state = serverSetup(props, context, serverEventNames);
        const requestServerList = async () => {
            console.log(state.pageSize, state.thisPage);
            const res = await context.parent.$http.post('/inventory/server/list', {
                domain_id: sessionStorage.getItem('domainId'),
            });
            state.items = res.data.results;
            const allPage = res.data.total_count / state.pageSize;
            state.allPage = allPage < 1 ? 1 : allPage;
            state.selectIndex = [];
        };
        const tagConfirm = (tag) => {
            console.log(tag);
            setTimeout(() => {
                // 2초 후 작동해야할 코드
                serverEventBus.$emit(serverEventNames.tagResetEvent);
                console.log('force reset Tag!!!');
            }, 2000);
        };
        mountBusEvent(serverEventBus, serverEventNames.getServerList, requestServerList);
        mountBusEvent(serverEventBus, serverEventNames.tagConfirmEvent, tagConfirm);
        requestServerList();
        return {
            ...toRefs(state),
        };
    },
};
</script>
