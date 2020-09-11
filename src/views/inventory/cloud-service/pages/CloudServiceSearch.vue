<script lang="ts">

import {
    ComponentRenderProxy,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage } from '@/lib/util';

const DEFAULT_URL = '/inventory/cloud-service';

export default {
    name: 'CloudServiceSearch',
    props: {
        id: {
            type: String,
            default: undefined,
        },
        searchKey: {
            type: String,
            default: undefined,
        },
    },
    beforeRouteEnter(to, from, next) {
        next(async (vm: ComponentRenderProxy) => {
            let link = DEFAULT_URL;
            try {
                const result = await SpaceConnector.client.addOns.pageDiscovery.get({
                    resource_type: 'inventory.CloudService',
                    search: vm.$props.id,
                    search_key: vm.$props.searchKey,
                });
                if (result.url === DEFAULT_URL) {
                    showErrorMessage('No Resource', 'There are no matching resources. It will redirect to Cloud Service main page.', vm.$root);
                } else link = `${result.url}?filters=${vm.$props.searchKey}:${vm.$props.id}`;
            } catch (e) {
                showErrorMessage('No Resource', 'There are no matching resources. It will redirect to Cloud Service main page.', vm.$root);
            }
            vm.$router.push(link);
        });
    },
};
</script>
