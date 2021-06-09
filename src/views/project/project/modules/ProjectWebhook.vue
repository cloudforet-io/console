<template>
    <div class="project-webhook">
        <p-toolbox-table
            selectable
            sortable
            exportable
            search-type="query"
            :multi-select="false"
            :loading="loading"
            :items="items"
            :fields="fields"
            :select-index.sync="selectIndex"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :page-size.sync="pageLimit"
            :total-count="totalCount"
            :query-tags="searchTags"
            :key-item-sets="handlers.keyItemSets"
            :value-handler-map="handlers.valueHandlerMap"
            :timezone="timezone"
            @refresh="listWebhooks"
            @change="onChange"
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
                <p-dropdown-menu-btn
                    :menu="dropdown"
                    @click-update="onClickUpdate"
                    @click-delete="onClickDelete"
                >
                    {{ $t('PROJECT.DETAIL.WEBHOOK_ACTION') }}
                </p-dropdown-menu-btn>
            </template>
            <template #col-plugin_info.plugin_id-format="{index, field, item}">
                <p-lazy-img :src="item.plugin_icon"
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
        </p-toolbox-table>

        <webhook-add-form-modal
            :visible.sync="webhookAddFormVisible"
            :project-id="projectId"
            @confirm="listWebhooks()"
        />
        <webhook-update-form-modal
            v-if="webhookUpdateFormVisible"
            :visible.sync="webhookUpdateFormVisible"
            :webhook-info="selectedItems[0]"
            @confirm="listWebhooks()"
        />
        <delete-modal
            :header-title="$t('PROJECT.DETAIL.MODAL_DELETE_WEBHOOK_CONTENT')"
            :visible.sync="webhookDeleteFormVisible"
            @confirm="onDeleteConfirm"
        />
    </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    reactive, toRefs, ComponentRenderProxy, computed, getCurrentInstance,
} from '@vue/composition-api';

import {
    PToolboxTable, PPanelTop, PIconTextButton, PDropdownMenuBtn, PStatus, PLazyImg,
} from '@spaceone/design-system';
import WebhookAddFormModal from '@/views/project/project/modules/WebhookAddFormModal.vue';
import WebhookUpdateFormModal from '@/views/project/project/modules/WebhookUpdateFormModal.vue';
import DeleteModal from '@/common/modules/delete-modal/DeleteModal.vue';

import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { SpaceConnector } from '@/lib/space-connector';
import { ApiQueryHelper } from '@/lib/space-connector/helper';
import { QueryHelper } from '@/lib/query';

import { store } from '@/store';
import { userStateFormatter } from '@/views/identity/user/lib/helper';
import { replaceUrlQuery } from '@/lib/router-query-string';
import {
    iso8601Formatter, showErrorMessage, showLoadingMessage, showSuccessMessage,
} from '@/lib/util';
import {
    makeDistinctValueHandler, makeEnumValueHandler,
} from '@/lib/component-utils/query-search';
import { FILE_NAME_PREFIX } from '@/lib/type';
import { WEBHOOK_STATE } from '@/views/monitoring/alert/type';

