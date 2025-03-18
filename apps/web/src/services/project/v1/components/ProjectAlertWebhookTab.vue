<script lang="ts" setup>
import {
    reactive, computed, onActivated, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router/composables';

import {
    makeDistinctValueHandler, makeEnumValueHandler,
} from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PToolboxTable,
    PHeading,
    PButton,
    PStatus,
    PLazyImg,
    PTextInput,
    PSelectDropdown,
    PTableCheckModal,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { WebhookDeleteParameters } from '@/schema/monitoring/webhook/api-verbs/delete';
import type { WebhookDisableParameters } from '@/schema/monitoring/webhook/api-verbs/disable';
import type { WebhookEnableParameters } from '@/schema/monitoring/webhook/api-verbs/enable';
import type { WebhookListParameters } from '@/schema/monitoring/webhook/api-verbs/list';
import type { WebhookModel } from '@/schema/monitoring/webhook/model';
import { i18n as _i18n } from '@/translations';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { PluginReferenceMap } from '@/store/reference/plugin-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import { userStateFormatter } from '@/services/iam/composables/refined-table-data';
import ProjectAlertWebhookUpdateModal from '@/services/project/v1/components/ProjectAlertWebhookUpdateModal.vue';
import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';
import { useProjectDetailPageStore } from '@/services/project/v1/stores/project-detail-page-store';


const WEBHOOK_STATE = {
    ENABLED: 'ENABLED',
    DISABLED: 'DISABLED',
} as const;
type WebhookState = 'ENABLED' | 'DISABLED';
interface Props {
    id?: string;
}
const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();
const allReferenceStore = useAllReferenceStore();
const projectDetailPageStore = useProjectDetailPageStore();
const userStore = useUserStore();

const handlers = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
            { name: 'plugin_info.plugin_id', label: 'Plugin' },
        ],
    }]as KeyItemSet[],
    valueHandlerMap: {
        name: makeDistinctValueHandler('monitoring.Webhook', 'name'),
        state: makeEnumValueHandler(WEBHOOK_STATE),
        'plugin_info.plugin_id': makeDistinctValueHandler('monitoring.Webhook', 'plugin_info.plugin_id'),
    },
};
const webhookListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('created_at', true)
    .setFiltersAsRawQueryString(route.query.filters);
const state = reactive({
    loading: true,
    timezone: computed<string|undefined>(() => userStore.state.timezone),
    plugins: computed<PluginReferenceMap>(() => allReferenceStore.getters.plugin),
    dropdown: computed(() => ([
        {
            type: 'item',
            name: 'enable',
            label: _i18n.t('PROJECT.DETAIL.WEBHOOK_ENABLE'),
            disabled: state.selectedItem[0]?.state === WEBHOOK_STATE.ENABLED,
        },
        {
            type: 'item',
            name: 'disable',
            label: _i18n.t('PROJECT.DETAIL.WEBHOOK_DISABLE'),
            disabled: state.selectedItem[0]?.state === WEBHOOK_STATE.DISABLED,
        },
        { type: 'divider' },
        {
            type: 'item',
            name: 'update',
            label: _i18n.t('PROJECT.DETAIL.WEBHOOK_UPDATE'),
        },
        {
            type: 'item',
            name: 'delete',
            label: _i18n.t('PROJECT.DETAIL.WEBHOOK_DELETE'),
        },
    ] as MenuItem[])),
    fields: [
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
        { name: 'plugin_info.plugin_id', label: 'Plugin' },
        { name: 'requests.total', label: 'Total Requests' },
        { name: 'requests.error', label: 'Failed Requests' },
    ],
    items: [],
    selectIndex: [],
    selectedItem: computed(() => state.selectIndex.map((i) => state.items[i])),
    isSelectedItem: computed(() => state.selectedItem.length),
    totalCount: 0,
    tags: webhookListApiQueryHelper.setKeyItemSets(handlers.keyItemSets).queryTags,
    inputWebhookName: '',
    isNameValid: computed(() => {
        const selectedWebhook = state.selectedItem[0];
        if (!selectedWebhook) return false;
        if (state.inputWebhookName === selectedWebhook.name) return true;
        return false;
    }),
});
const formState = reactive({
    updateModalVisible: false,
    deleteModalVisible: false,
});
const checkModalState = reactive({
    mode: '' as WebhookState,
    title: '' as TranslateResult,
    subTitle: '' as TranslateResult,
    themeColor: undefined as string | undefined,
    visible: false,
});

