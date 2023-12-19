<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PButton, PDataTable, PHeading, PSelectDropdown, PStatus,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { TimeStamp } from '@/schema/_common/model';
import type { ApiKeyCreateParameters } from '@/schema/identity/api-key/api-verbs/create';
import type { ApiKeyListParameters } from '@/schema/identity/api-key/api-verbs/list';
import type { ApiKeyModel } from '@/schema/identity/api-key/model';
import { APP_STATUS_TYPE } from '@/schema/identity/app/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { hideLoadingMessage, showLoadingMessage } from '@/lib/helper/notice-alert-helper';


import UserAPIKeyModal from '@/common/components/modals/UserAPIKeyModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';

import SingleSelectStatusModal from '@/services/administration/components/SingleSelectStatusModal.vue';
import { appStateFormatter } from '@/services/administration/composables/refined-table-data';
import { useUserPageStore } from '@/services/administration/store/user-page-store';
import type { SingleSelectedData } from '@/services/administration/types/modal-type';

interface TableItem {
    project_id?: string;
    name?: string;
    date?: TimeStamp;
    key?: string;
    value?: string;
}
interface Props {
    activeTab: string;
}

const props = withDefaults(defineProps<Props>(), {
    activeTab: '',
});

const userPageStore = useUserPageStore();

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
    selectedUser: computed(() => userPageStore.selectedUsers[0]),
});
const state = reactive({
    loading: {
        list: false,
        create: false,
    },
    items: [] as ApiKeyModel[],
    selectIndex: [] as number[],
    selectItem: computed<SingleSelectedData>(() => state.items[state.selectIndex[0]]),
    apiKeyItems: {} as ApiKeyModel,
});
const modalState = reactive({
    loading: false,
    title: '',
    type: '',
    themeColor: 'primary',
    visible: {
        state: false,
        apiKey: false,
    },
});
const tableState = reactive({
    dropdownMenu: computed<MenuItem[]>(() => ([
        {
            type: 'item',
            name: 'enable',
            label: i18n.t('IDENTITY.USER.MAIN.ENABLE'),
            disabled: state.selectIndex.length !== 1 || state.selectItem.state === APP_STATUS_TYPE.ENABLED,
        },
        { type: 'divider' },
        {
            type: 'item',
            name: 'disable',
            label: i18n.t('IDENTITY.USER.MAIN.DISABLE'),
            disabled: state.selectIndex.length !== 1 || state.selectItem.state === APP_STATUS_TYPE.DISABLED,
        },
        { type: 'divider' },
        {
            type: 'item',
            name: 'delete',
            label: i18n.t('IDENTITY.USER.MAIN.DELETE'),
            disabled: state.selectIndex.length !== 1,
        },
    ])),
    field: computed(() => [
        { name: 'api_key_id', label: i18n.t('IAM.USER.MAIN.API_KEY_ID') as string },
        { name: 'state', label: i18n.t('IAM.USER.MAIN.STATE') as string },
        { name: 'expired_at', label: i18n.t('IAM.USER.MAIN.EXPIRED_AT') as string },
        { name: 'created_at', label: i18n.t('IAM.USER.MAIN.CREATED_AT') as string },
    ]),
});

/* Component */
const handleSelectDropdown = (name) => {
    switch (name) {
    case 'enable': onClickEnable(); break;
    case 'disable': onClickDisable(); break;
    case 'delete': onClickDelete(); break;
    default: break;
    }
};
const onClickEnable = async () => {
    modalState.type = 'enable';
    modalState.title = i18n.t('IDENTITY.USER.API_KEY.ENABLE_MODAL_TITLE') as string;
    modalState.themeColor = 'primary';
    modalState.visible.state = true;
};
const onClickDisable = async () => {
    modalState.type = 'disable';
    modalState.title = i18n.t('IDENTITY.USER.API_KEY.DISABLE_MODAL_TITLE') as string;
    modalState.themeColor = 'alert';
    modalState.visible.state = true;
};
const onClickDelete = async () => {
    modalState.type = 'delete';
    modalState.title = i18n.t('IDENTITY.USER.API_KEY.DELETE_MODAL_TITLE') as string;
    modalState.themeColor = 'alert';
    modalState.visible.state = true;
};
const handleCloseStatusModal = () => {
    modalState.visible.state = false;
    getApiKeyList();
};
const handleApiKeyModalVisible = (value) => {
    modalState.visible.apiKey = value;
};

