<script setup lang="ts">

import {
    computed, onMounted, reactive, watch,
} from 'vue';

import { isEmpty } from 'lodash';

import {
    PBadge, PLazyImg, PDefinitionTable, PHeading, PHorizontalLayout, PMarkdown, PStatus, PTab,
} from '@cloudforet/mirinae';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import type { WebhookModel } from '@/schema/monitoring/webhook/model.js';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store.js';

import { useProxyValue } from '@/common/composables/proxy-state';

import { userStateFormatter } from '@/services/iam/composables/refined-table-data.js';
import ProjectDetailTab from '@/services/project/v1/components/ProjectDetailTab.vue';
import { useProjectDetailPageStore } from '@/services/project/v1/stores/project-detail-page-store.js';
import type { WebhookType } from '@/services/project/v1/types/project-alert-type';

interface Props {
    id?: string;
    tabs: TabItem[];
    activeTab: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{(e: 'update:active-tab', value: string): void;}>();

const userStore = useUserStore();
const projectDetailPageStore = useProjectDetailPageStore();
const projectDetailPageState = projectDetailPageStore.state;
const projectDetailPageGetters = projectDetailPageStore.getters;

const storeState = reactive({
    selectedWebhookItem: computed<WebhookModel|undefined>(() => projectDetailPageGetters.selectedWebhookItem),
    language: computed<string|undefined>(() => userStore.state.language),
});

const state = reactive({
    proxyActiveTab: useProxyValue('activeTab', props, emit),
    item: computed<ProjectModel | undefined>(() => projectDetailPageState.currentProject),
    selectedPlugin: computed<WebhookType|undefined>(() => {
        const id = storeState.selectedWebhookItem?.plugin_info.plugin_id;
        return state.webhookTypeList.find((i) => i.plugin_id === id);
    }),
    webhookTypeList: [] as WebhookType[],
    webhookDetailTab: computed<TabItem[]>(() => {
        const defaultTab = [{
            name: 'details',
            label: i18n.t('MONITORING.ALERT.DETAIL.DETAILS.DETAILS'),
        }];
        if (state.selectedPlugin?.docs && !isEmpty(state.selectedPlugin?.docs)) {
            defaultTab.push({
                name: 'help',
                label: i18n.t('PROJECT.DETAIL.HELP'),
            });
        }
        return defaultTab;
    }),
    webhookDetailActiveTab: 'details',

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

watch(() => projectDetailPageState.projectId, async (projectId) => {
    if (projectId) {
        await projectDetailPageStore.getAlertCounts(projectId);
    }
});
watch(() => storeState.selectedWebhookItem, () => {
    state.webhookDetailActiveTab = 'details';
}, { immediate: true });
onMounted(async () => {
    state.webhookTypeList = await projectDetailPageStore.getListWebhookType();
});
</script>

<template>
    <div class="project-alert-tab">
        <p-horizontal-layout class="page-inner"
                             :height="522"
        >
            <template #container="{ height }">
                <project-detail-tab :id="props.id"
                                    :style="{ height: `${height}px` }"
                                    :item="state.item"
                                    :tabs="props.tabs"
                                    :active-tab.sync="state.proxyActiveTab"
                />
            </template>
        </p-horizontal-layout>
        <p-tab v-if="storeState.selectedWebhookItem"
               :tabs="state.webhookDetailTab"
               :active-tab.sync="state.webhookDetailActiveTab"
        >
            <template #details>
                <p-heading class="pt-8 px-4 pb-4"
                           heading-type="sub"
                           :title="$t('PROJECT.DETAIL.MEMBER.BASE_INFORMATION')"
                />
                <p-definition-table :fields="tableState.definitionFields"
                                    :data="storeState.selectedWebhookItem"
                                    :skeleton-rows="4"
                                    block
                >
                    <template #data-state="{data}">
                        <p-status
                            class="capitalize"
                            v-bind="userStateFormatter(data)"
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
                                    {{ state.selectedPlugin ? state.selectedPlugin?.name : storeState.selectedWebhookItem?.plugin_info.plugin_id }}
                                </span>
                                <p-badge style-type="gray900"
                                         badge-type="solid-outline"
                                >
                                    v {{ storeState.selectedWebhookItem?.plugin_info.version }}
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
    </div>
</template>

<style lang="postcss" scoped>
.project-alert-tab {
    .page-inner {
        height: 100%;
        max-width: 85.5rem;
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
