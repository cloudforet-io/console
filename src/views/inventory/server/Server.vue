
<script lang="ts">
/* eslint-disable camelcase */

import {
    ref, toRefs, computed, reactive,
} from '@vue/composition-api';
import _ from 'lodash';
import ServerTemplate, { serverSetup, eventNames } from '@/views/inventory/server/Server.template.vue';
import serverEventBus from '@/views/inventory/server/ServerEventBus';
import { mountBusEvent, tabIsShow } from '@/lib/compostion-util';
import {
  defaultAutocompleteHandler,
  getEnumValues, getFetchValues, makeValuesFetchHandler,
} from '@/components/organisms/search/query-search-bar/autocompleteHandler'
import { getAllPage } from '@/components/organisms/pagenations/toolset';
import { defaultQuery } from '@/lib/api/query';
import { AdminTableAPI, HistoryAPI, QuerySearchTableFluentAPI } from '@/lib/api/table'
import { ChangeServerProject } from '@/lib/api/fetch';
import { useStore } from '@/store/toolset';
import fluentApi from '@/lib/fluent-api';
import { QSTableACHandlerArgs, QuerySearchTableACHandler } from '@/lib/api/auto-complete'

export default {
    name: 'Server',
    extends: ServerTemplate,
    setup(props, context) {


        const serverEventNames = eventNames;
        serverEventNames.getServerList = 'getServerData';
        serverEventNames.tagConfirmEvent = 'ServerTagConfirmEvent';
        serverEventNames.tagResetEvent = 'resetTagEvent';
        serverEventNames.getServerAdmin = 'requestAdmin';

        serverEventNames.inServiceServer = 'inServiceServer';
        serverEventNames.maintenanceServer = 'maintenanceServer';
        serverEventNames.closedServer = 'closedServer';
        serverEventNames.deleteServer = 'deleteServer';

        class ACHandler extends QuerySearchTableACHandler {

            // eslint-disable-next-line class-methods-use-this
            get valuesFetchUrl() {
                return '/inventory/server/list';
            }

            // eslint-disable-next-line class-methods-use-this
            get valuesFetchKeys() {
                return [
                    'server_id', 'name', 'primary_ip_address',
                    'data.compute.instance_name', 'data.compute.instance_id',
                    'data.vm.vm_name', 'data.vm.vm_id',
                ];
            }

            constructor(args: QSTableACHandlerArgs) {
                super(args);
                this.handlerMap.value = [
                    ...makeValuesFetchHandler(
                        context.parent,
                        '/inventory/server/list',
                        [
                            'server_id', 'name', 'primary_ip_address',
                            'data.compute.instance_name', 'data.compute.instance_id',
                            'data.vm.vm_name', 'data.vm.vm_id',
                        ]),
                    getEnumValues('state', ['PENDING', 'INSERVICE', 'MAINTENANCE', 'CLOSED', 'DELETED']),
                    getEnumValues('os_type', ['LINUX', 'WINDOWS']),
                    getEnumValues('collection_info.state', ['MANUAL', 'ACTIVE', 'DISCONNECTED']),
                    getEnumValues('server_type', ['BAREMETAL', 'VM', 'HYPERVISOR', 'UNKNOWN']),
                    getFetchValues('project_id', '/identity/project/list', context.parent,),
                ];
            }
        }

        const args = {
            keys:[
                'server_id',
                'name', 'state', 'primary_ip_address', 'server_type', 'os_type', 'project_id',
                'data.os.os_arch', 'data.os.os_details', 'data.os.os_version',
                'data.base.memory', 'data.base.core', 'data.platform.type',
                'data.compute.instance_name', 'data.compute.keypair', 'data.compute.instance_id',
                'collection_info.state',
            ],
            suggestKeys:['server_id', 'name', 'primary_ip_address'],
        };
        const action =  fluentApi.inventory().server().list();
        const apiHandler = new QuerySearchTableFluentAPI(
            action,
            undefined,
            undefined,
            {handlerClass:ACHandler,args},
        );

        const state = serverSetup(
            props,
            context,
            serverEventNames,
            apiHandler,
            new ChangeServerProject(),
        );
        const projectStore = context.parent.$ls.project;

        projectStore.getProject();
        const matchProject = (items) => {
            const result = items.map((item) => {
                try {
                    item.project = item.project_id ? projectStore.state.projects[item.project_id] || item.project_id : '';
                } catch (e) {
                    item.project = item.project_id;
                }
                return item;
            });
            return result;
        };


        const numberTypeKeys = new Set(['data.base.memory', 'data.base.core']);
        // const valueFormatter = (key, value) => {
        //     if (numberTypeKeys.has(key)) {
        //         try {
        //             return Number(value);
        //         } catch (e) {
        //             return value;
        //         }
        //     }
        //     return value;
        // };

        // request server list
        // const requestState = reactive({
        //     query: computed(() => (defaultQuery(
        //         state.thisPage, state.pageSize,
        //         state.sortBy, state.sortDesc, null,
        //         state.queryListTools.tags, valueFormatter,
        //     ))),
        // });


        // change tag
        const ServerTagConfirm = async (serverId:string, tags:any, originTags) => {
            const idx = apiHandler.tableTS.syncState.selectIndex[0]
            try {
                const res = await context.parent.$http.post('/inventory/server/update', {
                    server_id: serverId,
                    tags,
                });
                (apiHandler.tableTS.state.items as any[])[idx].tags = tags;
            } catch (e) {
                serverEventBus.$emit(serverEventNames.tagResetEvent);
                (apiHandler.tableTS.state.items as any[])[idx].tags = originTags;
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
            state.admin.loading = true;
            state.admin.items = [];
            const res = await context.parent.$http.post('/inventory/server/member/list', {
                query: requestAdminState.query,
                servers: apiHandler.tableTS.selectState.selectItems.map(value => value.server_id),
            });
            state.admin.items = res.data.results;
            state.admin.allPage = getAllPage(res.data.total_count, state.admin.pageSize);
            state.admin.loading = false;
        };
        mountBusEvent(serverEventBus, serverEventNames.getServerAdmin, requestServerAdmin);


        const getServersParam = (items, changeState?) => {
            console.debug(items);
            const result:any = { servers: _.map(items, 'server_id') };
            if (changeState) {
                result.state = changeState;
            }
            return result;
        };
        const maintenanceServer = async (items) => {
            await context.parent.$http.post('/inventory/server/change-state', getServersParam(items, 'MAINTENANCE')).then(async (_) => {
                await apiHandler.getData();
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'maintenance servers',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                context.root.$notify({
                    group: 'noticeBottomRight',
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
                await apiHandler.getData();
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'closed servers',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                context.root.$notify({
                    group: 'noticeBottomRight',
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
                await apiHandler.getData();
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'in-service servers',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                context.root.$notify({
                    group: 'noticeBottomRight',
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
                await apiHandler.getData();
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'success',
                    title: 'success',
                    text: 'delete servers',
                    duration: 2000,
                    speed: 1000,
                });
            }).catch((error) => {
                console.error(error);
                context.root.$notify({
                    group: 'noticeBottomRight',
                    type: 'alert',
                    title: 'Fail',
                    text: 'request Fail',
                    duration: 2000,
                    speed: 1000,
                });
            });
        };
        mountBusEvent(serverEventBus, serverEventNames.deleteServer, deleteServer);

        state.apiHandler.getData();

        const adminParams = computed(() => ({
            servers: state.apiHandler.tableTS.selectState.selectItems.map((item)=>item),
        }));
        // todo: move server.vue
        const adminIsShow = computed(() => {
            let result = false;
            if (apiHandler.tableTS.selectState.isSelectOne) {
                result = state.activeTab === 'admin';
            } if (apiHandler.tableTS.selectState.isSelectMulti) {
                result = state.multiSelectActiveTab === 'admin';
            }
            return result;
        });
        const adminApiHandler = new AdminTableAPI('/inventory/server/member/list', adminParams, undefined, undefined, undefined, undefined, adminIsShow);

        const historyIsShow = computed(() => {
            let result = false;
            if (apiHandler.tableTS.selectState.isSelectOne && state.activeTab === 'history') {
                result = true;
            }
            return result;
        });
        const selectId = computed(() => apiHandler.tableTS.selectState.firstSelectItem.server_id);
        const historyAPIHandler = new HistoryAPI('/inventory/server/get-data', 'server_id', selectId, undefined, undefined, undefined, historyIsShow);
        return {
            ...toRefs(state),
            adminApiHandler,
            historyAPIHandler,
            apiHandler
        };
    },
};
</script>
