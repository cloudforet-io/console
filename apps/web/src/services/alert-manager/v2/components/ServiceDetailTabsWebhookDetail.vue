<script setup lang="ts">
import { useElementSize } from '@vueuse/core';
import {
    computed, reactive, ref, watch,
} from 'vue';

import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHeadingLayout, PTab, PHeading, PDefinitionTable, PStatus, PLazyImg, PMarkdown, PBadge, PDataTable, PButton, PToolboxTable,
} from '@cloudforet/mirinae';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WebhookGetParameters } from '@/schema/alert-manager/webhook/api-verbs/get';
import type { WebhookListErrorSParameters } from '@/schema/alert-manager/webhook/api-verbs/list-errors';
import type { WebhookUpdateMessageFormatParameters } from '@/schema/alert-manager/webhook/api-verbs/update-message-format';
import type { WebhookModel, WebhookListErrorsModel } from '@/schema/alert-manager/webhook/model';
import type { WebhookMessageFormatType } from '@/schema/alert-manager/webhook/type';
import type { PluginGetParameters } from '@/schema/repository/plugin/api-verbs/get';
import type { PluginModel } from '@/schema/repository/plugin/model';
import type { RepositoryListParameters } from '@/schema/repository/repository/api-verbs/list';
import type { RepositoryModel } from '@/schema/repository/repository/model';
import { i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { CloudServiceTypeReferenceMap } from '@/store/reference/cloud-service-type-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { usePageEditableStatus } from '@/common/composables/page-editable-status';
import { useQueryTags } from '@/common/composables/query-tags';
import { sortTableItems } from '@/common/utils/table-sort';

import ServiceDetailTabsWebhookDetailMessageOverlay
    from '@/services/alert-manager/v2/components/ServiceDetailTabsWebhookDetailMessageOverlay.vue';
import ServiceDetailTabsWebhookDetailRawDataModal
    from '@/services/alert-manager/v2/components/ServiceDetailTabsWebhookDetailRawDataModal.vue';
import { alertManagerStateFormatter } from '@/services/alert-manager/v2/composables/refined-table-data';
import { WEBHOOK_DETAIL_TABS } from '@/services/alert-manager/v2/constants/common-constant';
import {
    WEBHOOK_DEFINITION_FIELDS, WEBHOOK_ERROR_TABLE_KEY_ITEM_SETS, WEBHOOK_MESSAGE_TABLE_FIELDS,
} from '@/services/alert-manager/v2/constants/webhook-table-constant';
import { useServiceDetailPageStore } from '@/services/alert-manager/v2/stores/service-detail-page-store';
import type { WebhookDetailTabsType } from '@/services/alert-manager/v2/types/alert-manager-type';

const EXTRA_WIDTH = 315; // created_at width + show_button width + padding

const allReferenceStore = useAllReferenceStore();
const allReferenceGetters = allReferenceStore.getters;
const serviceDetailPageStore = useServiceDetailPageStore();
const serviceDetailPageState = serviceDetailPageStore.state;
const serviceDetailPageGetters = serviceDetailPageStore.getters;

const { hasReadWriteAccess } = usePageEditableStatus();

const errorTableRef = ref<HTMLElement|null>(null);

const { width } = useElementSize(errorTableRef);

const storeState = reactive({
    cloudServiceTypeInfo: computed<CloudServiceTypeReferenceMap>(() => allReferenceGetters.cloudServiceType),
    language: computed<string>(() => serviceDetailPageGetters.language),
    timezone: computed<string>(() => serviceDetailPageGetters.timezone),
    plugins: computed<PluginReferenceMap>(() => serviceDetailPageGetters.pluginsReferenceMap),
    selectedWebhookId: computed<string|undefined>(() => serviceDetailPageState.selectedWebhookId),
});
const tabState = reactive({
    webhookDetailTabs: computed<TabItem[]>(() => {
        const defaultTabs: TabItem[] = [
            { label: i18n.t('ALERT_MANAGER.ALERTS.DETAILS'), name: WEBHOOK_DETAIL_TABS.DETAIL },
        ];
        if (state.selectedPlugin?.docs && !isEmpty(state.selectedPlugin.docs)) {
            defaultTabs.push({ label: i18n.t('ALERT_MANAGER.WEBHOOK.HELP'), name: WEBHOOK_DETAIL_TABS.HELP });
        }
        const additionalTabs: TabItem[] = [
            { label: i18n.t('ALERT_MANAGER.WEBHOOK.ERROR'), name: WEBHOOK_DETAIL_TABS.ERROR },
            { label: i18n.t('ALERT_MANAGER.WEBHOOK.MSG_FORMAT'), name: WEBHOOK_DETAIL_TABS.MESSAGE },
        ];

        return [...defaultTabs, ...additionalTabs];
    }),
    webhookErrorTableFields: computed<DataTableFieldType[]>(() => ([
        { name: 'created_at', label: 'Created', width: '11rem' },
        {
            name: 'message', label: 'Error Message', width: `${width.value - EXTRA_WIDTH}px`, sortable: false,
        },
        {
            name: 'show_button', label: ' ', width: '6.625rem', sortable: false,
        },
    ])),
    activeWebhookDetailTab: WEBHOOK_DETAIL_TABS.DETAIL as WebhookDetailTabsType,
});
const state = reactive({
    webhookInfo: {} as WebhookModel,
    rawDataModalVisible: false,
    rawData: {} as Record<string, any>,
    selectedPlugin: {} as PluginModel,
    errorListLoading: false,
    errorList: [] as WebhookListErrorsModel[],
    refinedErrorList: computed<WebhookListErrorsModel[]>(() => state.errorList.map((i, idx) => ({
        number: idx + 1,
        ...i,
    }))),
    errorTotalCount: 0,
});
const messageState = reactive({
    loading: false,
    formatList: [] as WebhookMessageFormatType[],
    editFormVisible: false,
    sortBy: 'created_at',
    sortDesc: true,
    formats: {},
});

const errorListApiQueryHelper = new ApiQueryHelper().setSort('created_at', true)
    .setPage(1, 15);
const queryTagHelper = useQueryTags({ keyItemSets: WEBHOOK_ERROR_TABLE_KEY_ITEM_SETS });
const { queryTags } = queryTagHelper;

const handleClickShowRawData = (item) => {
    state.rawDataModalVisible = true;
    state.rawData = item.raw_data;
};
const handleEditMessageFormat = (value) => {
    messageState.editFormVisible = value;
};
const handleChangeMessageSort = (sortBy, sortDesc) => {
    messageState.sortBy = sortBy;
    messageState.sortDesc = sortDesc;
    messageState.formatList = sortTableItems<WebhookMessageFormatType>(messageState.formatList, sortBy, sortDesc);
};
const handleChange = async (options: any = {}) => {
    if (options.sortBy !== undefined) errorListApiQueryHelper.setSort(options.sortBy, options.sortDesc);
    if (options.queryTags !== undefined) queryTagHelper.setQueryTags(options.queryTags);
    if (options.pageStart !== undefined) errorListApiQueryHelper.setPageStart(options.pageStart);
    if (options.pageLimit !== undefined) errorListApiQueryHelper.setPageLimit(options.pageLimit);
    await fetchWebhookErrorList();
};

const fetchWebhookDetail = async () => {
    if (!storeState.selectedWebhookId) return;
    try {
        state.webhookInfo = await SpaceConnector.clientV2.alertManager.webhook.get<WebhookGetParameters, WebhookModel>({
            webhook_id: storeState.selectedWebhookId,
        });
        messageState.formatList = state.webhookInfo.message_formats || [];
        messageState.formats = state.webhookInfo.message_formats?.map((i) => ({ [i.from]: i.to })).reduce((acc, cur) => ({ ...acc, ...cur }), {});
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
const fetchPluginInfo = async () => {
    try {
        const repositoryId = await getRepositoryID();
        state.selectedPlugin = await SpaceConnector.clientV2.repository.plugin.get<PluginGetParameters, PluginModel>({
            repository_id: repositoryId,
            plugin_id: state.webhookInfo.plugin_info?.plugin_id,
        });
    } catch (e) {
        ErrorHandler.handleError(e);
        state.selectedPlugin = {} as PluginModel;
    }
};
const fetchWebhookErrorList = async () => {
    if (!storeState.selectedWebhookId) return;
    state.errorListLoading = true;
    try {
        errorListApiQueryHelper.setFilters([
            ...queryTagHelper.filters.value,
        ]);
        const { results, total_count } = await SpaceConnector.clientV2.alertManager.webhook.listErrors<WebhookListErrorSParameters, ListResponse<WebhookListErrorsModel>>({
            webhook_id: storeState.selectedWebhookId,
            query: errorListApiQueryHelper.data,
        });
        state.errorList = results || [];
        state.errorTotalCount = total_count || 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.errorList = [];
        state.errorTotalCount = 0;
    } finally {
        state.errorListLoading = false;
    }
};
const fetchMessageUpdate = async (tags) => {
    messageState.loading = true;
    try {
        await SpaceConnector.clientV2.alertManager.webhook.updateMessageFormat<WebhookUpdateMessageFormatParameters, WebhookModel>({
            webhook_id: state.webhookInfo.webhook_id,
            message_formats: Object.entries(tags).map(([key, value]) => ({
                from: key,
                to: value,
            })) as WebhookMessageFormatType[],
        });
        await handleEditMessageFormat(false);
        await fetchWebhookDetail();
    } catch (e) {
        ErrorHandler.handleError(e, true);
    } finally {
        messageState.loading = false;
    }
};

watch(() => tabState.activeWebhookDetailTab, (activeTab) => {
    if (activeTab === WEBHOOK_DETAIL_TABS.ERROR) {
        fetchWebhookErrorList();
    }
});
watch(() => storeState.selectedWebhookId, async () => {
    await fetchWebhookDetail();
    if (isEmpty(state.webhookInfo)) return;
    await fetchWebhookErrorList();
    if (!state.webhookInfo.plugin_info?.plugin_id) return;
    await fetchPluginInfo();
}, { immediate: true });
</script>

<template>
    <p-tab :key="`webhook-detail-tabs-${tabState.webhookDetailTabs?.length}`"
           :tabs="tabState.webhookDetailTabs"
           :active-tab.sync="tabState.activeWebhookDetailTab"
           class="service-detail-tabs-webhook-detail-tabs"
    >
        <template v-if="tabState.activeWebhookDetailTab === WEBHOOK_DETAIL_TABS.DETAIL"
                  #detail
        >
            <div>
                <p-heading-layout>
                    <template #heading>
                        <p-heading class="heading"
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
            </div>
        </template>
        <template v-if="tabState.activeWebhookDetailTab === WEBHOOK_DETAIL_TABS.HELP"
                  #help
        >
            <div class="heading">
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
        <template v-if="tabState.activeWebhookDetailTab === WEBHOOK_DETAIL_TABS.ERROR"
                  #error
        >
            <div>
                <p-heading-layout>
                    <template #heading>
                        <p-heading :title="$t('ALERT_MANAGER.WEBHOOK.ERROR_LIST')"
                                   use-total-count
                                   :total-count="state.errorTotalCount"
                                   heading-type="sub"
                                   class="heading error"
                        />
                    </template>
                </p-heading-layout>
                <p-toolbox-table ref="errorTableRef"
                                 searchable
                                 sortable
                                 search-type="query"
                                 sort-by="created_at"
                                 :query-tags="queryTags"
                                 :loading="state.errorListLoading"
                                 :total-count="state.errorTotalCount"
                                 :fields="tabState.webhookErrorTableFields"
                                 :items="state.refinedErrorList"
                                 class="w-full border-none"
                                 @change="handleChange"
                                 @refresh="fetchWebhookErrorList"
                >
                    <template #col-created_at-format="{ value }">
                        {{ iso8601Formatter(value, storeState.timezone) }}
                    </template>
                    <template #col-message-format="{ value }">
                        <p class="truncate"
                           :style="{'max-width': width - EXTRA_WIDTH + 'px'}"
                        >
                            {{ value }}
                        </p>
                    </template>
                    <template #col-show_button-format="{ item }">
                        <p-button style-type="tertiary"
                                  size="sm"
                                  class="ml-2.5"
                                  @click="handleClickShowRawData(item)"
                        >
                            {{ $t('ALERT_MANAGER.WEBHOOK.SHOW_ALL') }}
                        </p-button>
                    </template>
                </p-toolbox-table>
                <service-detail-tabs-webhook-detail-raw-data-modal :visible.sync="state.rawDataModalVisible"
                                                                   :raw-data="state.rawData"
                />
            </div>
        </template>
        <template v-if="tabState.activeWebhookDetailTab === WEBHOOK_DETAIL_TABS.MESSAGE"
                  #message
        >
            <div>
                <p-heading-layout class="heading">
                    <template #heading>
                        <p-heading :title="$t('ALERT_MANAGER.WEBHOOK.MSG_FORMAT')"
                                   use-total-count
                                   :total-count="messageState.formatList?.length"
                                   heading-type="sub"
                        />
                    </template>
                    <template v-if="hasReadWriteAccess"
                              #extra
                    >
                        <p-button style-type="secondary"
                                  icon-left="ic_edit"
                                  @click="handleEditMessageFormat(true)"
                        >
                            {{ $t('COMMON.TAGS.EDIT') }}
                        </p-button>
                    </template>
                </p-heading-layout>
                <p-data-table :fields="WEBHOOK_MESSAGE_TABLE_FIELDS"
                              :items="messageState.formatList"
                              :sort-by="messageState.sortBy"
                              :sort-desc="messageState.sortDesc"
                              sortable
                              beautify-text
                              @changeSort="handleChangeMessageSort"
                />
                <transition name="slide-up">
                    <service-detail-tabs-webhook-detail-message-overlay v-if="messageState.editFormVisible"
                                                                        :formats="messageState.formats"
                                                                        :loading="messageState.loading"
                                                                        @close="handleEditMessageFormat(false)"
                                                                        @confirm="fetchMessageUpdate"
                    />
                </transition>
            </div>
        </template>
    </p-tab>
</template>

<style scoped lang="postcss">
.service-detail-tabs-webhook-detail-tabs {
    .heading {
        @apply pt-8 px-4 pb-4;
        &.error {
            @apply pb-0;
        }
    }
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
