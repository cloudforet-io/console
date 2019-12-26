
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

        serverEventNames.inServiceServer = 'inServiceServer';
        serverEventNames.maintenanceServer = 'maintenanceServer';
        serverEventNames.closedServer = 'closedServer';
        serverEventNames.deleteServer = 'deleteServer';

        const state = serverSetup(props, context, serverEventNames);
        const projectNameList = ref({});
        const matchProject = (items) => {
            for (let i = 0; i < items.length; i++) {
                if (isEmpty(projectNameList.value)) {
                    items[i].project = items[i].project_id;
                } else {
                    items[i].project = projectNameList.value[items[i].project_id] || items[i].project_id;
                }
            }
            return items;
        };

        // request project list
        const requestProjectList = async () => {
            try {
                const res = await context.parent.$http.post('/identity/project/list');
                res.data.results.forEach((project) => {
                    projectNameList.value[project.project_id] = `${project.project_group_info.name} ${project.name}`;
                });
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
            console.log('before', state.loading);
            state.loading = true;
            state.items = [];
            try {
                console.log('start', state.loading);
                const res = await context.parent.$http.post('/inventory/server/list', {
                    query: requestState.query,
                });
                state.items = matchProject(res.data.results);
                const allPage = Math.ceil(res.data.total_count / state.pageSize);
                state.allPage = allPage || 1;
                state.selectIndex = [];
                state.loading = false;
            } catch (e) {
                console.log(e);
                state.loading = false;
            }
        };
        mountBusEvent(serverEventBus, serverEventNames.getServerList, requestServerList);


        // request server sub data
        const requestSubDataState = reactive({
            query: computed(() => (defaultQuery(
                state.subData.thisPage, state.subData.pageSize,
                state.subData.sortBy, state.subData.sortDesc,
                state.subData.searchText,
            ))),
        });
        const requestServerSubData = async (serverId, name) => {
            state.subData.loading = true;

            const res = await context.parent.$http.post('/inventory/server/get-data', {
                query: requestSubDataState.query,
                data_type: name,
                server_id: serverId,
            });
            state.subData.items = res.data.results;
            const allPage = Math.ceil(res.data.total_count / state.subData.pageSize);
            state.subData.allPage = allPage || 1;
            state.subData.loading = false;
        };
        mountBusEvent(serverEventBus, serverEventNames.getServerSubData, requestServerSubData);


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
        mountBusEvent(serverEventBus, serverEventNames.tagConfirmEvent, ServerTagConfirm);

        // get server admin data
        const requestAdminState = reactive({
            query: computed(() => (defaultQuery(
                state.admin.thisPage, state.admin.pageSize,
                state.admin.sortBy, state.admin.sortDesc,
                state.admin.searchText,
            ))),
        });


        const requestServerAdmin = async () => {
            console.log(state.getSelectServerIds);
            state.admin.loading = true;
            state.admin.items = [];
            const res = await context.parent.$http.post('/inventory/server/member/list', {
                query: requestAdminState.query,
                servers: state.getSelectServerIds,
            });
            state.admin.items = res.data.results;
            const allPage = Math.ceil(res.data.total_count / state.subData.pageSize);
            state.admin.allPage = allPage || 1;
            state.admin.loading = false;
        };
        mountBusEvent(serverEventBus, serverEventNames.getServerAdmin, requestServerAdmin);


        const getServersParam = (items, changeState) => {
            console.log(items);
            const result = { servers: _.map(items, 'server_id') };
            if (changeState) {
                result.state = changeState;
            }
            return result;
        };
        const maintenanceServer = async (items) => {
            await context.parent.$http.post('/inventory/server/change-state', getServersParam(items, 'MAINTENANCE')).then(async (_) => {
                await requestServerList();
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'success',
                    title: 'success',
                    text: 'maintenance servers',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'alert',
                    title: 'Fail',
                    text: 'request Fail',
                    duration: 2000,
                    speed: 1000,
                });
            });
        };
        mountBusEvent(serverEventBus, serverEventNames.maintenanceServer, maintenanceServer);

        const closedServer = async (items) => {
            await context.parent.$http.post('/inventory/server/change-state', getServersParam(items, 'CLOSED')).then(async (_) => {
                await requestServerList();
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'success',
                    title: 'success',
                    text: 'closed servers',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'alert',
                    title: 'Fail',
                    text: 'request Fail',
                    duration: 2000,
                    speed: 1000,
                });
            });
        };
        mountBusEvent(serverEventBus, serverEventNames.closedServer, closedServer);

        const inServiceServer = async (items) => {
            await context.parent.$http.post('/inventory/server/change-state', getServersParam(items, 'INSERVICE')).then(async (_) => {
                await requestServerList();
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'success',
                    title: 'success',
                    text: 'in-service servers',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'alert',
                    title: 'Fail',
                    text: 'request Fail',
                    duration: 2000,
                    speed: 1000,
                });
            });
        };
        mountBusEvent(serverEventBus, serverEventNames.inServiceServer, inServiceServer);

        const deleteServer = async (items) => {
            await context.parent.$http.post('/inventory/server/delete', getServersParam(items)).then(async (_) => {
                await requestServerList();
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'success',
                    title: 'success',
                    text: 'delete servers',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                context.root.$notify({
                    group: 'noticeBottomLeft',
                    type: 'alert',
                    title: 'Fail',
                    text: 'request Fail',
                    duration: 2000,
                    speed: 1000,
                });
            });
        };
        mountBusEvent(serverEventBus, serverEventNames.deleteServer, deleteServer);

        requestProjectList();
        requestServerList();
        return {
            ...toRefs(state),
        };
    },
};
</script>
