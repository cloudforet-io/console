<template>
    <l-n-b header="Asset Inventory" :menu-set="MenuSet" />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';
import LNB from '@/common/modules/navigations/lnb/LNB.vue';
import { LNBItem } from '@/common/modules/navigations/lnb/type';
import { MENU_ID } from '@/lib/router/type';


const MenuSet: LNBItem[][] = [
    [
        {
            type: 'item', id: MENU_ID.ASSET_INVENTORY_CLOUD_SERVICE, label: 'Cloud Service', to: { name: ASSET_INVENTORY_ROUTE.CLOUD_SERVICE._NAME },
        },
        {
            type: 'item', id: MENU_ID.ASSET_INVENTORY_SERVER, label: 'Server', to: { name: ASSET_INVENTORY_ROUTE.SERVER._NAME },
        },
        {
            type: 'item', id: MENU_ID.ASSET_INVENTORY_COLLECTOR, label: 'Collector', to: { name: ASSET_INVENTORY_ROUTE.COLLECTOR._NAME },
        },
        {
            type: 'item', id: MENU_ID.ASSET_INVENTORY_SERVICE_ACCOUNT, label: 'Service Account', to: { name: ASSET_INVENTORY_ROUTE.SERVICE_ACCOUNT._NAME },
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
