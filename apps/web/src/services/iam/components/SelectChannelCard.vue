<script lang="ts" setup>
import {
    computed,
    onMounted, reactive, ref,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PSelectCard, PLazyImg } from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { NotificationProtocolListParameters } from '@/schema/alert-manager/notification-protocol/api-verbs/list';
import type { NotificationProtocolModel } from '@/schema/alert-manager/notification-protocol/model';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useNotificationChannelCreateFormStore } from '@/services/iam/store/notification-channel-create-form-store';


const notificationChannelCreateFormStore = useNotificationChannelCreateFormStore();
const notificationChannelCreateFormState = notificationChannelCreateFormStore.state;

interface ChannelCard {
  protocolList: { icon: string; label: string; value: string; }[];
  selectedProtocol: string | { icon: string; label: TranslateResult | string; value: string; };
}

const notificationProtocolList = ref<NotificationProtocolModel[]>([]);

const state = reactive<ChannelCard>({
    protocolList: computed<{ icon: string; label: string; value: string; }[]>(() => notificationProtocolList.value.map((protocol) => ({
        icon: 'ic_notification-protocol_envelope',
        label: protocol.name,
        value: protocol.protocol_id,
    }))),
    selectedProtocol: notificationChannelCreateFormState.selectedProtocol,
});

/* Component */
const handleSelectChannel = (selectedProtocol) => {
    notificationChannelCreateFormStore.setSelectedProtocol(selectedProtocol.value);
};

/* API */
const fetchNotificationProtocolList = async (params: NotificationProtocolListParameters) => {
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.notificationProtocol.list<NotificationProtocolListParameters, ListResponse<NotificationProtocolModel>>(params);
        notificationProtocolList.value = results;
    } catch (e) {
        ErrorHandler.handleError(e, true);
    }
};

/* Mounted */
onMounted(async () => {
    await fetchNotificationProtocolList({});
});
</script>

<template>
    <div class="select-channel-card">
        <p-select-card v-for="(channel, idx) in state.protocolList"
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
                margin-top: 0.6rem;
            }
        }
    }
}
</style>
