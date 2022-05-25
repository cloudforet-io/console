<template>
    <server-main :manage-disabled="!hasManagePermission" />
</template>

<script lang="ts">
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import ServerMain from '@/services/asset-inventory/server/modules/ServerMain.vue';

export default {
    name: 'Server',
    components: {
        ServerMain,
    },
    setup() {
        return {
            hasManagePermission: useManagePermissionState(),
        };
    },
};
</script>
