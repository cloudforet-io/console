<template>
    <div />
</template>

<script lang="ts">

import { fluentApi } from '@/lib/fluent-api';
import {
    ComponentRenderProxy,
} from '@vue/composition-api';

// TODO: Code Review
// TODO: move this file to lib as common dynamic link formatter
const getDynamicLink = async (resourceType: string, search: string, searchKey?: string) => {
    try {
        let api = fluentApi.addons().pageDiscovery().get()
            .setResourceType(resourceType)
            .setSearch(search);
        if (searchKey) api = api.setSearchKey(searchKey);
        const result = await api.execute();
        return `${result.data.url}&t_se=${search}`;
    } catch (e) {
        return '/identity/service-account';
    }
};

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
            const link = await getDynamicLink('identity.ServiceAccount', vm.$props.id);
            vm.$router.push(link);
        });
    },
    // setup(props) {
    //     const vm = getCurrentInstance() as ComponentInstance;
    //     const url = ref('');
    //     const getDynamicLink = async () => {
    //         const result = await fluentApi.addons().pageDiscovery().get().setId('sa-50889b1079bc')
    //             .setResourceType('identity.ServiceAccount')
    //             .execute();
    //         const baseUrl = result.data.url;
    //         url.value = `${baseUrl}&t_se=sa-50889b1079bc`;
    //         await vm.$router.push(vm.$data.url);
    //     };
    //     getDynamicLink();
    //     return {
    //         url,
    //         getDynamicLink,
    //     };
    // },
};
</script>
