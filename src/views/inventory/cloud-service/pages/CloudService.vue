
<script>
import CloudServiceTemplate, { cloudServiceSetup } from '@/views/inventory/cloud-service/pages/CloudService.template.vue';
import { BaseQuerySearchTableTSAPI } from '@/lib/api';

export default {
    name: 'CloudService',
    extends: CloudServiceTemplate,
    setup(props, context) {
        const keyAutoCompletes = ['name', 'group', 'provider'];
        const onlyFields = [...keyAutoCompletes, 'data_source'];
        const apiHandler = new BaseQuerySearchTableTSAPI(
            '/inventory/cloud-service-type/list',
            // eslint-disable-next-line camelcase
            keyAutoCompletes, onlyFields, { include_cloud_service_count: true },
            undefined, undefined, undefined, context.parent,
        );
        const dvApiHandler = new BaseQuerySearchTableTSAPI('/inventory/cloud-service/list',
            undefined, undefined, undefined, undefined, undefined, undefined,
            context.parent);

        apiHandler.getData();
        return {
            ...cloudServiceSetup(context, apiHandler, dvApiHandler),
        };
    },
};
</script>
