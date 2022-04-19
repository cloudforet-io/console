<template>
    <fragment>
        <div class="page-navigation">
            <p-breadcrumbs :routes="routeState.route" />
        </div>
        <server-main />
    </fragment>
</template>

<script lang="ts">
import {
    reactive,
} from '@vue/composition-api';

import { PBreadcrumbs } from '@spaceone/design-system';

import ServerMain from '@/services/asset-inventory/server/modules/ServerMain.vue';
import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/route-config';

export default {
    name: 'Server',
    components: {
        ServerMain,
        PBreadcrumbs,
    },
    setup() {
        const routeState = reactive({
            route: [
                { name: 'Asset Inventory', to: { name: ASSET_INVENTORY_ROUTE._NAME } },
                { name: 'Server' },
            ],
        });

        return {
            routeState,
        };
    },
};
</script>
