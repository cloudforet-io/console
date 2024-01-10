<template>
    <div />
</template>

<script lang="ts">
import type { Vue } from 'vue/types/vue';

import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { locationQueryToString } from '@/lib/router-query-string';

import { NoSearchResourceError } from '@/common/composables/error/error';
import ErrorHandler from '@/common/composables/error/errorHandler';

const DEFAULT_URL = '/asset-inventory/cloud-service';
const ERROR_URL = '/asset-inventory/cloud-service/no-resource';

export default {
    name: 'CloudServiceTypeSearch',
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
                    next((vm: Vue) => {
                        const targetLocation = vm.$router.match(link);
                        if (!targetLocation.name) {
                            ErrorHandler.handleError('Not found page. (CloudServiceTypeSearchPage.vue)');
                            return;
                        }
                        vm.$router.replace({
                            name: targetLocation.name,
                            params: targetLocation.params,
                            query: targetLocation.query,
                        });
                    });
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
    },
};
</script>
