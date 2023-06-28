<script lang="ts">

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { isEmpty } from 'lodash';

import { locationQueryToString } from '@/lib/router-query-string';

import { NoSearchResourceError } from '@/common/composables/error/error';
import ErrorHandler from '@/common/composables/error/errorHandler';

const DEFAULT_URL = '/asset-inventory/cloud-service';
const ERROR_URL = '/asset-inventory/cloud-service/no-resource';


/* TODO: need to find solution of Augmenting Custom Options 'beforeRouteEnter' in script setup
*   ComponentCustomOptions is declared in shims-vue.d.ts */
export default {
    name: 'CloudServiceSearch',
    beforeRouteEnter(to, from, next) {
        const queryHelper = new QueryHelper();
        (async () => {
            let link = DEFAULT_URL;
            try {
                const result = await SpaceConnector.client.addOns.pageDiscovery.get({
                    resource_type: 'inventory.CloudService',
                    search: to.params.id,
                    search_key: to.params.searchKey,
                });
                if (result.url === DEFAULT_URL) {
                    ErrorHandler.handleError(new NoSearchResourceError(ERROR_URL));
                } else {
                    queryHelper.setFilters([{ k: to.params.searchKey, v: to.params.id, o: '' }]);
                    link = `${result.url}?filters=${queryHelper.rawQueryStrings[0]}`;
                    if (!isEmpty(to.query)) {
                        const queryString = locationQueryToString(to.query);
                        link += `&${queryString}`;
                    }
                    next(link);
                }
            } catch (e) {
                ErrorHandler.handleError(new NoSearchResourceError(ERROR_URL));
            }
        })();
    },
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
};
</script>

<template>
    <div />
</template>