export default {
    name: 'ProjectWebhook',
    components: {
        WebhookAddFormModal,
        WebhookUpdateFormModal,
        DeleteModal,
        PToolboxTable,
        PPanelTop,
        PIconTextButton,
        PDropdownMenuBtn,
        PStatus,
        PLazyImg,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const queryHelper = new QueryHelper();

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
            }],
            valueHandlerMap: {
                name: makeDistinctValueHandler('monitoring.Webhook', 'name'),
                state: makeEnumValueHandler(WEBHOOK_STATE),
                'plugin_info.plugin_id': makeDistinctValueHandler('monitoring.Webhook', 'plugin_info.plugin_id'),
                // 'plugin_info.plugin_id': makeReferenceValueHandler('inventory.Collector'),
                webhook_url: makeDistinctValueHandler('monitoring.Webhook', 'webhook_url'),
                created_at: makeDistinctValueHandler('monitoring.Webhook', 'created_at'),
            },
        };
        const state = reactive({
            loading: true,
            dropdown: computed(() => ([
                {
                    type: 'item',
                    name: 'update',
                    label: vm.$t('PROJECT.DETAIL.WEBHOOK_UPDATE'),
                    disabled: state.selectedItems.length !== 1,
                },
                {
                    type: 'item',
                    name: 'delete',
                    label: vm.$t('PROJECT.DETAIL.WEBHOOK_DELETE'),
                    disabled: state.selectedItems.length !== 1,
                },
            ] as MenuItem[])),
            fields: [
                { name: 'name', label: 'Name' },
                { name: 'state', label: 'State' },
                { name: 'plugin_info.plugin_id', label: 'Type' },
                { name: 'webhook_url', label: 'Webhook URL' },
                { name: 'created_at', label: 'Created' },
            ],
            items: [],
            selectIndex: [],
            selectedItems: computed(() => state.selectIndex.map(i => state.items[i])),
            sortBy: 'name',
            sortDesc: true,
            totalCount: 0,
            pageLimit: 15,
            pageStart: 1,
            searchTags: [],
            plugins: computed(() => store.state.resource.plugin.items),
            timezone: computed(() => store.state.user.timezone),
        });
        const formState = reactive({
            webhookAddFormVisible: false,
            webhookUpdateFormVisible: false,
            webhookDeleteFormVisible: false,
            visibleCustomFieldModal: false,
        });

        /* api */
        const apiQuery = new ApiQueryHelper();
        const getQuery = () => {
            apiQuery.setSort(state.sortBy, state.sortDesc)
                .setPage(state.pageStart, state.pageLimit)
                .setFiltersAsQueryTag(state.searchTags);
            return apiQuery.data;
        };
        const listWebhooks = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.monitoring.webhook.list({
                    query: getQuery(),
                });
                state.items = res.results.map(d => ({
                    ...d,
                    plugin_name: state.plugins[d.plugin_info.plugin_id]?.label,
                    plugin_icon: state.plugins[d.plugin_info.plugin_id]?.icon,
                    created_at: iso8601Formatter(d.created_at, state.timezone),
                }));
                state.totalCount = res.total_count;
                state.selectIndex = [];
            } catch (e) {
                console.error(e);
                state.items = [];
                state.totalCount = 0;
            } finally {
                state.loading = false;
            }
        };

        /* event */
        const onChange = async (changed: any = {}) => {
            if (changed.sortBy !== undefined) {
                state.sortBy = changed.sortBy;
                state.sortDesc = changed.sortDesc;
            }
            if (changed.pageStart !== undefined) state.pageStart = changed.pageStart;
            if (changed.queryTags !== undefined) state.searchTags = changed.queryTags;
            if (changed.queryTags !== undefined) {
                state.tags = changed.queryTags;
                queryHelper.setFiltersAsQueryTag(changed.queryTags);
                await replaceUrlQuery('filters', queryHelper.rawQueryStrings);
            }
            await listWebhooks();
        };
        const onClickAdd = () => {
            formState.webhookAddFormVisible = true;
        };
        const onClickUpdate = () => {
            formState.webhookUpdateFormVisible = true;
        };
        const onClickDelete = () => {
            formState.webhookDeleteFormVisible = true;
        };
        const onDeleteConfirm = async () => {
            try {
                await SpaceConnector.client.monitoring.webhook.delete({
                    webhook_id: state.selectedItems.map(d => d.webhook_id),
                });
                await listWebhooks();
                showSuccessMessage(vm.$t('PROJECT.DETAIL.ALT_S_DELETE_WEBHOOK'), '', root);
            } catch (e) {
                console.error(e);
                showErrorMessage(vm.$t('PROJECT.DETAIL.ALT_E_DELETE_WEBHOOK'), e, root);
            } finally {
                formState.webhookDeleteFormVisible = false;
            }
        };
        const onExport = async () => {
            try {
                showLoadingMessage(vm.$t('COMMON.EXCEL.ALT_L_READY_FOR_FILE_DOWNLOAD'), '', vm.$root);
                await store.dispatch('file/downloadExcel', {
                    url: '/monitoring/webhook/list',
                    param: { query: getQuery() },
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
                console.error(e);
            }
        };

        /* init */
        (async () => {
            await store.dispatch('resource/plugin/load');
            await listWebhooks();
        })();

        return {
            ...toRefs(state),
            ...toRefs(formState),
            handlers,
            userStateFormatter,
            listWebhooks,
            onClickAdd,
            onClickUpdate,
            onClickDelete,
            onDeleteConfirm,
            onExport,
            onChange,
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
}
</style>
