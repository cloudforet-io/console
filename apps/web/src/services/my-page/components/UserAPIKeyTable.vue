<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import type { ComputedRef, UnwrapRef } from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PButton, PDataTable, PPaneLayout, PTableCheckModal, PStatus, PSelectDropdown,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ApiKeyCreateParameters } from '@/schema/identity/api-key/api-verbs/create';
import type { ApiKeyDeleteParameters } from '@/schema/identity/api-key/api-verbs/delete';
import type { ApiKeyDisableParameters } from '@/schema/identity/api-key/api-verbs/disable';
import type { ApiKeyEnableParameters } from '@/schema/identity/api-key/api-verbs/enable';
import type { ApiKeyListParameters, ApiKeyListResponse } from '@/schema/identity/api-key/api-verbs/list';
import type { ApiKeyModel } from '@/schema/identity/api-key/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import {
    showSuccessMessage, showLoadingMessage, hideLoadingMessage,
} from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { userStateFormatter } from '@/services/administration/composables/refined-table-data';
import UserAPIKeyModal from '@/services/my-page/components/UserAPIKeyModal.vue';

type CheckModalMode = 'enable' | 'disable' | 'delete';

const props = defineProps<{
    userId: string;
    disabled?: boolean;
}>();

interface State {
    loading: boolean;
    fields: DataTableField[];
    items: ApiKeyModel[];
    selectedIndex: number[];
    selectedItems: ComputedRef<ApiKeyModel[]>;
    dropdownMenu: ComputedRef<MenuItem[]>;
    visible: boolean;
    user: string;
    timezone: ComputedRef<string>;
    disableCreateBtn: ComputedRef<boolean>;
}
const state = reactive({
    loading: false,
    fields: [
        { name: 'api_key_id', label: 'API Key ID' },
        { name: 'state', label: 'State' },
        { name: 'created_at', label: 'Created' },
    ],
    items: [],
    selectedIndex: [],
    selectedItems: computed(() => state.selectedIndex.map((i) => state.items[i])),
    dropdownMenu: computed(() => ([
        {
            type: 'item',
            name: 'enable',
            label: i18n.t('IDENTITY.USER.MAIN.ENABLE'),
            disabled: state.selectedIndex.length !== 1 || state.selectedItems[0].state === 'ENABLED',
        },
        { type: 'divider' },
        {
            type: 'item',
            name: 'disable',
            label: i18n.t('IDENTITY.USER.MAIN.DISABLE'),
            disabled: state.selectedIndex.length !== 1 || state.selectedItems[0].state === 'DISABLED',
        },
        { type: 'divider' },
        {
            type: 'item', name: 'delete', label: i18n.t('IDENTITY.USER.MAIN.DELETE'), disabled: state.selectedIndex.length !== 1,
        },
    ])),
    visible: false,
    user: props.userId || '',
    timezone: computed(() => store.state.user.timezone),
    disableCreateBtn: computed(() => state.items.length >= 2 || !!props.disabled),
}) as UnwrapRef<State>;

interface ModalState {
    visible: boolean;
    loading: boolean;
    item?: ApiKeyModel;
}
const modalState = reactive({
    visible: false,
    loading: false,
    item: undefined,
}) as UnwrapRef<ModalState>;


interface CheckModalState {
    fields: DataTableField[];
    mode?: CheckModalMode;
    title: TranslateResult;
    subTitle: TranslateResult;
    themeColor?: string;
    visible: boolean;
    loading: boolean;
}
const checkModalState = reactive({
    fields: [
        { name: 'api_key_id', label: 'API Key ID' },
        { name: 'state', label: 'State' },
        { name: 'created_at', label: 'Created' },
    ],
    mode: undefined,
    title: '',
    subTitle: '',
    themeColor: undefined,
    visible: false,
    loading: false,
}) as UnwrapRef<CheckModalState>;

const apiQueryHelper = new ApiQueryHelper();
const listAPIKey = async (userId) => {
    state.loading = true;
    try {
        apiQueryHelper.setSort('created_at')
            .setFilters([{ k: 'user_id', v: userId, o: '=' }]);

        const res = await SpaceConnector.clientV2.identity.apiKey.list<ApiKeyListParameters, ApiKeyListResponse>({
            query: apiQueryHelper.data,
        });
        state.items = res.results ?? [];
    } catch (e) {
        ErrorHandler.handleError(e);
        state.items = [];
    } finally {
        state.loading = false;
    }
};

const openAPIKeyConfirmModal = async () => {
    let loadingMessageId:string|undefined;
    try {
        modalState.loading = true;
        loadingMessageId = showLoadingMessage('Create API Key', '');
        const resp = await SpaceConnector.clientV2.identity.apiKey.create<ApiKeyCreateParameters, ApiKeyModel>({
            user_id: state.user,
        });
        modalState.item = resp;
        modalState.visible = true;
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.API_KEY.ALT_E_CREATE_SCHEDULER'));
    } finally {
        modalState.loading = false;
        if (loadingMessageId) hideLoadingMessage(loadingMessageId);
        await listAPIKey(state.user);
    }
};

const confirm = () => {
    modalState.visible = false;
};

