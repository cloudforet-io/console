<script lang="ts" setup>
import { computed, reactive, watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PToolboxTable, PSelectDropdown, PStatus, PCopyButton, PBadge,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import type { ToolboxOptions } from '@spaceone/design-system/types/navigation/toolbox/type';
import { cloneDeep, isEmpty } from 'lodash';

import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ApiKeyModel } from '@/schema/identity/api-key/model';
import { APP_STATUS_TYPE } from '@/schema/identity/app/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import { replaceUrlQuery } from '@/lib/router-query-string';

import UserAPIKeyModal from '@/common/components/modals/UserAPIKeyModal.vue';

import AppManagementFormModal from '@/services/administration/components/AppManagementFormModal.vue';
import AppManagementStatusModal from '@/services/administration/components/AppManagementStatusModal.vue';
import {
    appStateFormatter,
    calculateTime,
} from '@/services/administration/composables/refined-table-data';
import {
    APP_DROPDOWN_MODAL_TYPE,
    APP_SEARCH_HANDLERS,
    APP_TABLE_FIELDS,
} from '@/services/administration/constants/app-constant';
import {
    ROLE_SEARCH_HANDLERS,
} from '@/services/administration/constants/role-constant';
import { useAppPageStore } from '@/services/administration/store/app-page-store';


const DEFAULT_PAGE_LIMIT = 15;

interface Props {
    tableHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const appContextStore = useAppContextStore();
const appPageStore = useAppPageStore();
const appPageState = appPageStore.$state;

const route = useRoute();

const appListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(DEFAULT_PAGE_LIMIT)
    .setSort('name', true)
    .setFiltersAsRawQueryString(route.query.filters);
let appListApiQuery = appListApiQueryHelper.data;

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
});
const state = reactive({
    loading: false,
    refinedUserItems: computed(() => appPageState.apps.map((app) => ({
        ...app,
        last_accessed_at: calculateTime(app?.last_accessed_at, storeState.timezone),
    }))),
    tags: appListApiQueryHelper.setKeyItemSets(ROLE_SEARCH_HANDLERS.keyItemSets).queryTags,
});
const modalState = reactive({
    apiKeyModalVisible: false,
    item: {} as ApiKeyModel,
});
const dropdownMenu = computed<MenuItem[]>(() => ([
    {
        type: 'item', name: APP_DROPDOWN_MODAL_TYPE.EDIT, label: i18n.t('IAM.APP.EDIT'), disabled: isEmpty(appPageStore.selectedApp),
    },
    {
        type: 'item', name: APP_DROPDOWN_MODAL_TYPE.DELETE, label: i18n.t('IAM.APP.DELETE'), disabled: isEmpty(appPageStore.selectedApp),
    },
    { type: 'divider' },
    {
        type: 'item', name: APP_DROPDOWN_MODAL_TYPE.REGENERATE, label: i18n.t('IAM.APP.REGENERATE'), disabled: isEmpty(appPageStore.selectedApp),
    },
    { type: 'divider' },
    {
        type: 'item',
        name: APP_DROPDOWN_MODAL_TYPE.ENABLE,
        label: i18n.t('IAM.APP.ENABLE'),
        disabled: isEmpty(appPageStore.selectedApp)
            || (appPageStore.selectedApp?.state === APP_STATUS_TYPE.EXPIRED
                || appPageStore.selectedApp?.state === APP_STATUS_TYPE.ENABLED)
        ,
    },
    {
        type: 'item',
        name: APP_DROPDOWN_MODAL_TYPE.DISABLE,
        label: i18n.t('IAM.APP.DISABLE'),
        disabled: isEmpty(appPageStore.selectedApp)
            || (appPageStore.selectedApp?.state === APP_STATUS_TYPE.EXPIRED
                || appPageStore.selectedApp?.state === APP_STATUS_TYPE.DISABLED)
        ,
    },
]));

