<script setup lang="ts">
import { reactive } from 'vue';

import {
    PSelectCard, PLazyImg,
} from '@cloudforet/mirinae';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { useServiceCreateFormStore } from '@/services/alert-manager-v2/store/service-create-form-store';

const serviceFormStore = useServiceCreateFormStore();

const state = reactive({
    // TODO: temp data
    protocolList: [
        {
            icon: 'ic_notification-protocol_envelope',
            label: 'email',
        },
    ],
    selectedProtocol: {},
});

const handleSelectProtocol = () => {
    serviceFormStore.setSelectedProtocol({ protocol_id: 'temp_id' });
};

</script>

<template>
    <div class="service-create-step3-select-protocol">
        <p-select-card v-for="(item, index) in state.protocolList"
                       :key="`protocol-${index}`"
                       v-model="state.selectedProtocol"
                       :value="item"
                       class="card"
                       @change="handleSelectProtocol"
        >
            <div class="card-item">
                <p-lazy-img :src="assetUrlConverter(item.icon)"
                            width="2.5rem"
                            height="2.5rem"
                            error-icon="ic_notification-protocol_envelope"
                            class="image"
                />
                <p>{{ item.label }}</p>
            </div>
        </p-select-card>
    </div>
</template>

<style scoped lang="postcss">
.service-create-step3-select-protocol {
    @apply grid grid-cols-3;
    gap: 0.5rem;
    .card {
        width: 19.5rem;
        padding: 1rem;
        .card-item {
            @apply flex items-center w-full;
            gap: 0.75rem;
            .image {
                margin-bottom: 0;
            }
        }
    }
}
</style>