/* api */
let webhookListApiQuery = webhookListApiQueryHelper.data;
const listWebhooks = async () => {
    state.loading = true;
    try {
        const { results, total_count } = await SpaceConnector.clientV2.monitoring.webhook.list<WebhookListParameters, ListResponse<WebhookModel>>({
            project_id: props.id,
            query: webhookListApiQuery,
        });
        state.items = results;
        state.totalCount = total_count;
        state.selectIndex = [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
        state.totalCount = 0;
    } finally {
        projectDetailPageStore.setWebhookList(state.items);
        state.loading = false;
    }
};
const enableWebhook = async () => {
    try {
        await SpaceConnector.clientV2.monitoring.webhook.enable<WebhookEnableParameters>({
            webhook_id: state.selectedItem[0].webhook_id,
        });
        showSuccessMessage(_i18n.t('PROJECT.DETAIL.ALT_S_ENABLE_WEBHOOK'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('PROJECT.DETAIL.ALT_E_ENABLE_WEBHOOK'));
    } finally {
        await listWebhooks();
        checkModalState.visible = false;
    }
};
const disableWebhook = async () => {
    try {
        await SpaceConnector.clientV2.monitoring.webhook.disable<WebhookDisableParameters>({
            webhook_id: state.selectedItem[0].webhook_id,
        });
        showSuccessMessage(_i18n.t('PROJECT.DETAIL.ALT_S_DISABLE_WEBHOOK'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, _i18n.t('PROJECT.DETAIL.ALT_E_DISABLE_WEBHOOK'));
    } finally {
        await listWebhooks();
        checkModalState.visible = false;
    }
};
const deleteWebhookConfirm = async () => {
    try {
        await SpaceConnector.clientV2.monitoring.webhook.delete<WebhookDeleteParameters>({
            webhook_id: state.selectedItem[0].webhook_id,
        });
        showSuccessMessage(_i18n.t('PROJECT.DETAIL.ALT_S_DELETE_WEBHOOK'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'PROJECT.DETAIL.ALT_E_DELETE_WEBHOOK');
    } finally {
        await listWebhooks();
        formState.deleteModalVisible = false;
    }
};

/* event */
const onClickAdd = () => {
    router.push({ name: PROJECT_ROUTE_V1.DETAIL.TAB.ALERT.WEBHOOK.CREATE._NAME });
};
const checkModalConfirm = async () => {
    if (checkModalState.mode === WEBHOOK_STATE.ENABLED) await enableWebhook();
    else if (checkModalState.mode === WEBHOOK_STATE.DISABLED) await disableWebhook();
};
const onClickEnable = () => {
    checkModalState.visible = true;
    checkModalState.mode = WEBHOOK_STATE.ENABLED;
    checkModalState.title = _i18n.t('PROJECT.DETAIL.MODAL_ENABLE_WEBHOOK_TITLE');
    checkModalState.subTitle = _i18n.t('PROJECT.DETAIL.MODAL_ENABLE_WEBHOOK_DESC');
    checkModalState.themeColor = 'safe';
};
const onClickDisable = () => {
    checkModalState.visible = true;
    checkModalState.mode = WEBHOOK_STATE.DISABLED;
    checkModalState.title = _i18n.t('PROJECT.DETAIL.MODAL_DISABLE_WEBHOOK_TITLE');
    checkModalState.subTitle = _i18n.t('PROJECT.DETAIL.MODAL_DISABLE_WEBHOOK_DESC');
    checkModalState.themeColor = 'alert';
};
const onClickUpdate = () => {
    formState.updateModalVisible = true;
};
const onClickDelete = () => {
    state.inputWebhookName = '';
    formState.deleteModalVisible = true;
};
const onSelectDropdown = (name) => {
    switch (name) {
    case 'enable': onClickEnable(); break;
    case 'disable': onClickDisable(); break;
    case 'update': onClickUpdate(); break;
    case 'delete': onClickDelete(); break;
    default: break;
    }
};
// HACK: check filed name
const onExport = async () => {
    await downloadExcel({
        url: '/monitoring/webhook/list',
        param: { project_id: props.id, query: webhookListApiQuery },
        fields: [
            { name: 'Name', key: 'name' },
            { name: 'State', key: 'state' },
            { name: 'Plugin', key: 'plugin_info.plugin_id' },
            { name: 'Total Requests', key: 'requests.total' },
            { name: 'Failed Requests', key: 'requests.error' },
        ],
        file_name_prefix: FILE_NAME_PREFIX.projectWebhook,
        timezone: state.timezone,
    });
};
const onChange = async (options: any = {}) => {
    webhookListApiQuery = getApiQueryWithToolboxOptions(webhookListApiQueryHelper, options) ?? webhookListApiQuery;
    if (options.queryTags !== undefined) {
        await replaceUrlQuery('filters', webhookListApiQueryHelper.rawQueryStrings);
    }
    await listWebhooks();
};

watch(() => state.selectIndex, (selectIndex) => {
    projectDetailPageStore.setWebhookItemIdx(selectIndex);
});

/* init */
(async () => {
    await listWebhooks();
})();

onActivated(() => {
    replaceUrlQuery('filters', webhookListApiQueryHelper.rawQueryStrings);
});
</script>

<template>
    <div class="project-webhook">
        <p-toolbox-table
            search-type="query"
            selectable
            sortable
            exportable
            :multi-select="false"
            :loading="state.loading"
            :total-count="state.totalCount"
            :items="state.items"
            :fields="state.fields"
            :select-index.sync="state.selectIndex"
            :query-tags="state.tags"
            :key-item-sets="handlers.keyItemSets"
            :value-handler-map="handlers.valueHandlerMap"
            :timezone="state.timezone"
            @change="onChange"
            @refresh="onChange()"
            @export="onExport"
        >
            <template #toolbox-top>
                <p-heading class="pt-8 px-4 pb-4"
                           heading-type="sub"
                           use-total-count
                           :total-count="state.totalCount"
                           :title="$t('PROJECT.DETAIL.SUBTAB_WEBHOOK')"
                />
            </template>
            <template #toolbox-left>
                <p-button class="mr-4 add-btn"
                          style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="onClickAdd"
                >
                    {{ $t('PROJECT.DETAIL.CREATE') }}
                </p-button>
                <p-select-dropdown
                    :menu="state.dropdown"
                    :disabled="!state.isSelectedItem"
                    reset-selection-on-menu-close
                    :placeholder="$t('PROJECT.DETAIL.WEBHOOK_ACTION')"
                    @select="onSelectDropdown"
                />
            </template>
            <template #col-plugin_info.plugin_id-format="{value}">
                <div class="col-type">
                    <p-lazy-img :src="state.plugins[value] ? state.plugins[value].icon : 'ic_webhook'"
                                error-icon="ic_webhook"
                                width="1.5rem"
                                height="1.5rem"
                                class="mr-2"
                    />
                    {{ state.plugins[value] ? state.plugins[value].label : value }}
                </div>
            </template>
            <template #col-state-format="{ value }">
                <p-status
                    class="capitalize"
                    v-bind="userStateFormatter(value)"
                />
            </template>
            <template #col-requests.total-format="{ value }">
                <span>{{ value || 0 }}</span>
            </template>
            <template #col-requests.error-format="{ value, item }">
                <span v-if="value"
                      class="col-failed-requests"
                >
                    {{ value || 0 }}
                    <span>({{ ((value / item?.requests?.total) * 100).toFixed(1) }}%)</span>
                </span>
            </template>
        </p-toolbox-table>
        <p-table-check-modal :visible.sync="checkModalState.visible"
                             :header-title="checkModalState.title"
                             :sub-title="checkModalState.subTitle"
                             :theme-color="checkModalState.themeColor"
                             :fields="state.fields"
                             :items="state.selectedItem"
                             modal-size="md"
                             @confirm="checkModalConfirm"
        >
            <template #col-plugin_info.plugin_id-format="{value}">
                <p-lazy-img :src="state.plugins[value] ? state.plugins[value].icon : 'ic_webhook'"
                            error-icon="ic_webhook"
                            width="1.5rem"
                            height="1.5rem"
                            class="mr-2"
                />
                {{ state.plugins[value] ? state.plugins[value].label : value }}
            </template>
            <template #col-state-format="{ value }">
                <p-status
                    class="capitalize"
                    v-bind="userStateFormatter(value)"
                />
            </template>
            <template #col-requests.total-format="{ value }">
                <span>{{ value || 0 }}</span>
            </template>
            <template #col-requests.error-format="{ value, item }">
                <span v-if="value"
                      class="col-failed-requests"
                >
                    {{ value || 0 }}
                    <span>({{ ((value / item?.requests?.total) * 100).toFixed(1) }}%)</span>
                </span>
            </template>
        </p-table-check-modal>
        <project-alert-webhook-update-modal
            v-if="formState.updateModalVisible"
            :visible.sync="formState.updateModalVisible"
            :selected-item="state.selectedItem"
            @confirm="listWebhooks()"
        />
        <delete-modal
            :header-title="$t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_TITLE')"
            :confirm-text="$t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK')"
            :visible.sync="formState.deleteModalVisible"
            :disabled="!state.isNameValid"
            @confirm="deleteWebhookConfirm"
        >
            <template #default>
                <p class="desc">
                    <span>{{ $t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_CONTENT_1') }} </span>
                    <strong>{{ $t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_CONTENT_2') }}</strong>
                </p>
                <i18n path="PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_CONTENT_3">
                    <template #webhookName>
                        <strong>{{ state.isSelectedItem ? state.selectedItem[0].name : '' }}</strong>
                    </template>
                </i18n>
                <p-text-input v-model="state.inputWebhookName" />
            </template>
        </delete-modal>
    </div>
</template>

<style lang="postcss" scoped>
.project-webhook {
    .p-pane-layout {
        border-width: 0;
    }

    /* custom design-system component - p-toolbox-table */
    :deep(.p-toolbox-table) {
        .p-toolbox {
            padding-top: 0;
        }
        .col-type {
            display: flex;
            align-items: center;
        }
    }
    .col-failed-requests {
        @apply text-red-500;
    }

    /* custom delete-modal */
    :deep(.delete-modal) {
        .delete-modal-content {
            @apply text-gray-900;
            margin-bottom: 1rem;
            .desc {
                margin: 2rem 0;
            }
            .p-text-input {
                @apply w-full;
                margin-top: 1rem;
            }
        }
    }
}
</style>