/* Component */
const handleSelectDropdown = (name) => {
    switch (name) {
    case APP_DROPDOWN_MODAL_TYPE.EDIT: clickFormModal({
        name,
        title: i18n.t('IAM.APP.MODAL.EDIT_TITLE') as string,
    });
        break;
    case APP_DROPDOWN_MODAL_TYPE.DELETE: clickStatusModal({
        name,
        title: i18n.t('IAM.APP.MODAL.DELETE_TITLE') as string,
        theme: 'alert',
    });
        break;
    case APP_DROPDOWN_MODAL_TYPE.REGENERATE: clickStatusModal({
        name,
        title: i18n.t('IAM.APP.MODAL.REGENERATE_TITLE') as string,
        theme: 'primary',
    });
        break;
    case APP_DROPDOWN_MODAL_TYPE.ENABLE: clickStatusModal({
        name,
        title: i18n.t('IAM.APP.MODAL.ENABLE_TITLE') as string,
        theme: 'primary',
    });
        break;
    case APP_DROPDOWN_MODAL_TYPE.DISABLE: clickStatusModal({
        name,
        title: i18n.t('IAM.APP.MODAL.DISABLE_TITLE') as string,
        theme: 'alert',
    });
        break;
    default: break;
    }
};
const handleSelect = (index: number[]) => {
    appPageStore.$patch({ selectedIndex: index });
};
const handleChange = async (options: ToolboxOptions = {}) => {
    appListApiQuery = getApiQueryWithToolboxOptions(appListApiQueryHelper, options) ?? appListApiQuery;
    if (options.queryTags !== undefined) {
        await replaceUrlQuery('filters', appListApiQueryHelper.rawQueryStrings);
    }
    await getListApps();
};
const clickFormModal = ({ name, title }) => {
    appPageStore.$patch((_state) => {
        _state.modal.type = name;
        _state.modal.title = title;
        _state.modal.visible.form = true;
        _state.modal = cloneDeep(_state.modal);
    });
};
const clickStatusModal = ({ name, title, theme }) => {
    appPageStore.$patch((_state) => {
        _state.modal.type = name;
        _state.modal.title = title;
        _state.modal.visible.status = true;
        _state.modal.themeColor = theme;
        _state.modal = cloneDeep(_state.modal);
    });
};
const handleChangeModalVisible = (value) => {
    appPageStore.$patch((_state) => {
        _state.modal.visible.apiKey = value;
        _state.modal = cloneDeep(_state.modal);
    });
};
const handleConfirmButton = (value: string) => {
    if (value) {
        modalState.item.api_key_id = value;
        return;
    }
    handleClickModalConfirm();
};
const handleClickModalConfirm = async () => {
    await getListApps();
};

/* API */
const getListApps = async () => {
    state.loading = true;
    try {
        await appPageStore.listApps({ query: appListApiQuery });
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch(() => appPageState.modal.visible.apiKey, (visible) => {
    modalState.apiKeyModalVisible = visible;
});

/* Init */
(async () => {
    await getListApps();
})();
</script>

<template>
    <section class="app-management-table">
        <p-toolbox-table search-type="query"
                         selectable
                         sortable
                         :loading="state.loading"
                         disabled
                         :multi-select="false"
                         :items="state.refinedUserItems"
                         :fields="APP_TABLE_FIELDS"
                         sort-by="name"
                         :select-index="appPageState.selectedIndex"
                         :key-item-sets="APP_SEARCH_HANDLERS.keyItemSets"
                         :value-handler-map="APP_SEARCH_HANDLERS.valueHandlerMap"
                         :sort-desc="true"
                         :total-count="appPageState.totalCount"
                         :query-tags="state.tags"
                         :style="{height: `${props.tableHeight}px`}"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleChange()"
        >
            <template #toolbox-left>
                <p-select-dropdown class="left-toolbox-item-select-dropdown"
                                   :menu="dropdownMenu"
                                   :placeholder="$t('IAM.APP.ACTION')"
                                   @select="handleSelectDropdown"
                />
            </template>
            <template #col-state-format="{value}">
                <p-status v-bind="appStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-app_id-format="{value}">
                <span class="col-app-id">
                    {{ value }}
                    <p-copy-button :value="value" />
                </span>
            </template>
            <template #col-tags-format="{value}">
                <template v-if="!!Object.keys(value).length">
                    <p-badge v-for="([key, val], idx) in Object.entries(value)"
                             :key="`${key}-${val}-${idx}`"
                             badge-type="subtle"
                             shape="square"
                             style-type="gray200"
                             class="mr-2"
                    >
                        {{ key }}: {{ val }}
                    </p-badge>
                </template>
                <template v-else>
                    <span />
                </template>
            </template>
            <template #col-last_accessed_at-format="{ value }">
                <span v-if="value === -1">
                    No Activity
                </span>
                <span v-else-if="value === 0">
                    {{ $t('IAM.USER.MAIN.TODAY') }}
                </span>
                <span v-else-if="value === 1">
                    {{ $t('IAM.USER.MAIN.YESTERDAY') }}
                </span>
                <span v-else>
                    {{ value }} {{ $t('IAM.USER.MAIN.DAYS') }}
                </span>
            </template>
            <template #col-expired_at-format="{value}">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
        </p-toolbox-table>
        <user-a-p-i-key-modal v-if="modalState.apiKeyModalVisible"
                              :visible="modalState.apiKeyModalVisible"
                              :api-key-item="modalState.item"
                              @clickButton="handleClickModalConfirm"
                              @update:visible="handleChangeModalVisible"
        />
        <app-management-form-modal @confirm="handleConfirmButton" />
        <app-management-status-modal @confirm="handleConfirmButton" />
    </section>
</template>

<style lang="postcss" scoped>
.app-management-table {
    .left-toolbox-item-select-dropdown {
        min-width: 6.5rem;
    }
    .col-app-id {
        @apply flex items-center;
        gap: 0.25rem;
    }
    .role-type {
        @apply flex items-center;
        gap: 0.5rem;
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }
    }
}
</style>
