<template>
    <div />
</template>

<script lang="ts">

import { ComponentInstance } from '@vue/composition-api/dist/component';
import { fluentApi } from '@/lib/fluent-api';
import {
    getCurrentInstance, ref,
} from '@vue/composition-api';

export default {
    name: 'ServiceAccountSearch',
    setup() {
        const vm = getCurrentInstance() as ComponentInstance;
        const url = ref('');
        const getDynamicLink = async () => {
            const result = await fluentApi.addons().pageDiscovery().get().setId('sa-50889b1079bc')
                .setResourceType('identity.ServiceAccount')
                .execute();
            const baseUrl = result.data.url;
            url.value = `${baseUrl}&t_se=sa-50889b1079bc`;
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
