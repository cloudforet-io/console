<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import {
    PDataLoader,
    PLazyImg,
    PSelectCard,
} from '@cloudforet/mirinae';

import { usePluginApi } from '@/api-clients/repository/plugin/composables/use-plugin-api';
import type { PluginModel } from '@/api-clients/repository/plugin/schema/model';
import { useRepositoryApi } from '@/api-clients/repository/repository/composables/use-repository-api';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';

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

const queryClient = useQueryClient();
const { repositoryAPI } = useRepositoryApi();
const { pluginAPI } = usePluginApi();
const { key: repositoryQueryKey, params: repositoryQueryParams } = useServiceQueryKey('repository', 'repository', 'list', {
    params: computed(() => ({
        repository_type: 'remote',
    })),
});
const { key: pluginQueryKey, params: pluginQueryParams } = useServiceQueryKey('repository', 'plugin', 'list', {
    params: computed(() => ({
        resource_type: 'monitoring.Webhook',
    })),
});
const getRepositoryID = async (): Promise<string> => {
    const res = await queryClient.fetchQuery({
        queryKey: repositoryQueryKey.value,
        queryFn: () => repositoryAPI.list(repositoryQueryParams.value),
        gcTime: 1000 * 60 * 2,
        staleTime: 1000 * 60 * 2,
    });
    return res.results ? res.results[0].repository_id : '';
};
const getListWebhookType = async () => {
    state.loading = true;
    try {
        const repositoryId = await getRepositoryID();
        const { results } = await queryClient.fetchQuery({
            queryKey: pluginQueryKey.value,
            queryFn: () => pluginAPI.list({
                ...pluginQueryParams.value,
                repository_id: repositoryId,
            }),
            gcTime: 1000 * 60 * 2,
            staleTime: 1000 * 60 * 2,
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
