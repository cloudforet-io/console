
<script>
import { toRefs, computed, reactive } from '@vue/composition-api';
import ServerTemplate, { serverSetup, eventNames } from '@/views/inventory/server/Server.template';
import serverEventBus from '@/views/inventory/server/ServerEventBus';
import { mountBusEvent } from '@/lib/compostion-util';
import { defaultQuery } from '@/lib/api';


export default {
    name: 'Server',
    extends: ServerTemplate,
    setup(props, context) {
        const serverEventNames = eventNames;
        serverEventNames.getServerList = 'getServerData';
        serverEventNames.tagConfirmEvent = 'ServerTagConfirmEvent';
        serverEventNames.tagResetEvent = 'resetTagEvent';
        serverEventNames.getServerSubData = 'requestSubData';
        serverEventNames.getServerAdmin = 'requestAdmin';

        const state = serverSetup(props, context, serverEventNames);


        // request server list
        const requestState = reactive({
            query: computed(() => (defaultQuery(
                state.thisPage, state.pageSize,
                state.sortBy, state.sortDesc,
            ))),
        });
        const requestServerList = async () => {
            const res = await context.parent.$http.post('/inventory/server/list', {
                query: requestState.query,
            });
            state.items = res.data.results;
            const allPage = Math.ceil(res.data.total_count / state.pageSize);
            state.allPage = allPage || 1;
            state.selectIndex = [];
        };

        // request server sub data
        const requestSubDataState = reactive({
            query: computed(() => (defaultQuery(
                state.subData.thisPage, state.subData.pageSize,
                state.subData.sortBy, state.subData.sortDesc,
            ))),
        });
        const requestServerSubData = async (serverId, name) => {
            const res = await context.parent.$http.post('/inventory/server/get-data', {
                query: requestSubDataState.query,
                data_type: name,
                server_id: serverId,
            });
            console.log(res.data);
            state.subData.items = res.data.results;
            const allPage = Math.ceil(res.data.total_count / state.subData.pageSize);
            state.subData.allPage = allPage || 1;
        };

        // change tag
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

        // get server admin data
        const requestAdminState = reactive({
            query: computed(() => (defaultQuery(
                state.admin.thisPage, state.admin.pageSize,
                state.admin.sortBy, state.admin.sortDesc,
            ))),
        });

        const getSelectServerIDs = computed(() => {
            const ids = [];
            state.selectIndex.forEach((idx) => {
                ids.push(state.items[idx].server_id);
            });
            return ids;
        });

        const requestServerAdmin = async () => {
            const res = await context.parent.$http.post('/inventory/server/member/list', {
                query: requestAdminState.query,
                servers: getSelectServerIDs.value,
            });
            console.log(res.data);
            state.subData.items = res.data.results;
            const allPage = Math.ceil(res.data.total_count / state.subData.pageSize);
            state.subData.allPage = allPage || 1;
        };
        mountBusEvent(serverEventBus, serverEventNames.getServerList, requestServerList);
        mountBusEvent(serverEventBus, serverEventNames.tagConfirmEvent, ServerTagConfirm);
        mountBusEvent(serverEventBus, serverEventNames.getServerSubData, requestServerSubData);
        mountBusEvent(serverEventBus, serverEventNames.getServerAdmin, requestServerAdmin);

        requestServerList();
        return {
            ...toRefs(state),
        };
    },
};
</script>
