<script lang="ts" setup>
import { reactive, watch } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { PSelectCard, PLazyImg } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';

const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();
const notificationChannelCreateFormState = notificationChannelCreateFormStore.state;

interface ChannelCard {
  channelList: { icon: string; label: TranslateResult | string }[];
  selectedProtocol: string | { icon: string; label: TranslateResult | string };
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
    selectedProtocol: notificationChannelCreateFormState.selectedProtocol,
});

/* Component */
const handleSelectChannel = (value) => {
    notificationChannelCreateFormStore.setSelectedProtocol(value);
};

/* Watcher */
watch(() => state.selectedProtocol, (nv_protocol) => {
    if (typeof nv_protocol === 'string') {
        switch (nv_protocol) {
        case i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.EMAIL'):
            state.selectedProtocol = state.channelList[0];
            break;
        case i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.SMS'):
            state.selectedProtocol = state.channelList[1];
            break;
        case i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.TELEGRAM'):
            state.selectedProtocol = state.channelList[2];
            break;
        case i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.SLACK'):
            state.selectedProtocol = state.channelList[3];
            break;
        case i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.MS_TEAMS'):
            state.selectedProtocol = state.channelList[4];
            break;
        case i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.KAKAOTALK'):
            state.selectedProtocol = state.channelList[5];
            break;
        default:
            break;
        }
    } else {
        switch (nv_protocol.label) {
        case i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.EMAIL'):
            state.selectedProtocol = state.channelList[0];
            break;
        case i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.SMS'):
            state.selectedProtocol = state.channelList[1];
            break;
        case i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.TELEGRAM'):
            state.selectedProtocol = state.channelList[2];
            break;
        case i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.SLACK'):
            state.selectedProtocol = state.channelList[3];
            break;
        case i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.MS_TEAMS'):
            state.selectedProtocol = state.channelList[4];
            break;
        case i18n.t('IAM.USER_GROUP.MODAL.CREATE_CHANNEL.LIST.KAKAOTALK'):
            state.selectedProtocol = state.channelList[5];
            break;
        default:
            break;
        }
    }
}, { deep: true, immediate: true });
</script>

<template>
    <div class="select-channel-card">
        <p-select-card v-for="(channel, idx) in state.channelList"
                       :key="`channel-${idx}`"
                       v-model="state.selectedProtocol"
                       :selected="state.selectedProtocol"
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
                margin-top: 0.6rem;
            }
        }
    }
}
</style>
