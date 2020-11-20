<template>
    <div />
</template>

<script lang="ts">

import { SpaceConnector } from '@/lib/space-connector';

const DEFAULT_URL = '/inventory/cloud-service';
const ERROR_URL = '/inventory/cloud-service/no-resource';

export default {
    name: 'CloudServiceTypeSearch',
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    beforeRouteEnter(to, from, next) {
        (async () => {
            try {
                const result = await SpaceConnector.client.addOns.pageDiscovery.get({
                    resource_type: 'inventory.CloudServiceType',
                    search: to.params.id,
                });
                if (result.url === DEFAULT_URL) {
                    next(ERROR_URL);
                } else {
                    next(result.url);
                }
            } catch (e) {
                next(ERROR_URL);
            }
        })();
    },
};
</script>
