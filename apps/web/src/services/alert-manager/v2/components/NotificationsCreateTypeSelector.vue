<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PSelectCard, PLazyImg, PDataLoader, PI,
} from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import { useNotificationProtocolListQuery } from '@/services/alert-manager/v2/composables/use-notification-protocol-list-query';
import { useServiceCreateFormStore } from '@/services/alert-manager/v2/stores/service-create-form-store';
import type { ProtocolCardItemType } from '@/services/alert-manager/v2/types/alert-manager-type';

const serviceCreateFormStore = useServiceCreateFormStore();

const { notificationProtocolListData, notificationProtocolListFetching } = useNotificationProtocolListQuery();

const state = reactive({
    loading: true,
    protocolCardList: computed<ProtocolCardItemType[]>(() => [
        ...notificationProtocolListData.value,
        {
            protocol_id: 'forward',
            name: i18n.t('ALERT_MANAGER.NOTIFICATIONS.ASSOCIATED_MEMBER'),
            icon: 'https://spaceone-custom-assets.s3.ap-northeast-2.amazonaws.com/console-assets/icons/notifications_member.svg',
        },
    ]),
    selectedProtocol: {} as ProtocolCardItemType,
});

const handleSelectProtocol = () => {
    serviceCreateFormStore.setSelectedProtocol(state.selectedProtocol);
};
</script>

<template>
    <p-data-loader class="service-create-step3-select-protocol"
                   :loading="notificationProtocolListFetching"
                   :data="state.protocolCardList"
                   loader-backdrop-color="transparent"
    >
        <div class="contents">
            <p-select-card v-for="(item, index) in state.protocolCardList"
                           :key="`protocol-${index}`"
                           v-model="state.selectedProtocol"
                           :value="item"
                           :show-select-marker="false"
                           class="card"
                           @change="handleSelectProtocol"
            >
                <div class="card-item">
                    <p-i v-if="item.protocol_id === 'forward'"
                         name="ic_notification-protocol_users"
                         width="2.5rem"
                         height="2.5rem"
                    />
                    <p-lazy-img v-else
                                :src="assetUrlConverter(item.icon || '')"
                                width="2.5rem"
                                height="2.5rem"
                                class="image"
                    />
                    <p class="text-label-md font-bold">
                        {{ item.name }}
                    </p>
                </div>
            </p-select-card>
        </div>
    </p-data-loader>
</template>

<style scoped lang="postcss">
.service-create-step3-select-protocol {
    min-height: 16rem;
    .contents {
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

        @screen tablet {
            grid-template-columns: repeat(2, 1fr);
        }

        @screen mobile {
            grid-template-columns: repeat(1, 1fr);
            .card {
                margin-right: auto;
                margin-left: auto;
            }
        }
    }
}
</style>
