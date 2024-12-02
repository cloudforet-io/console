<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PSelectCard, PLazyImg } from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { PluginGetVersionsParameters } from '@/schema/repository/plugin/api-verbs/get-versions';
import type { PluginListParameters } from '@/schema/repository/plugin/api-verbs/list';
import type { PluginModel } from '@/schema/repository/plugin/model';
import type { RepositoryListParameters } from '@/schema/repository/repository/api-verbs/list';
import type { RepositoryModel } from '@/schema/repository/repository/model';
import { i18n } from '@/translations';

import { assetUrlConverter } from '@/lib/helper/asset-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ServiceCreateStepContainer from '@/services/alert-manager-v2/components/ServiceCreateStepContainer.vue';
import { useServiceFormStore } from '@/services/alert-manager-v2/store/service-form-store';

const serviceFormStore = useServiceFormStore();
const serviceFormState = serviceFormStore.state;

const storeState = reactive({
    currentSubStep: computed<number>(() => serviceFormState.currentSubStep),
});
const state = reactive({
    versionLoading: false,
    webhookTypeList: [] as PluginModel[],
    isAllFormValid: false,
    selectedWebhookType: {} as PluginModel,
    pluginVersions: undefined as undefined|string,
});

const handleSelectWebhook = () => {
    state.isAllFormValid = true;
    serviceFormStore.setSelectedWebhookTypeId(state.selectedWebhookType.plugin_id);
    getVersions();
};

const getRepositoryID = async () => {
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
const getVersions = async () => {
    state.versionLoading = true;
    try {
        const { results } = await SpaceConnector.clientV2.repository.plugin.getVersions<PluginGetVersionsParameters, ListResponse<string> >({
            plugin_id: state.selectedWebhookType.plugin_id || '',
        });
        state.pluginVersions = results ? results[0] : undefined;
    } catch (e) {
        state.pluginVersions = undefined;
        ErrorHandler.handleRequestError(e, i18n.t('INVENTORY.COLLECTOR.CREATE.ALT_E_GET_VERSION_TITLE'));
    } finally {
        state.versionLoading = false;
    }
};

onMounted(async () => {
    await getListWebhookType();
});
</script>

<template>
    <service-create-step-container class="service-create-step2"
                                   :is-all-form-valid="state.isAllFormValid"
    >
        <div v-if="storeState.currentSubStep === 1"
             class="card-contents"
        >
            <p-select-card v-for="(item, index) in state.webhookTypeList"
                           :key="`webhook-${index}`"
                           v-model="state.selectedWebhookType"
                           :value="item"
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
        <div v-else-if="storeState.currentSubStep === 2">
            step 2
        </div>
    </service-create-step-container>
</template>

<style scoped lang="postcss">
.service-create-step2 {
    .card-contents {
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
}
</style>
