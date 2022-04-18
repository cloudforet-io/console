<template>
    <l-n-b header="Asset Inventory" :menu-set="MenuSet" />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import { LNBItem } from '@/common/modules/navigations/lnb/type';


const MenuSet: LNBItem[][] = [
    [
        {
            type: 'item', id: 'cloud-service', label: 'Cloud Service', to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME },
        },
        {
            type: 'item', id: 'server', label: 'Server', to: { name: ASSET_INVENTORY_ROUTE.SERVER._NAME },
        },
        {
            type: 'item', id: 'collector', label: 'Collector', to: { name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME },
        },
        {
            type: 'item', id: 'service-account', label: 'Service Account', to: { name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME },
        },
    ],
];

export default defineComponent({
    name: 'AssetInventoryLNB',
    components: { LNB },
    setup() {
        return {
            MenuSet,
        };
    },
});

</script>
