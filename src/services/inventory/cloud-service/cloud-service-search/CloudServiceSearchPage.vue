<template>
    <div />
</template>
<script lang="ts">
/* eslint-disable camelcase */
import { isEmpty } from 'lodash';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { locationQueryToString } from '@/lib/router-query-string';
import { QueryHelper } from '@spaceone/console-core-lib/query';
import { NoSearchResourceError } from '@/common/composables/error/error';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { ComponentRenderProxy, getCurrentInstance } from '@vue/composition-api';

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
                    await ErrorHandler.handleError(new NoSearchResourceError(ERROR_URL));
                } else {
                    queryHelper.setFilters([{ k: to.params.searchKey, v: to.params.id, o: '=' }]);
                    link = `${result.url}?filters=${queryHelper.rawQueryStrings[0]}`;
                    if (!isEmpty(to.query)) {
                        const queryString = locationQueryToString(to.query);
                        link += `&${queryString}`;
                    }
                    next(link);
                }
            } catch (e) {
                await ErrorHandler.handleError(new NoSearchResourceError(ERROR_URL));
            }
        })();
    },
};
</script>
