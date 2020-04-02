
<script lang="ts">
/* eslint-disable camelcase,@typescript-eslint/camelcase */

import { computed, toRefs } from '@vue/composition-api';
import CloudServiceTemplate, { cloudServiceSetup } from '@/views/inventory/cloud-service/pages/CloudService.template.vue';
import { tabIsShow } from '@/lib/compostion-util';
import {
    AdminFluentAPI,
    AdminTableAPI, HistoryAPI, HistoryFluentAPI, QuerySearchTableAPI, QuerySearchTableFluentAPI,
} from '@/lib/api/table';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import { ChangeCloudServiceProject } from '@/lib/api/fetch';
import { useStore } from '@/store/toolset';
import { fluentApi } from '@/lib/fluent-api';
import { CloudServiceListResp } from '@/lib/fluent-api/inventory/cloud-service';
import { AxiosResponse } from 'axios';

export default {
    name: 'CloudService',
    extends: CloudServiceTemplate,
    setup(props, context) {
        const { project } = useStore();
        project.getProject();
        const keyAutoCompletes = ['name', 'group', 'provider'];
        const onlyFields = [...keyAutoCompletes, 'data_source'];

        const csTypeACHandlerMeta = {
            handlerClass: QuerySearchTableACHandler,
            args: {
                keys: keyAutoCompletes,
                suggestKeys: keyAutoCompletes,
            },
        };
        const cstListAction = fluentApi.inventory().cloudServiceType().list()
            .setOnly(...onlyFields)
            .setCloudServiceCount();

        const apiHandler = new QuerySearchTableFluentAPI(
            cstListAction,
            {
                striped: true,
                border: false,
                shadow: false,
                padding: false,
                multiSelect: false,
                selectable: true,
            },
            undefined,
            csTypeACHandlerMeta,
        );


        const csListAction = fluentApi.inventory().cloudService().list()
            .setTransformer((resp: AxiosResponse<CloudServiceListResp>) => {
                const result = resp;
                result.data.results = resp.data.results.map((item) => {
                    item.console_force_data = { project: item.project_id ? project.state.projects[item.project_id] || item.project_id : '' };
                    return item;
                });
                return result;
            });


        const dvApiHandler = new QuerySearchTableFluentAPI(csListAction);


        apiHandler.getData();
        const changeProjectAPI = new ChangeCloudServiceProject();
        const state = cloudServiceSetup(context, apiHandler, dvApiHandler, changeProjectAPI);

        // @ts-ignore
        const adminTabIsShow = tabIsShow(dvApiHandler, state, 'admin');


        const adminIsShow = computed(() => {
            let result = false;
            if (apiHandler.tableTS.selectState.isSelectOne) {
                result = adminTabIsShow.value;
            }
            return result;
        });

        const adminApiHandler = new AdminFluentAPI(
            fluentApi.inventory().cloudService().memberList(),
            adminIsShow,
            'cloud_service_id',
            dvApiHandler,
        );

        // @ts-ignore
        const historyTabIsShow = tabIsShow(dvApiHandler, state, 'history');

        const historyIsShow = computed(() => {
            let result = false;
            if (apiHandler.tableTS.selectState.isSelectOne) {
                result = historyTabIsShow.value;
            }
            return result;
        });
        const selectId = computed(() => dvApiHandler.tableTS.selectState.firstSelectItem.cloud_service_id);
        const getDataAction = fluentApi.inventory().cloudService().getData();

        // @ts-ignore
        const historyAPIHandler = new HistoryFluentAPI(getDataAction, historyIsShow, selectId);
        return {
            ...toRefs(state),
            adminApiHandler,
            historyAPIHandler,
        };
    },
};
</script>
