<script lang="ts" setup>
import { reactive } from 'vue';

import { PSelectCard, PLazyImg } from '@cloudforet/mirinae';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

// Temporary values
const state = reactive({
    channelList: [
        {
            icon: 'ic_notification-protocol_envelope',
            label: 'email',
        },
        {
            icon: 'ic_notification-protocol_sms',
            label: 'SMS',
        },
    ],
    selectedChannel: {},
});

/* Component */
const handleSelectChannel = () => {};
</script>

<template>
    <div class="select-channel-card">
        <p-select-card v-for="(channel, idx) in state.channelList"
                       :key="`channel-${idx}`"
                       v-model="state.selectedChannel"
                       class="card"
                       :multi-selectable="false"
                       show-select-marker
                       :value="channel"
                       @change="handleSelectChannel"
        >
            <div class="card-item">
                <p-lazy-img :src="assetUrlConverter(channel.icon)"
                            width="2.5rem"
                            height="2.5rem"
                            error-icon="ic_notification-protocol_envelope"
                            class="image"
                />
                <p>{{ channel.label }}</p>
            </div>
        </p-select-card>
    </div>
</template>

<style scoped lang="postcss">
.select-channel-card {
    @apply grid grid-cols-3;
    margin-bottom: 57px;
    gap: 0.5rem;
    .card {
        height: 5.625rem;
        padding: 2rem;
        .card-item {
            @apply flex items-center w-full;
            gap: 1rem;
            .image {
                margin-top: 0.6rem;
            }
        }
    }
}
</style>
