<script setup lang="ts">
import { computed, reactive } from 'vue';

import { useProviderApi } from '@/api-clients/identity/provider/composables/use-provider-api';
import type { ProviderModel } from '@/api-clients/identity/provider/schema/model';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';


import { useProxyValue } from '@/common/composables/proxy-state';
import ProviderButtonList from '@/common/modules/provider-list/ProviderButtonList.vue';


interface Props {
    selectedProvider: string;
}

const props = withDefaults(defineProps<Props>(), {
    selectedProvider: 'all',
});

const emit = defineEmits<{(e: 'update:selected-provider', value: string): void}>();

const { providerAPI } = useProviderApi();
const { key: providerListKey, params: providerListParams } = useServiceQueryKey('identity', 'provider', 'list', {
    params: {
        query: { only: ['provider', 'name', 'icon'] },
    },
});

const { data: providerList } = useScopedQuery({
    queryKey: providerListKey,
    queryFn: () => providerAPI.list(providerListParams.value),
    select: (data) => data?.results || [],
    staleTime: 1000 * 60 * 5, // 5 minutes
}, ['DOMAIN', 'WORKSPACE']);

const state = reactive({
    proxySelectedProvider: useProxyValue('selectedProvider', props, emit),
});

const providerListWithAll = computed<ProviderModel[]>(() => [
    { provider: 'all', name: 'All Providers' } as ProviderModel,
    ...(providerList.value || []),
]);

</script>

<template>
    <provider-button-list class="collector-provider-list"
                          :provider-list="providerListWithAll"
                          :selected-provider.sync="state.proxySelectedProvider"
    />
</template>

