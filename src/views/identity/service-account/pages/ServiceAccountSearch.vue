<template>
    <div />
</template>

<script lang="ts">

import { fluentApi } from '@/lib/fluent-api';
import {
    ComponentRenderProxy,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage } from '@/lib/util';

// TODO: move this file to lib as common dynamic link formatter
// const getDynamicLink = async (resourceType: string, search: string, searchKey?: string) => {
//     try {
//         let api = fluentApi.addons().pageDiscovery().get()
//             .setResourceType(resourceType)
//             .setSearch(search);
//         if (searchKey) api = api.setSearchKey(searchKey);
//         const result = await api.execute();
//         return `${result.data.url}&filters=${search}`;
//     } catch (e) {
//         return '/identity/service-account';
//     }
// };

const DEFAULT_URL = '/identity/service-account';

export default {
    name: 'ServiceAccountSearch',
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
                    resource_type: 'identity.ServiceAccount',
                    search: vm.$props.id,
                });
                if (result.url === DEFAULT_URL) {
                    showErrorMessage('No Resource', 'There are no matching resources.', vm.$root);
                } else link = `${result.url}&filters=${vm.$props.id}`;
            } catch (e) {
                showErrorMessage('No Resource', 'There are no matching resources.', vm.$root);
            }
            // const link = await getDynamicLink('identity.ServiceAccount', vm.$props.id);
            vm.$router.push(link);
        });
    },
};
</script>
