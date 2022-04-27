<template>
    <server-main />
</template>

<script lang="ts">
import ServerMain from '@/services/asset-inventory/server/modules/ServerMain.vue';

export default {
    name: 'Server',
    components: {
        ServerMain,
    },
    setup() {
        return {
        };
    },
};
</script>
