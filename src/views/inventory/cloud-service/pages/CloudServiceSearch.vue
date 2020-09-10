<template />

<script lang="ts">

import {
    ComponentRenderProxy,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';
import { showErrorMessage } from '@/lib/util';

const DEFAULT_URL = '/inventory/cloud-service';
// TODO: move this file to lib as common dynamic link formatter
const getDynamicLink = async (resourceType: string, search: string, root) => {
    try {
        const result = await SpaceConnector.client.addOns.pageDiscovery.get({
            // eslint-disable-next-line camelcase
            resource_type: 'inventory.CloudService',
            search,
            // eslint-disable-next-line camelcase
            search_key: 'reference.resource_id',
        });
        if (result.url === DEFAULT_URL) {
            showErrorMessage('No Resource',
                'There are no matching resources. It will redirect to Cloud Service main page.',
                root);
            return DEFAULT_URL;
        }
        return `${result.url}?filters=${search}`;
    } catch (e) {
        showErrorMessage('No Resource',
            'There are no matching resources. It will redirect to Cloud Service main page.',
            root);
        return DEFAULT_URL;
    }
};

export default {
    name: 'CloudServiceSearch',
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    // TODO: move this code to route file
    beforeRouteEnter(to, from, next) {
        next(async (vm: ComponentRenderProxy) => {
            const link = await getDynamicLink('inventory.CloudService', vm.$props.id, vm.$root);
            vm.$router.push(link);
        });
    },
};
</script>
