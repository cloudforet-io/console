<script setup lang="ts">
import { onMounted, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PSelectCard, PLazyImg,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PluginListParameters } from '@/schema/repository/plugin/api-verbs/list';
import type { PluginModel } from '@/schema/repository/plugin/model';
import type { RepositoryListParameters } from '@/schema/repository/repository/api-verbs/list';
import type { RepositoryModel } from '@/schema/repository/repository/model';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useServiceCreateFormStore } from '@/services/alert-manager-v2/stores/service-create-form-store';

const serviceFormStore = useServiceCreateFormStore();

const state = reactive({
    webhookTypeList: [] as PluginModel[],
    selectedWebhookType: {} as PluginModel,
});

const handleSelectWebhook = () => {
    serviceFormStore.setSelectedWebhookType(state.selectedWebhookType);
};

const getRepositoryID = async (): Promise<string> => {
    const res = await SpaceConnector.clientV2.repository.repository.list<RepositoryListParameters, ListResponse<RepositoryModel>>({
        repository_type: 'remote',
    });
    return res.results ? res.results[0].repository_id : '';
};
const getListWebhookType = async () => {
    try {
        const repositoryId = await getRepositoryID();
        const { results } = await SpaceConnector.clientV2.repository.plugin.list<PluginListParameters, ListResponse<PluginModel>>({
            repository_id: repositoryId,
            resource_type: 'monitoring.Webhook',
        });
        state.webhookTypeList = results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.webhookTypeList = [];
    }
};

onMounted(async () => {
    await getListWebhookType();
});
</script>

<template>
    <div class="service-create-step2-select-webhook-type">
        <p-select-card v-for="(item, index) in state.webhookTypeList"
                       :key="`webhook-${index}`"
                       v-model="state.selectedWebhookType"
                       :value="item"
                       :show-select-marker="false"
                       class="card"
                       @change="handleSelectWebhook"
        >
            <div class="card-item">
                <p-lazy-img :src="assetUrlConverter(item.tags?.icon)"
                            width="2.5rem"
                            height="2.5rem"
                            error-icon="ic_webhook"
                            class="image"
                />
                <p>{{ item.name }}</p>
            </div>
        </p-select-card>
    </div>
</template>

<style scoped lang="postcss">
.service-create-step2-select-webhook-type {
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
