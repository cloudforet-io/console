<template />

<script lang="ts">

import { ComponentInstance } from '@vue/composition-api/dist/component';
import { fluentApi } from '@/lib/fluent-api';
import {
    ComponentRenderProxy,
    getCurrentInstance, ref,
} from '@vue/composition-api';

export default {
    name: 'CloudServiceSearch',
    setup() {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const url = ref('');
        const getDynamicLink = async () => {
            const result = await fluentApi.addons().pageDiscovery().get().setId('vpc-0494b1f302cb92153')
                .setResourceType('inventory.CloudService')
                .execute();
            const baseUrl = result.data.url;
            url.value = `${baseUrl}/?f=vpc-0494b1f302cb92153`;
            await vm.$router.push(vm.$data.url);
        };
        getDynamicLink();
        return {
            url,
            getDynamicLink,
        };
    },
};
</script>
