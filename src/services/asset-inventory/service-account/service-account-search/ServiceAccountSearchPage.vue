<template>
    <div />
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
} from '@vue/composition-api';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { NoSearchResourceError } from '@/common/composables/error/error';

const DEFAULT_URL = '/asset-inventory/service-account';
const ERROR_URL = '/asset-inventory/service-account/no-resource';

export default {
    name: 'ServiceAccountSearchPage',
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    // TODO: move this code to route file
    beforeRouteEnter(to, from, next) {
        next(async (vm: ComponentRenderProxy) => {
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
};
</script>
