<template />

<script lang="ts">

import {
    ComponentRenderProxy,
} from '@vue/composition-api';
import { SpaceConnector } from '@/lib/space-connector';

// TODO: move this file to lib as common dynamic link formatter
const getDynamicLink = async (resourceType: string, search: string, searchKey?: string) => {
    try {
        const result = await SpaceConnector.client.addOns.pageDiscovery.get({
            // eslint-disable-next-line camelcase
            resource_type: 'inventory.CloudService',
            search,
            // eslint-disable-next-line camelcase
            search_key: 'reference.resource_id',
        });
        return `${result.url}?filters=${search}`;
    } catch (e) {
        return '/inventory/cloud-service';
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
            const link = await getDynamicLink('inventory.CloudService', vm.$props.id);
            vm.$router.push(link);
        });
    },
};
</script>
