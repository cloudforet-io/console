<template>
    <div />
</template>

<script lang="ts">
import { isEmpty } from 'lodash';
import { SpaceConnector } from '@/core-lib/space-connector';
import { locationQueryToString } from '@/lib/router-query-string';

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
                    let link = result.url;
                    if (!isEmpty(to.query)) {
                        const queryString = locationQueryToString(to.query);
                        link += `?${queryString}`;
                    }
                    next(link);
                }
            } catch (e) {
                next(ERROR_URL);
            }
        })();
    },
};
</script>
