
<script>
import { toRefs, computed, reactive } from '@vue/composition-api';
import ServerTemplate, { serverSetup, eventNames } from '@/views/inventory/server/Server.template';
import serverEventBus from '@/views/inventory/server/ServerEventBus';
import { mountBusEvent } from '@/lib/compostion-util';


export default {
    name: 'Server',
    extends: ServerTemplate,
    setup(props, context) {
        const serverEventNames = eventNames;
        serverEventNames.getServerList = 'getServerData';
        serverEventNames.tagConfirmEvent = 'ServerTagConfirmEvent';
        serverEventNames.tagResetEvent = 'resetTagEvent';

        const state = serverSetup(props, context, serverEventNames);
        const resetTableState = () => {
            state.selectIndex = [];
            state.sortBy = '';
            state.sortDesc = true;
        };
        const requestState = reactive({
            query: computed(() => ({
                page: {
                    start: ((state.thisPage - 1) * state.pageSize) + 1,
                    limit: state.pageSize,
                },
            })),
        });
        const requestServerList = async () => {
            const res = await context.parent.$http.post('/inventory/server/list', {
                domain_id: sessionStorage.getItem('domainId'),
                query: requestState.query,
            });
            state.items = res.data.results;
            debugger;
            const allPage = Math.ceil(res.data.total_count / state.pageSize);
            state.allPage = allPage || 1;
            resetTableState();
        };


        const ServerTagConfirm = async (serverId, tags, originTags) => {
            const idx = state.selectIndex[0];
            try {
                const res = await context.parent.$http.post('/inventory/server/update', {
                    server_id: serverId,
                    tags,
                });
                state.items[idx].tags = tags;
                console.log(res);
            } catch (e) {
                serverEventBus.$emit(serverEventNames.tagResetEvent);
                state.items[idx].tags = originTags;
                console.error(e);
            }
        };
        mountBusEvent(serverEventBus, serverEventNames.getServerList, requestServerList);
        mountBusEvent(serverEventBus, serverEventNames.tagConfirmEvent, ServerTagConfirm);
        requestServerList();
        return {
            ...toRefs(state),
        };
    },
};
</script>
