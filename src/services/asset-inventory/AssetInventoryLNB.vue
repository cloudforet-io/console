<template>
    <div>
        <p class="font-lg font-bold mb-4">
            Asset Inventory
        </p>
        <router-link to="/asset-inventory/cloud-service">
            Cloud Service
        </router-link> <br>
        <router-link to="/asset-inventory/server">
            Server
        </router-link> <br>
        <router-link to="/asset-inventory/collector">
            Collector
        </router-link> <br>
        <router-link to="/asset-inventory/service-account">
            Service Account
        </router-link>
    </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from '@vue/composition-api';


export default defineComponent({
    name: 'AssetInventoryLNB',
    components: {},
    setup() {
        const state = reactive({});
        return {
            ...toRefs(state),
        };
    },
});

</script>
