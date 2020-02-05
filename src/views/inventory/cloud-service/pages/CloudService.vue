
<script>
import CloudServiceTemplate, { cloudServiceSetup } from '@/views/inventory/cloud-service/pages/CloudService.template.vue';
import { MainTableAPI } from '@/lib/api';

export default {
    name: 'CloudService',
    extends: CloudServiceTemplate,
    setup(props, context) {
        const apiHandler = new MainTableAPI(context.parent, '/inventory/cloud-service-type/list');
        const dvApiHandler = new MainTableAPI(context.parent, '/inventory/cloud-service/list');
        apiHandler.getData();
        return {
            ...cloudServiceSetup(context, apiHandler, dvApiHandler),
        };
    },
};
</script>
