<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PSelectCard, PLazyImg, PDataLoader,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { NotificationProtocolListParameters } from '@/schema/alert-manager/notification-protocol/api-verbs/list';
import type { NotificationProtocolModel } from '@/schema/alert-manager/notification-protocol/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import { assetUrlConverter } from '@/lib/helper/asset-helper';


import ErrorHandler from '@/common/composables/error/errorHandler';

import { useServiceCreateFormStore } from '@/services/alert-manager/stores/service-create-form-store';
import type { ProtocolCardItemType } from '@/services/alert-manager/types/alert-manager-type';

const serviceCreateFormStore = useServiceCreateFormStore();
const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const storeState = reactive({
    plugins: computed<PluginReferenceMap>(() => allReferenceGetters.plugin),
});
const state = reactive({
    loading: true,
    protocolList: [] as NotificationProtocolModel[],
    protocolCardList: computed<ProtocolCardItemType[]>(() => [
        ...state.protocolList.map((item) => ({
            ...item,
            icon: storeState.plugins[item.plugin_info.plugin_id]?.icon || '',
        })),
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

const fetchNotificationProtocolList = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.clientV2.alertManager.notificationProtocol.list<NotificationProtocolListParameters, ListResponse<NotificationProtocolModel>>();
        state.protocolList = results || [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.protocolList = [];
    } finally {
        state.loading = false;
    }
};

onMounted(() => {
    fetchNotificationProtocolList();
});
</script>

<template>
    <p-data-loader class="service-create-step3-select-protocol"
                   :loading="state.loading"
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
                    <p-lazy-img :src="assetUrlConverter(item.icon || '')"
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
