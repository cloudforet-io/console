
<script>
import { computed, toRefs } from '@vue/composition-api';
import CloudServiceTemplate, { cloudServiceSetup } from '@/views/inventory/cloud-service/pages/CloudService.template.vue';
import { tabIsShow } from '@/lib/compostion-util';
import { AdminTableAPI, HistoryAPI, QuerySearchTableAPI } from '@/lib/api/table';
import { QuerySearchTableACHandler } from '@/lib/api/auto-complete';
import { ChangeCloudServiceProject } from '@/lib/api/fetch';

export default {
    name: 'CloudService',
    extends: CloudServiceTemplate,
    setup(props, context) {
        const keyAutoCompletes = ['name', 'group', 'provider'];
        const onlyFields = [...keyAutoCompletes, 'data_source'];

        const csTypeACHandlerMeta = {
            handlerClass: QuerySearchTableACHandler,
            args: {
                keys: keyAutoCompletes,
                suggestKeys: keyAutoCompletes,
            },
        };

        const apiHandler = new QuerySearchTableAPI(
            // eslint-disable-next-line camelcase
            '/inventory/cloud-service-type/list', onlyFields, { include_cloud_service_count: true },
            undefined, undefined, csTypeACHandlerMeta,
        );
        const dvApiHandler = new QuerySearchTableAPI('/inventory/cloud-service/list');
        apiHandler.getData();
        const changeProjectAPI = new ChangeCloudServiceProject();
        const state = cloudServiceSetup(context, apiHandler, dvApiHandler, changeProjectAPI);

        // eslint-disable-next-line camelcase
        const adminParams = computed(() => ({ cloud_services: dvApiHandler.tableTS.selectState.selectItems.map(v => v.cloud_service_id) }));
        const adminTabIsShow = tabIsShow(dvApiHandler, state, 'admin');
        const adminIsShow = computed(() => {
            let result = false;
            if (apiHandler.tableTS.selectState.isSelectOne) {
                result = adminTabIsShow.value;
            }
            return result;
        });

        const adminApiHandler = new AdminTableAPI('/inventory/cloud-service/member/list', adminParams, undefined, undefined, undefined, undefined, adminIsShow);
        const historyTabIsShow = tabIsShow(dvApiHandler, state, 'history');

        const historyIsShow = computed(() => {
            let result = false;
            if (apiHandler.tableTS.selectState.isSelectOne) {
                result = historyTabIsShow.value;
            }
            return result;
        });
        const selectId = computed(() => dvApiHandler.tableTS.selectState.firstSelectItem.cloud_service_id);
        const historyAPIHandler = new HistoryAPI('/inventory/cloud-service/get-data', 'cloud_service_id', selectId, undefined, undefined, undefined, historyIsShow);
        return {
            ...toRefs(state),
            adminApiHandler,
            historyAPIHandler,
        };
    },
};
</script>
