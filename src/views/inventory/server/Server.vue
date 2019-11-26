
<script>
import {
    ref, toRefs, computed, reactive,
} from '@vue/composition-api';
import ServerTemplate, { serverSetup, eventNames } from '@/views/inventory/server/Server.template';
import serverEventBus from '@/views/inventory/server/ServerEventBus';
import { mountBusEvent } from '@/lib/compostion-util';
import { defaultQuery } from '@/lib/api';
import { isEmpty } from '@/lib/util';


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
        const projectNameList = ref({});
        const matchProject = (items) => {
            for (let i = 0; i < items.length; i++) {
                if (isEmpty(projectNameList.value)) {
                    items[i].project = items[i].project_id;
                } else {
                    items[i].project = projectNameList.value[items[i].project_id];
                }
            }
            console.log(items);
            return items;
        };

        // request project list
        const requestProjectList = async () => {
            try {
                const res = await context.parent.$http.post('/identity/project/list');
                res.data.results.forEach((project) => {
                    projectNameList.value[project.project_id] = `${project.project_group_info.name} ${project.name}`;
                });
                console.log(projectNameList.value);
            } catch (e) {
                console.error(e);
            }
        };

        // request server list
        const requestState = reactive({
            query: computed(() => (defaultQuery(
                state.thisPage, state.pageSize,
                state.sortBy, state.sortDesc,
                state.searchText,
            ))),
        });
        const requestServerList = async () => {
            const res = await context.parent.$http.post('/inventory/server/list', {
                query: requestState.query,
            });
            state.items = matchProject(res.data.results);
            const allPage = Math.ceil(res.data.total_count / state.pageSize);
            state.allPage = allPage || 1;
            state.selectIndex = [];
        };

        // request server sub data
        const requestSubDataState = reactive({
            query: computed(() => (defaultQuery(
                state.subData.thisPage, state.subData.pageSize,
                state.subData.sortBy, state.subData.sortDesc,
                state.subData.searchText,
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
                state.admin.searchText,
            ))),
        });


        const requestServerAdmin = async () => {
            const res = await context.parent.$http.post('/inventory/server/member/list', {
                query: requestAdminState.query,
                servers: state.getSelectServerIds.value,
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
        requestProjectList();
        requestServerList();
        return {
            ...toRefs(state),
        };
    },
};
</script>
