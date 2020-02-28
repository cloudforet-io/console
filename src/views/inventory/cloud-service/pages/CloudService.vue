
<script>
import CloudServiceTemplate, { cloudServiceSetup } from '@/views/inventory/cloud-service/pages/CloudService.template.vue';
import { QuerySearchTableACHandler, QuerySearchTableAPI } from '@/lib/api';

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
        return {
            ...cloudServiceSetup(context, apiHandler, dvApiHandler),
        };
    },
};
</script>
