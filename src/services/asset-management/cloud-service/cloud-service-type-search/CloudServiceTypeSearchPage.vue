<template>
    <div />
</template>

<script lang="ts">
import { isEmpty } from 'lodash';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { locationQueryToString } from '@/lib/router-query-string';
import { NoSearchResourceError } from '@/common/composables/error/error';
import ErrorHandler from '@/common/composables/error/errorHandler';

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
                    ErrorHandler.handleError(new NoSearchResourceError(ERROR_URL));
                } else {
                    let link = result.url;
                    if (!isEmpty(to.query)) {
                        const queryString = locationQueryToString(to.query);
                        link += `?${queryString}`;
                    }
                    next(link);
                }
            } catch (e) {
                ErrorHandler.handleError(new NoSearchResourceError(ERROR_URL));
            }
        })();
    },
};
</script>
