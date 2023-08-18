<script lang="ts" setup>
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
    PCopyButton,
    PSelectDropdown,
    PTableCheckModal,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { KeyItemSet } from '@spaceone/design-system/types/inputs/search/query-search/type';
import {
    reactive, computed, onActivated,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

import type { PluginReferenceMap } from '@/store/modules/reference/plugin/type';

import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { replaceUrlQuery } from '@/lib/router-query-string';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';

import { userStateFormatter } from '@/services/administration/iam/user/lib/helper';
import type { WebhookState } from '@/services/alert-manager/lib/config';
import { WEBHOOK_STATE } from '@/services/alert-manager/lib/config';
import WebhookAddFormModal from '@/services/project/project-detail/project-alert/project-webhook/modules/WebhookAddFormModal.vue';
import WebhookUpdateFormModal from '@/services/project/project-detail/project-alert/project-webhook/modules/WebhookUpdateFormModal.vue';

interface Props {
    id: string;
}

const props = defineProps<Props>();
const { t } = useI18n();
const store = useStore();
const route = useRoute();

const handlers = {
    keyItemSets: [{
        title: 'Properties',
        items: [
            { name: 'name', label: 'Name' },
            { name: 'state', label: 'State' },
            { name: 'plugin_info.plugin_id', label: 'Plugin' },
            { name: 'webhook_url', label: 'Webhook URL' },
            { name: 'created_at', label: 'Created', dataType: 'datetime' },
        ],
    }]as KeyItemSet[],
    valueHandlerMap: {
        name: makeDistinctValueHandler('monitoring.Webhook', 'name'),
        state: makeEnumValueHandler(WEBHOOK_STATE),
        'plugin_info.plugin_id': makeDistinctValueHandler('monitoring.Webhook', 'plugin_info.plugin_id'),
        webhook_url: makeDistinctValueHandler('monitoring.Webhook', 'webhook_url'),
        created_at: makeDistinctValueHandler('monitoring.Webhook', 'created_at'),
    },
};
const webhookListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('created_at', true)
    // TODO: type assertion need to be refactored
    .setFiltersAsRawQueryString(route.query.filters as undefined|string|(string|null)[]);
const state = reactive({
    hasManagePermission: useManagePermissionState(),
    loading: true,
    timezone: computed(() => store.state.user.timezone),
    plugins: computed<PluginReferenceMap>(() => store.getters['reference/pluginItems']),
    dropdown: computed(() => ([
        {
            type: 'item',
            name: 'enable',
            label: t('PROJECT.DETAIL.WEBHOOK_ENABLE'),
            disabled: state.selectedItem[0]?.state === WEBHOOK_STATE.ENABLED,
        },
        {
            type: 'item',
            name: 'disable',
            label: t('PROJECT.DETAIL.WEBHOOK_DISABLE'),
            disabled: state.selectedItem[0]?.state === WEBHOOK_STATE.DISABLED,
        },
        { type: 'divider' },
        {
            type: 'item',
            name: 'update',
            label: t('PROJECT.DETAIL.WEBHOOK_UPDATE'),
        },
        {
            type: 'item',
            name: 'delete',
            label: t('PROJECT.DETAIL.WEBHOOK_DELETE'),
        },
    ] as MenuItem[])),
    fields: [
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
        { name: 'plugin_info.plugin_id', label: 'Type' },
        { name: 'plugin_info.version', label: 'Version' },
        { name: 'webhook_url', label: 'Webhook URL' },
        { name: 'created_at', label: 'Created' },
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
    addModalVisible: false,
    updateModalVisible: false,
    deleteModalVisible: false,
});
const checkModalState = reactive({
    mode: '' as WebhookState,
    title: '' as string,
    subTitle: '' as string,
    themeColor: undefined as string | undefined,
    visible: false,
});

/* api */
let webhookListApiQuery = webhookListApiQueryHelper.data;
const listWebhooks = async () => {
    state.loading = true;
    try {
        const { results, total_count } = await SpaceConnector.client.monitoring.webhook.list({
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
        state.loading = false;
    }
};
const enableWebhook = async () => {
    try {
        await SpaceConnector.client.monitoring.webhook.enable({
            // eslint-disable-next-line camelcase
            webhook_id: state.selectedItem[0].webhook_id,
        });
        showSuccessMessage(t('PROJECT.DETAIL.ALT_S_ENABLE_WEBHOOK'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.DETAIL.ALT_E_ENABLE_WEBHOOK'));
    } finally {
        state.selectedIndex = [];
        await listWebhooks();
        checkModalState.visible = false;
    }
};
const disableWebhook = async () => {
    try {
        await SpaceConnector.client.monitoring.webhook.disable({
            // eslint-disable-next-line camelcase
            webhook_id: state.selectedItem[0].webhook_id,
        });
        showSuccessMessage(t('PROJECT.DETAIL.ALT_S_DISABLE_WEBHOOK'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.DETAIL.ALT_E_DISABLE_WEBHOOK'));
    } finally {
        state.selectedIndex = [];
        await listWebhooks();
        checkModalState.visible = false;
    }
};
const deleteWebhookConfirm = async () => {
    try {
        await SpaceConnector.client.monitoring.webhook.delete({
            webhook_id: state.selectedItem[0].webhook_id,
        });
        showSuccessMessage(t('PROJECT.DETAIL.ALT_S_DELETE_WEBHOOK'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, 'PROJECT.DETAIL.ALT_E_DELETE_WEBHOOK');
    } finally {
        await listWebhooks();
        formState.deleteModalVisible = false;
    }
};

/* event */
const onClickAdd = () => {
    formState.addModalVisible = true;
};
const checkModalConfirm = async () => {
    if (checkModalState.mode === WEBHOOK_STATE.ENABLED) await enableWebhook();
    else if (checkModalState.mode === WEBHOOK_STATE.DISABLED) await disableWebhook();
};
const onClickEnable = () => {
    checkModalState.visible = true;
    checkModalState.mode = WEBHOOK_STATE.ENABLED;
    checkModalState.title = t('PROJECT.DETAIL.MODAL_ENABLE_WEBHOOK_TITLE');
    checkModalState.subTitle = t('PROJECT.DETAIL.MODAL_ENABLE_WEBHOOK_DESC');
    checkModalState.themeColor = 'safe';
};
const onClickDisable = () => {
    checkModalState.visible = true;
    checkModalState.mode = WEBHOOK_STATE.DISABLED;
    checkModalState.title = t('PROJECT.DETAIL.MODAL_DISABLE_WEBHOOK_TITLE');
    checkModalState.subTitle = t('PROJECT.DETAIL.MODAL_DISABLE_WEBHOOK_DESC');
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
const onExport = async () => {
    await store.dispatch('file/downloadExcel', {
        url: '/monitoring/webhook/list',
        param: { project_id: props.id, query: webhookListApiQuery },
        fields: [
            { name: 'Name', key: 'name' },
            { name: 'State', key: 'state' },
            { name: 'Plugin', key: 'plugin_info.plugin_id' },
            { name: 'WebhookURL', key: 'webhook_url' },
            { name: 'Created', key: 'created_at', type: 'datetime' },
        ],
        file_name_prefix: FILE_NAME_PREFIX.projectWebhook,
    });
};
const onChange = async (options: any = {}) => {
    webhookListApiQuery = getApiQueryWithToolboxOptions(webhookListApiQueryHelper, options) ?? webhookListApiQuery;
    if (options.queryTags !== undefined) {
        await replaceUrlQuery('filters', webhookListApiQueryHelper.rawQueryStrings);
    }
    await listWebhooks();
};

/* init */
(async () => {
    await Promise.allSettled([
        store.dispatch('reference/webhook/load'),
        store.dispatch('reference/plugin/load'),
        listWebhooks(),
    ]);
})();

onActivated(() => {
    replaceUrlQuery('filters', webhookListApiQueryHelper.rawQueryStrings);
});

</script>

<template>
    <div class="project-webhook">
        <p-toolbox-table
            v-model:select-index="state.selectIndex"
            search-type="query"
            selectable
            sortable
            exportable
            :multi-select="false"
            :loading="state.loading"
            :total-count="state.totalCount"
            :items="state.items"
            :fields="state.fields"
            :query-tags="state.tags"
            :key-item-sets="handlers.keyItemSets"
            :value-handler-map="handlers.valueHandlerMap"
            :timezone="state.timezone"
            @change="onChange"
            @refresh="onChange()"
            @export="onExport"
        >
            <template #toolbox-top>
                <p-heading heading-type="sub"
                           use-total-count
                           :total-count="state.totalCount"
                           :title="t('PROJECT.DETAIL.SUBTAB_WEBHOOK')"
                />
            </template>
            <template #toolbox-left>
                <p-button class="mr-4 add-btn"
                          style-type="primary"
                          icon-left="ic_plus_bold"
                          :disabled="!state.hasManagePermission"
                          @click="onClickAdd"
                >
                    {{ t('PROJECT.DETAIL.ADD') }}
                </p-button>
                <p-select-dropdown
                    :items="state.dropdown"
                    :disabled="!state.hasManagePermission || !state.isSelectedItem"
                    @select="onSelectDropdown"
                >
                    {{ t('PROJECT.DETAIL.WEBHOOK_ACTION') }}
                </p-select-dropdown>
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
            <template #col-webhook_url-format="{ value }">
                <p-copy-button>{{ value }}</p-copy-button>
            </template>
        </p-toolbox-table>

        <webhook-add-form-modal
            v-model:visible="formState.addModalVisible"
            :project-id="id"
            @confirm="listWebhooks()"
        />
        <p-table-check-modal v-model:visible="checkModalState.visible"
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
            <template #col-webhook_url-format="{ value }">
                <p-copy-button>{{ value }}</p-copy-button>
            </template>
        </p-table-check-modal>
        <webhook-update-form-modal
            v-if="formState.updateModalVisible"
            v-model:visible="formState.updateModalVisible"
            :selected-item="state.selectedItem"
            @confirm="listWebhooks()"
        />
        <delete-modal
            v-model:visible="formState.deleteModalVisible"
            :header-title="t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_TITLE')"
            :confirm-text="t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK')"
            :disabled="!state.isNameValid"
            @confirm="deleteWebhookConfirm"
        >
            <template #default>
                <p class="desc">
                    <span>{{ t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_CONTENT_1') }} </span>
                    <strong>{{ t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_CONTENT_2') }}</strong>
                </p>
                <i18n-t keypath="PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_CONTENT_3">
                    <template #webhookName>
                        <strong>{{ state.isSelectedItem ? state.selectedItem[0].name : '' }}</strong>
                    </template>
                </i18n-t>
                <p-text-input v-model:value="state.inputWebhookName" />
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
