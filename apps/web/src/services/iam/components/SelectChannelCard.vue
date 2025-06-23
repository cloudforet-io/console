<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { PSelectCard, PLazyImg } from '@cloudforet/mirinae';

import { useNotificationProtocolApi } from '@/api-clients/alert-manager/notification-protocol/composables/use-notification-protocol-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-model/use-all-reference-data-model';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';


const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();


const referenceMap = useAllReferenceDataModel();
const state = reactive({
    selectedProtocol: {},
});

const { notificationProtocolAPI } = useNotificationProtocolApi();
const { key: notificationProtocolListQueryKey } = useServiceQueryKey('alert-manager', 'notification-protocol', 'list');

const { data: notificationProtocolList } = useScopedQuery({
    queryKey: notificationProtocolListQueryKey,
    queryFn: async () => notificationProtocolAPI.list(),
    select: (data) => data?.results || [],
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 30,
}, ['DOMAIN', 'WORKSPACE']);

const notificationProtocolCardList = computed(() => (notificationProtocolList.value || []).map((item) => ({
    label: item.name,
    value: item.protocol_id,
    icon: referenceMap.plugin[item.plugin_info.plugin_id]?.icon || '',
})));

/* Component */
const handleSelectChannel = (selectedProtocol) => {
    notificationChannelCreateFormStore.$patch((_state) => {
        _state.state.selectedProtocol = {
            name: selectedProtocol.label,
            protocol_id: selectedProtocol.value,
            icon: selectedProtocol.icon,
        };
    });
};
</script>

<template>
    <div class="select-channel-card">
        <p-select-card v-for="(channel, idx) in notificationProtocolCardList"
                       :key="`channel-${idx}`"
                       v-model="state.selectedProtocol"
                       :selected="state.selectedProtocol"
                       class="card"
                       :multi-selectable="false"
                       :show-select-marker="false"
                       :value="channel"
                       @change="handleSelectChannel"
        >
            <div class="card-item">
                <p-lazy-img v-if="channel.icon"
                            :src="assetUrlConverter(channel.icon)"
                            width="2.5rem"
                            height="2.5rem"
                            error-icon="ic_notification-protocol_envelope"
                            class="image"
                />
                <p class="w-30">
                    {{ channel.label }}
                </p>
            </div>
            <!--            <template></template>-->
        </p-select-card>
    </div>
</template>

<style scoped lang="postcss">
.select-channel-card {
    @apply grid grid-cols-3 grid-rows-3;
    margin-bottom: 57px;
    gap: 0.5rem;
    .card {
        height: 5.625rem;
        padding: 1.5rem;
        .card-item {
            @apply flex items-center w-full;
            gap: 1rem;
            .image {
                margin-top: 0.8rem;
            }
        }
    }
}
</style>