/* API */
const apiKeyApiHelper = new ApiQueryHelper()
    .setPage(1, 15);
const getApiKeyList = async () => {
    state.loading.list = true;
    apiKeyApiHelper.setFilters([{ k: 'user_id', v: storeState.selectedUser.user_id || '', o: '=' }]);
    try {
        const { results } = await SpaceConnector.clientV2.identity.apiKey.list<ApiKeyListParameters, ListResponse<ApiKeyModel>>({
            query: apiKeyApiHelper.data,
        });
        if (!results) {
            state.items = [];
            return;
        }
        state.items = results?.map((k) => ({
            api_key_id: k.api_key_id,
            state: k.state,
            expired_at: k.expired_at,
            created_at: k.created_at,
        })) as TableItem[];
    } catch (e) {
        state.items = [];
    } finally {
        state.loading.list = false;
    }
};
const handleAPIKeyCreateModal = async () => {
    let loadingMessageId:string|undefined;
    try {
        state.loading.create = true;
        loadingMessageId = showLoadingMessage('Create API Key', '');
        state.apiKeyItems = await SpaceConnector.clientV2.identity.apiKey.create<ApiKeyCreateParameters, ApiKeyModel>();
        modalState.visible.apiKey = true;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.API_KEY.ALT_E_CREATE_SCHEDULER'));
    } finally {
        state.loading.create = false;
        if (loadingMessageId) hideLoadingMessage(loadingMessageId);
        await getApiKeyList();
    }
};

/* Watcher */
watch([() => props.activeTab, () => storeState.selectedUser.user_id], async () => {
    await getApiKeyList();
}, { immediate: true });
</script>

<template>
    <div class="user-management-tab-panels">
        <p-heading heading-type="sub"
                   :use-total-count="true"
                   :total-count="state.items.length"
                   :title="$t('IAM.USER.MAIN.API_KEY')"
        />
        <div class="toolbox-section">
            <div class="toolbox">
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          :loading="state.loading.create"
                          :disabled="state.items.length >= 2"
                          @click="handleAPIKeyCreateModal"
                >
                    {{ $t('IAM.USER.MAIN.ADD_API_KEY') }}
                </p-button>
                <p-select-dropdown class="dropdown-btn"
                                   :menu="tableState.dropdownMenu"
                                   :placeholder="$t('IDENTITY.USER.MAIN.ACTION')"
                                   @select="handleSelectDropdown"
                />
            </div>
            <div class="table-desc">
                {{ $t('IDENTITY.USER.MAIN.API_TABLE_DESC') }}
            </div>
        </div>
        <p-data-table :fields="tableState.field"
                      :items="state.items"
                      :loading="state.loading.list"
                      sort-by="name"
                      :multi-select="false"
                      :select-index.sync="state.selectIndex"
                      sortable
                      selectable
                      beautify-text
        >
            <template #col-state-format="{value}">
                <p-status v-bind="appStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-expired_at-format="{value}">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
        </p-data-table>
        <single-select-status-modal :type="modalState.type"
                                    :visible="modalState.visible.state"
                                    :theme-color="modalState.themeColor"
                                    :title="modalState.title"
                                    :loading="modalState.loading"
                                    :data="state.selectItem"
                                    is-summary
                                    @close="handleCloseStatusModal"
        />
        <user-a-p-i-key-modal v-if="modalState.visible.apiKey"
                              :visible="modalState.visible.apiKey"
                              :api-key-item="state.apiKeyItems"
                              @update:visible="handleApiKeyModalVisible"
        />
    </div>
</template>

<style scoped lang="postcss">
.user-management-tab-panels {
    @apply flex flex-col;
    .toolbox-section {
        @apply flex items-center justify-between;
        padding: 0.5rem 1rem 1.5rem;
        .toolbox {
            @apply flex items-center;
            gap: 1rem;
        }
        .table-desc {
            @apply text-label-md text-gray-500;
        }
    }
}
</style>
