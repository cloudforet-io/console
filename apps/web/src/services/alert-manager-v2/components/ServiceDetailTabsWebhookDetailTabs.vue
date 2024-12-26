<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeadingLayout, PTab, PHeading, PDefinitionTable, PStatus, PLazyImg, PMarkdown, PBadge,
} from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WebhookGetParameters } from '@/schema/alert-manager/webhook/api-verbs/get';
import type { WebhookModel } from '@/schema/alert-manager/webhook/model';
import type { PluginGetParameters } from '@/schema/repository/plugin/api-verbs/get';
import type { PluginModel } from '@/schema/repository/plugin/model';
import type { RepositoryListParameters } from '@/schema/repository/repository/api-verbs/list';
import type { RepositoryModel } from '@/schema/repository/repository/model';
import { i18n } from '@/translations';

import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { alertManagerStateFormatter } from '@/services/alert-manager-v2/composables/refined-table-data';
import { WEBHOOK_DETAIL_TABS } from '@/services/alert-manager-v2/constants/common-constant';
import { WEBHOOK_DEFINITION_FIELDS } from '@/services/alert-manager-v2/constants/webhook-table-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager-v2/stores/service-detail-page-store';
import type { WebhookDetailTabsType } from '@/services/alert-manager-v2/types/alert-manager-type';

const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const storeState = reactive({
    language: computed<string>(() => serviceDetailPageGetters.language),
    plugins: computed<PluginReferenceMap>(() => serviceDetailPageGetters.pluginsReferenceMap),
    selectedWebhookId: computed<string|undefined>(() => serviceDetailPageState.selectedWebhookId),
});
const tabState = reactive({
    webhookDetailTabs: computed<TabItem[]>(() => {
        const defaultTabs: TabItem[] = [
            { label: i18n.t('ALERT_MANAGER.ALERTS.DETAILS'), name: WEBHOOK_DETAIL_TABS.DETAIL },
        ];
        if (state.selectedPlugin?.docs && !isEmpty(state.selectedPlugin?.docs)) {
            defaultTabs.push({ label: i18n.t('ALERT_MANAGER.WEBHOOK.HELP'), name: WEBHOOK_DETAIL_TABS.HELP });
        }
        return defaultTabs;
    }),
    activeWebhookDetailTab: WEBHOOK_DETAIL_TABS.DETAIL as WebhookDetailTabsType,
});
const state = reactive({
    webhookInfo: {} as WebhookModel,
    selectedPlugin: {} as PluginModel,
});

const fetchWebhookDetail = async (selectedId: string) => {
    try {
        state.webhookInfo = await SpaceConnector.clientV2.alertManager.webhook.get<WebhookGetParameters, WebhookModel>({
            webhook_id: selectedId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.webhookInfo = {} as WebhookModel;
    }
};
const getRepositoryID = async () => {
    const res = await SpaceConnector.clientV2.repository.repository.list<RepositoryListParameters, ListResponse<RepositoryModel>>({
        repository_type: 'remote',
    });
    return res.results ? res.results[0].repository_id : '';
};
const fetchPluginInfo = async (pluginId: string) => {
    try {
        const repositoryId = await getRepositoryID();
        state.selectedPlugin = await SpaceConnector.clientV2.repository.plugin.get<PluginGetParameters, PluginModel>({
            repository_id: repositoryId,
            plugin_id: pluginId,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.selectedPlugin = {} as PluginModel;
    }
};

watch(() => state.webhookInfo.plugin_info?.plugin_id, async (pluginId) => {
    if (!pluginId) return;
    await fetchPluginInfo(pluginId);
}, { immediate: true });
watch(() => storeState.selectedWebhookId, async (selectedId) => {
    if (!selectedId) return;
    await fetchWebhookDetail(selectedId);
}, { immediate: true });
</script>

<template>
    <p-tab :key="`webhook-detail-tabs-${tabState.webhookDetailTabs.length}`"
           :tabs="tabState.webhookDetailTabs"
           :active-tab.sync="tabState.activeWebhookDetailTab"
           class="service-detail-tabs-webhook-detail-tabs"
    >
        <template #detail>
            <p-heading-layout>
                <template #heading>
                    <p-heading class="pt-8 px-4 pb-4"
                               heading-type="sub"
                               :title="$t('ALERT_MANAGER.WEBHOOK.BASE_INFO_TITLE')"
                    />
                </template>
            </p-heading-layout>
            <p-definition-table :fields="WEBHOOK_DEFINITION_FIELDS"
                                :data="state.webhookInfo"
                                :skeleton-rows="4"
                                block
            >
                <template #data-state="{data}">
                    <p-status class="capitalize"
                              v-bind="alertManagerStateFormatter(data)"
                    />
                </template>
                <template #data-plugin_info.plugin_id="{value}">
                    <div class="col-type inline-flex items-center">
                        <p-lazy-img :src="state.selectedPlugin ? state.selectedPlugin.tags?.icon : 'ic_webhook'"
                                    error-icon="ic_webhook"
                                    width="1rem"
                                    height="1rem"
                                    class="mr-2"
                        />
                        <span class="name">{{ state.selectedPlugin ? state.selectedPlugin?.name : value }}</span>
                    </div>
                </template>
            </p-definition-table>
        </template>
        <template #help>
            <div class="pt-8 pr-4 pl-4">
                <div class="flex gap-4">
                    <p-lazy-img :src="state.selectedPlugin ? state.selectedPlugin.tags?.icon : 'ic_webhook'"
                                error-icon="ic_webhook"
                                width="2rem"
                                height="2rem"
                    />
                    <div class="flex-1">
                        <p class="flex items-center gap-0.5">
                            <span class="text-label-xl font-bold">
                                {{ state.selectedPlugin?.name || state.webhookInfo?.plugin_info.plugin_id }}
                            </span>
                            <p-badge style-type="gray900"
                                     badge-type="solid-outline"
                            >
                                v {{ state.webhookInfo?.plugin_info.version }}
                            </p-badge>
                        </p>
                        <p class="text-label-sm text-gray-600">
                            {{ state.selectedPlugin.tags?.description }}
                        </p>
                    </div>
                </div>
                <div class="docs-wrapper">
                    <p-markdown :markdown="state.selectedPlugin?.docs"
                                :language="storeState.language"
                                remove-spacing
                                class="bg-violet-100 p-4 rounded-md	overflow-x-auto"
                    />
                </div>
            </div>
        </template>
    </p-tab>
</template>

<style scoped lang="postcss">
.service-detail-tabs-webhook-detail-tabs {
    .col-type {
        .name {
            margin-top: -0.125rem;
        }
    }
    .docs-wrapper {
        margin-top: 1.125rem;
    }
}
</style>
