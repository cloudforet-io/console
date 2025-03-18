<script setup lang="ts">
import { onMounted, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PSelectCard, PLazyImg, PDataLoader,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { PluginListParameters } from '@/schema/repository/plugin/api-verbs/list';
import type { PluginModel } from '@/schema/repository/plugin/model';
import type { RepositoryListParameters } from '@/schema/repository/repository/api-verbs/list';
import type { RepositoryModel } from '@/schema/repository/repository/model';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useServiceCreateFormStore } from '@/services/alert-manager/v2/stores/service-create-form-store';

const serviceCreateFormStore = useServiceCreateFormStore();

const state = reactive({
    loading: true,
    webhookTypeList: [] as PluginModel[],
    selectedWebhookType: {} as PluginModel,
});

const handleSelectWebhook = () => {
    serviceCreateFormStore.setSelectedWebhookType(state.selectedWebhookType);
};

const getRepositoryID = async (): Promise<string> => {
    const res = await SpaceConnector.clientV2.repository.repository.list<RepositoryListParameters, ListResponse<RepositoryModel>>({
        repository_type: 'remote',
    });
    return res.results ? res.results[0].repository_id : '';
};
const getListWebhookType = async () => {
    state.loading = true;
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
    } finally {
        state.loading = false;
    }
};

onMounted(async () => {
    await getListWebhookType();
});
</script>

<template>
    <p-data-loader class="webhook-create-type-selector"
                   :loading="state.loading"
                   :data="state.webhookTypeList"
                   loader-backdrop-color="transparent"
    >
        <div class="contents">
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
    </p-data-loader>
</template>

<style scoped lang="postcss">
.webhook-create-type-selector {
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