const enableAPIKey = async (item: ApiKeyModel) => {
    try {
        await SpaceConnector.clientV2.identity.apiKey.enable<ApiKeyEnableParameters, ApiKeyModel>({
            api_key_id: item[0].api_key_id,
        });
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_ENABLE_API_KEY'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.MAIN.ALT_S_ENABLE_API_KEY'));
    } finally {
        await listAPIKey(state.user);
        checkModalState.visible = false;
    }
};
const disableAPIKey = async (item: ApiKeyModel) => {
    try {
        await SpaceConnector.clientV2.identity.apiKey.disable<ApiKeyDisableParameters, ApiKeyModel>({
            api_key_id: item[0].api_key_id,
        });
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_DISABLE_API_KEY'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.MAIN.ALT_E_DISABLE_API_KEY'));
    } finally {
        await listAPIKey(state.user);
        checkModalState.visible = false;
    }
};
const deleteAPIKey = async (item: ApiKeyModel) => {
    try {
        await SpaceConnector.clientV2.identity.apiKey.delete<ApiKeyDeleteParameters, ApiKeyModel>({
            api_key_id: item[0].api_key_id,
        });
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_DELETE_API_KEY'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, i18n.t('IDENTITY.USER.MAIN.ALT_E_DELETE_API_KEY'));
    } finally {
        state.selectedIndex = [];
        await listAPIKey(state.user);
        checkModalState.visible = false;
    }
};

const onClickEnable = async () => {
    checkModalState.mode = 'enable';
    checkModalState.title = i18n.t('IDENTITY.USER.API_KEY.ENABLE_MODAL_TITLE') as string;
    checkModalState.subTitle = i18n.tc('IDENTITY.USER.API_KEY.ENABLE_MODAL_DESC', state.selectedIndex.length);
    checkModalState.themeColor = 'safe';
    checkModalState.visible = true;
};

const onClickDisable = async () => {
    checkModalState.mode = 'disable';
    checkModalState.title = i18n.t('IDENTITY.USER.API_KEY.DISABLE_MODAL_TITLE') as string;
    checkModalState.subTitle = i18n.tc('IDENTITY.USER.API_KEY.DISABLE_MODAL_DESC', state.selectedIndex.length);
    checkModalState.themeColor = 'alert';
    checkModalState.visible = true;
};

const onClickDelete = async () => {
    checkModalState.mode = 'delete';
    checkModalState.title = i18n.t('IDENTITY.USER.API_KEY.DELETE_MODAL_TITLE') as string;
    checkModalState.subTitle = i18n.tc('IDENTITY.USER.API_KEY.DELETE_MODAL_DESC', state.selectedIndex.length);
    checkModalState.themeColor = 'alert';
    checkModalState.visible = true;
};

const onSelectDropdown = (name) => {
    switch (name) {
    case 'enable': onClickEnable(); break;
    case 'disable': onClickDisable(); break;
    case 'delete': onClickDelete(); break;
    default: break;
    }
};

const checkModalConfirm = async (item: ApiKeyModel) => {
    checkModalState.loading = true;
    if (checkModalState.mode === 'delete') await deleteAPIKey(item);
    else if (checkModalState.mode === 'enable') await enableAPIKey(item);
    else if (checkModalState.mode === 'disable') await disableAPIKey(item);
    checkModalState.loading = false;
};


watch(() => props.userId, async (userId) => {
    if (userId) {
        state.user = userId;
        await Promise.all([
            listAPIKey(state.user),
        ]);
    }
}, { immediate: true });

</script>

<template>
    <section class="right-contents-container">
        <p-pane-layout class="main-table-wrapper">
            <article class="table-header">
                <div class="left-section">
                    <p-button style-type="primary"
                              icon-left="ic_plus_bold"
                              :disabled="state.disableCreateBtn"
                              :loading="modalState.loading"
                              @click="openAPIKeyConfirmModal"
                              @confirm="confirm"
                    >
                        {{ $t('IDENTITY.USER.MAIN.CREATE_API_KEY') }}
                    </p-button>
                    <p-select-dropdown class="dropdown-btn"
                                       :menu="state.dropdownMenu"
                                       :disabled="props.disabled"
                                       :placeholder="$t('IDENTITY.USER.MAIN.ACTION')"
                                       @select="onSelectDropdown"
                    />
                </div>
                <div class="table-desc">
                    {{ $t('IDENTITY.USER.MAIN.API_TABLE_DESC') }}
                </div>
            </article>
            <p-data-table
                :items="state.items"
                :loading="state.loading"
                :fields="state.fields"
                :select-index.sync="state.selectedIndex"
                :striped="false"
                :selectable="true"
                :multi-select="false"
            >
                <template #col-state-format="{value}">
                    <p-status v-bind="userStateFormatter(value)"
                              class="capitalize"
                    />
                </template>
                <template #col-created_at-format="{value}">
                    {{ iso8601Formatter(value, state.timezone) }}
                </template>
            </p-data-table>
        </p-pane-layout>
        <user-a-p-i-key-modal v-if="modalState.visible && !modalState.loading"
                              :visible.sync="modalState.visible"
                              :api-key-item="modalState.item"
                              @clickButton="confirm"
        />
        <p-table-check-modal :visible.sync="checkModalState.visible"
                             :fields="checkModalState.fields"
                             :items="state.selectedItems"
                             :header-title="checkModalState.title"
                             :sub-title="checkModalState.subTitle"
                             :theme-color="checkModalState.themeColor"
                             :loading="checkModalState.loading"
                             modal-size="md"
                             @confirm="checkModalConfirm"
        >
            <template #col-state-format="{value}">
                <p-status v-bind="userStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, state.timezone) }}
            </template>
        </p-table-check-modal>
    </section>
</template>

<style lang="postcss" scoped>
.main-table-wrapper {
    width: 100%;
    height: 100%;
    margin-bottom: 1rem;
}

.table-header {
    display: flex;
    justify-content: space-between;
    padding-left: 1rem;
    padding-top: 1.5rem;
    padding-bottom: 1.5rem;
    .left-section {
        display: inherit;
    }
    .dropdown-btn {
        margin-left: 1rem;
    }
    .table-desc {
        @apply text-gray-500;
        padding-right: 1rem;
        font-size: 0.875rem;
        line-height: 150%;
    }
}
</style>
