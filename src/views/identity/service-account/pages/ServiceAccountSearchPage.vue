<template>
    <div />
</template>

<script lang="ts">
import {
    ComponentRenderProxy,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';

const DEFAULT_URL = '/identity/service-account';
const ERROR_URL = '/identity/service-account/no-resource';

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
                    vm.$router.push(ERROR_URL);
                } else {
                    link = `${result.url}&filters=${vm.$props.id}`;
                    vm.$router.push(link);
                }
            } catch (e) {
                vm.$router.push(ERROR_URL);
            }
        });
    },
};
</script>
