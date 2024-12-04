<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PHeadingLayout, PTab, PHeading, PDefinitionTable, PStatus, PLazyImg, PMarkdown, PBadge,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import type { PluginModel } from '@/schema/repository/plugin/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { webhookStateFormatter } from '@/services/alert-manager-v2/composables/refined-table-data';
import { WEBHOOK_DETAIL_TABS } from '@/services/alert-manager-v2/constants/alert-manager-constant';
import type { WebhookDetailTabsType } from '@/services/alert-manager-v2/types/alert-manager-type';

interface Props {
    // TODO: add type
    selectedWebhook?: any
}

const props = withDefaults(defineProps<Props>(), {
    selectedWebhook: undefined,
});

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;

const storeState = reactive({
    language: computed(() => store.state.user.language),
    plugins: computed<PluginModel[]>(() => Object.values(allReferenceGetters.plugin)),
});
const tabState = reactive({
    webhookDetailTabs: computed<TabItem[]>(() => ([
        { label: i18n.t('ALERT_MANAGER.ALERTS.DETAILS'), name: WEBHOOK_DETAIL_TABS.DETAIL },
        { label: i18n.t('ALERT_MANAGER.WEBHOOK.HELP'), name: WEBHOOK_DETAIL_TABS.HELP },
    ])),
    activeWebhookDetailTab: WEBHOOK_DETAIL_TABS.DETAIL as WebhookDetailTabsType,
});
const tableState = reactive({
    definitionFields: computed<DefinitionField[]>(() => [
        { label: 'Webhook ID', name: 'webhook_id' },
        { label: 'Name', name: 'name' },
        { label: 'State', name: 'state' },
        { label: 'Plugin', name: 'plugin_info.plugin_id' },
        { label: 'Version', name: 'plugin_info.version' },
        { label: 'Webhook URL', name: 'webhook_url' },
    ]),
});
const state = reactive({
    selectedPlugin: computed<PluginModel|undefined>(() => {
        const id = props.selectedWebhook?.plugin_info.plugin_id;
        return storeState.plugins.find((i) => i.plugin_id === id);
    }),
});
</script>

<template>
    <p-tab :tabs="tabState.webhookDetailTabs"
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
            <p-definition-table :fields="tableState.definitionFields"
                                :data="props.selectedWebhook"
                                :skeleton-rows="4"
                                block
            >
                <template #data-state="{data}">
                    <p-status class="capitalize"
                              v-bind="webhookStateFormatter(data)"
                    />
                </template>
                <template #data-plugin_info.plugin_id="{value}">
                    <div class="col-type">
                        <p-lazy-img :src="state.selectedPlugin ? state.selectedPlugin?.tags?.icon : 'ic_webhook'"
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
            <div class="help-tap">
                <div class="plugin-wrapper">
                    <p-lazy-img :src="state.selectedPlugin ? state.selectedPlugin?.tags?.icon : 'ic_webhook'"
                                error-icon="ic_webhook"
                                width="2rem"
                                height="2rem"
                    />
                    <div class="plugin-info-wrapper">
                        <p class="plugin-info">
                            <span class="name">
                                {{ state.selectedPlugin ? state.selectedPlugin?.name : props.selectedWebhook?.plugin_info.plugin_id }}
                            </span>
                            <p-badge style-type="gray900"
                                     badge-type="solid-outline"
                            >
                                v {{ props.selectedWebhook?.plugin_info.version }}
                            </p-badge>
                        </p>
                        <p class="desc">
                            {{ state.selectedPlugin?.tags?.long_description || state.selectedPlugin?.tags.description }}
                        </p>
                    </div>
                </div>
                <div class="docs-wrapper">
                    <p-markdown :markdown="state.selectedPlugin?.docs"
                                :language="storeState.language"
                                remove-spacing
                                class="markdown"
                    />
                </div>
            </div>
        </template>
    </p-tab>
</template>

<style scoped lang="postcss">
.service-detail-tabs-webhook-detail-tabs {
    .col-type {
        display: inline-flex;
        align-items: center;
        .name {
            margin-top: -0.125rem;
        }
    }
    .help-tap {
        padding-top: 2rem;
        padding-right: 1rem;
        padding-left: 1rem;
        .plugin-wrapper {
            @apply flex;
            gap: 1rem;
            .plugin-info-wrapper {
                flex: 1;
                .plugin-info {
                    @apply flex items-center;
                    gap: 0.125rem;
                    .name {
                        @apply text-label-xl font-bold;
                    }
                }
                .desc {
                    @apply text-label-sm text-gray-600;
                }
            }
        }
        .docs-wrapper {
            margin-top: 1.125rem;
            .empty {
                @apply bg-violet-100;
                padding-top: 4.125rem;
                padding-bottom: 4.125rem;
                border-radius: 0.375rem;
            }
        }
        .markdown {
            @apply bg-violet-100;
            padding: 1rem;
            border-radius: 0.375rem;
        }
    }
}
</style>
