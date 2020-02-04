<!--<template>-->
<!--    <div>asdfasdfsd</div>-->
<!--</template>-->
<script>
import CloudServiceTemplate from '@/views/inventory/cloud-service/pages/CloudService.template.vue';
// import { MainTableAPI } from '@/lib/api';

export default {
    name: 'CloudService',
    extends: CloudServiceTemplate,
    setup(props, context) {
        // const mockAPI = new MainTableAPI(context.parent, '');
        return {};
        // return cloudServiceSetup(context, mockAPI, mockAPI);
    },
};
</script>
