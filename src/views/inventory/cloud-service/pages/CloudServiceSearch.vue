<template>
    <div />
</template>
<script lang="ts">
/* eslint-disable camelcase */
import { isEmpty } from 'lodash';
import { SpaceConnector } from '@/lib/space-connector';
import { locationQueryToString } from '@/lib/router-query-string';

const DEFAULT_URL = '/inventory/cloud-service';
const ERROR_URL = '/inventory/cloud-service/no-resource';

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
        (async () => {
            let link = DEFAULT_URL;
            try {
                const result = await SpaceConnector.client.addOns.pageDiscovery.get({
                    resource_type: 'inventory.CloudService',
                    search: to.params.id,
                    search_key: to.params.searchKey,
                });
                if (result.url === DEFAULT_URL) {
                    next(ERROR_URL);
                } else {
                    link = `${result.url}?filters=${to.params.searchKey}:${to.params.id}`;
                    if (!isEmpty(to.query)) {
                        const queryString = locationQueryToString(to.query);
                        link += `&${queryString}`;
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
