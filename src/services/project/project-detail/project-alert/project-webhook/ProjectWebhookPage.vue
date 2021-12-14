<template>
    <div class="project-webhook">
        <p-toolbox-table
            search-type="query"
            selectable
            sortable
            exportable
            :multi-select="false"
            :loading="loading"
            :total-count="totalCount"
            :items="items"
            :fields="fields"
            :select-index.sync="selectIndex"
            :query-tags="tags"
            :key-item-sets="handlers.keyItemSets"
            :value-handler-map="handlers.valueHandlerMap"
            :timezone="timezone"
            @change="onChange"
            @refresh="onChange()"
            @export="onExport"
        >
            <template #toolbox-top>
                <p-panel-top
                    use-total-count
                    :total-count="totalCount"
                    :title="$t('PROJECT.DETAIL.SUBTAB_WEBHOOK')"
                />
            </template>
            <template #toolbox-left>
                <p-icon-text-button
                    class="mr-4 add-btn"
                    style-type="primary-dark"
                    name="ic_plus_bold"
                    @click="onClickAdd"
                >
                    {{ $t('PROJECT.DETAIL.ADD') }}
                </p-icon-text-button>
                <p-select-dropdown
                    :items="dropdown"
                    :disabled="!isSelectedItem"
                    @select="onSelectDropdown"
                >
                    {{ $t('PROJECT.DETAIL.WEBHOOK_ACTION') }}
                </p-select-dropdown>
            </template>
            <template #col-plugin_info.plugin_id-format="{index, field, item}">
                <p-lazy-img :src="item.plugin_icon"
                            error-icon="ic_webhook"
                            width="1.5rem" height="1.5rem" class="mr-2"
                />
                {{ item.plugin_name }}
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
            :visible.sync="addModalVisible"
            :project-id="id"
            @confirm="listWebhooks()"
        />
        <p-table-check-modal
            :visible.sync="checkModalState.visible"
            :header-title="checkModalState.title"
            :sub-title="checkModalState.subTitle"
            :theme-color="checkModalState.themeColor"
            :fields="fields"
            size="md"
            :selectable="false"
            :items="selectedItem"
            @confirm="checkModalConfirm"
        >
            <template #col-plugin_info.plugin_id-format="{index, field, item}">
                <p-lazy-img :src="item.plugin_icon"
                            error-icon="ic_webhook"
                            width="1.5rem" height="1.5rem" class="mr-2"
                />
                {{ item.plugin_name }}
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
            v-if="updateModalVisible"
            :visible.sync="updateModalVisible"
            :selected-item="selectedItem"
            @confirm="listWebhooks()"
        />
        <delete-modal
            :header-title="$t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_TITLE')"
            :confirm-text="$t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK')"
            :visible.sync="deleteModalVisible"
            :disabled="!isNameValid"
            @confirm="deleteWebhookConfirm"
        >
            <template #default>
                <p class="desc">
                    <span>{{ $t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_CONTENT_1') }} </span>
                    <strong>{{ $t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_CONTENT_2') }}</strong>
                </p>
                <i18n path="PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_CONTENT_3">
                    <template #webhookName>
                        <strong>{{ isSelectedItem ? selectedItem[0].name : '' }}</strong>
                    </template>
                </i18n>
                <p-text-input v-model="inputWebhookName" />
            </template>
        </delete-modal>
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    reactive, toRefs, ComponentRenderProxy, computed, getCurrentInstance, onActivated,
} from '@vue/composition-api';

import {
    PToolboxTable,
    PPanelTop,
    PIconTextButton,
    PStatus,
    PLazyImg,
    PTextInput,
    PCopyButton,
    PSelectDropdown,
    PTableCheckModal,
} from '@spaceone/design-system';
import WebhookAddFormModal from '@/services/project/project-detail/project-alert/project-webhook/modules/WebhookAddFormModal.vue';
import WebhookUpdateFormModal from '@/services/project/project-detail/project-alert/project-webhook/modules/WebhookUpdateFormModal.vue';
import DeleteModal from '@/common/components/modals/DeleteModal.vue';

import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';

import { store } from '@/store';
import { userStateFormatter } from '@/services/identity/user/lib/helper';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { iso8601Formatter } from '@spaceone/console-core-lib';
import { showSuccessMessage, showLoadingMessage } from '@/lib/helper/notice-alert-helper';
import {
    makeDistinctValueHandler, makeEnumValueHandler,
} from '@spaceone/console-core-lib/component-util/query-search';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { WEBHOOK_STATE } from '@/services/monitoring/alert-manager/lib/config';
import { i18n } from '@/translations';
import { getApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import { KeyItemSet } from '@spaceone/design-system/dist/src/inputs/search/query-search/type';
import { TranslateResult } from 'vue-i18n';
import ErrorHandler from '@/common/composables/error/errorHandler';

export default {
    name: 'ProjectWebhookPage',
    components: {
        WebhookAddFormModal,
        WebhookUpdateFormModal,
        DeleteModal,
        PToolboxTable,
        PPanelTop,
        PIconTextButton,
        PSelectDropdown,
        PStatus,
        PLazyImg,
        PTextInput,
        PCopyButton,
        PTableCheckModal,
    },
    props: {
        id: {
            type: String,
            default: undefined,
        },
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
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
            .setFiltersAsRawQueryString(vm.$route.query.filters);
        const state = reactive({
            loading: true,
            timezone: computed(() => store.state.user.timezone),
            plugins: computed(() => store.state.resource.plugin.items),
            dropdown: computed(() => ([
                {
                    type: 'item',
                    name: 'enable',
                    label: i18n.t('PROJECT.DETAIL.WEBHOOK_ENABLE'),
                    disabled: state.selectedItem[0]?.state === WEBHOOK_STATE.ENABLED,
                },
                {
                    type: 'item',
                    name: 'disable',
                    label: i18n.t('PROJECT.DETAIL.WEBHOOK_DISABLE'),
                    disabled: state.selectedItem[0]?.state === WEBHOOK_STATE.DISABLED,
                },
                { type: 'divider' },
                {
                    type: 'item',
                    name: 'update',
                    label: i18n.t('PROJECT.DETAIL.WEBHOOK_UPDATE'),
                },
                {
                    type: 'item',
                    name: 'delete',
                    label: i18n.t('PROJECT.DETAIL.WEBHOOK_DELETE'),
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
            selectedItem: computed(() => state.selectIndex.map(i => state.items[i])),
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
            mode: '',
            title: '' as TranslateResult,
            subTitle: '' as TranslateResult,
            themeColor: '',
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
                state.items = results.map(d => ({
                    ...d,
                    plugin_name: state.plugins[d.plugin_info.plugin_id]?.label,
                    plugin_icon: state.plugins[d.plugin_info.plugin_id]?.icon,
                    created_at: iso8601Formatter(d.created_at, state.timezone),
                }));
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
                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_ENABLE_WEBHOOK'), '', root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_ENABLE_WEBHOOK'));
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
                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_DISABLE_WEBHOOK'), '', root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_DISABLE_WEBHOOK'));
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
                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_DELETE_WEBHOOK'), '', root);
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
            checkModalState.title = i18n.t('PROJECT.DETAIL.MODAL_ENABLE_WEBHOOK_TITLE');
            checkModalState.subTitle = i18n.t('PROJECT.DETAIL.MODAL_ENABLE_WEBHOOK_DESC');
            checkModalState.themeColor = 'safe';
        };
        const onClickDisable = () => {
            checkModalState.visible = true;
            checkModalState.mode = WEBHOOK_STATE.DISABLED;
            checkModalState.title = i18n.t('PROJECT.DETAIL.MODAL_DISABLE_WEBHOOK_TITLE');
            checkModalState.subTitle = i18n.t('PROJECT.DETAIL.MODAL_DISABLE_WEBHOOK_DESC');
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
            try {
                showLoadingMessage(i18n.t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '', root);
                await store.dispatch('file/downloadExcel', {
                    url: '/monitoring/webhook/list',
                    param: { query: webhookListApiQuery },
                    fields: [
                        { name: 'Name', key: 'name' },
                        { name: 'State', key: 'state' },
                        { name: 'Plugin', key: 'plugin_info.plugin_id' },
                        { name: 'WebhookURL', key: 'webhook_url' },
                        { name: 'Created', key: 'created_at', type: 'datetime' },
                    ],
                    file_name_prefix: FILE_NAME_PREFIX.projectWebhook,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
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
            await store.dispatch('resource/plugin/load');
            await listWebhooks();
        })();

        onActivated(() => {
            replaceUrlQuery('filters', webhookListApiQueryHelper.rawQueryStrings);
        });

        return {
            ...toRefs(state),
            ...toRefs(formState),
            checkModalState,
            handlers,
            userStateFormatter,
            listWebhooks,
            onClickAdd,
            onSelectDropdown,
            deleteWebhookConfirm,
            onExport,
            onChange,
            checkModalConfirm,
        };
    },
};
</script>

<style lang="postcss" scoped>
.project-webhook {
    .p-pane-layout {
        border-width: 0;
    }
    .p-toolbox-table::v-deep {
        .p-toolbox {
            padding-top: 0;
        }
    }
    .p-button-modal::v-deep {
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
