<script lang="ts" setup>
import { reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PSelectCard, PLazyImg } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

const emit = defineEmits<{(e: 'select-channel', form: string); }>();

interface ChannelCard {
  channelList: { icon: string; label: TranslateResult | string }[];
  selectedChannel: { icon: string; label: TranslateResult | string }[] | null;
}

// Temporary values
const state = reactive<ChannelCard>({
    channelList: [
        {
            icon: 'ic_notification-protocol_envelope',
            label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.EMAIL'),
        },
        {
            icon: 'ic_notification-protocol_sms',
            label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.SMS'),
        },
        {
            icon: 'ic_notification-protocol_envelope',
            label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.TELEGRAM'),
        },
        {
            icon: 'ic_notification-protocol_slack',
            label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.SLACK'),
        },
        {
            icon: 'ic_notification-protocol_ms-teams',
            label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.MS_TEAMS'),
        },
        {
            icon: 'ic_notification-protocol_kakaotalk',
            label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.KAKAOTALK'),
        },
        {
            icon: 'ic_notification-protocol_users',
            label: i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.NOTIFY_TO_MEMBER'),
        },
    ],
    selectedChannel: null,
});

/* Component */
const handleSelectChannel = (value) => {
    emit('select-channel', value.label);
};
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
                <p-lazy-img v-if="channel.icon"
                            :src="assetUrlConverter(channel.icon)"
                            width="2.5rem"
                            height="2.5rem"
                            error-icon="ic_notification-protocol_envelope"
                            class="image"
                />
                <p class="leading-4">
                    {{ channel.label }}
                </p>
            </div>
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
                margin-top: 0.6rem;
            }
        }
    }
}
</style>
