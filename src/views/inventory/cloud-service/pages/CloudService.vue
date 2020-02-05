
<script>
import CloudServiceTemplate, { cloudServiceSetup } from '@/views/inventory/cloud-service/pages/CloudService.template.vue';
import { QuerySearchTableAPI } from '@/lib/api';

export default {
    name: 'CloudService',
    extends: CloudServiceTemplate,
    setup(props, context) {
        const keyAutoCompletes = ['name', 'group', 'provider'];
        const onlyFields = [...keyAutoCompletes, 'data_source'];
        const apiHandler = new QuerySearchTableAPI(context.parent, '/inventory/cloud-service-type/list', keyAutoCompletes, onlyFields);
        const dvApiHandler = new QuerySearchTableAPI(context.parent, '/inventory/cloud-service/list');
        apiHandler.getData();
        return {
            ...cloudServiceSetup(context, apiHandler, dvApiHandler),
        };
    },
};
</script>
