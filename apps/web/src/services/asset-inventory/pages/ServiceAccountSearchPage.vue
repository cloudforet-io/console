<template>
    <div />
</template>

<script lang="ts">
import type {
    ComponentInstance,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { NoSearchResourceError } from '@/common/composables/error/error';
import ErrorHandler from '@/common/composables/error/errorHandler';

const DEFAULT_URL = '/asset-inventory/service-account';
const ERROR_URL = '/asset-inventory/service-account/no-resource';

export default {
    name: 'ServiceAccountSearchPage',
    // TODO: move this code to route file
    beforeRouteEnter(to, from, next) {
        next(async (vm: ComponentInstance) => {
            let link = DEFAULT_URL;
            try {
                const result = await SpaceConnector.client.addOns.pageDiscovery.get({
                    // eslint-disable-next-line camelcase
                    resource_type: 'identity.ServiceAccount',
                    search: vm.$props.id,
                });
                if (result.url === DEFAULT_URL) {
                    ErrorHandler.handleError(new NoSearchResourceError(ERROR_URL));
                } else {
                    link = `${result.url}&filters=["${vm.$props.id}"]`;
                    vm.$router.push(link);
                }
            } catch (e) {
                ErrorHandler.handleError(new NoSearchResourceError(ERROR_URL));
            }
        });
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
};
</script>
