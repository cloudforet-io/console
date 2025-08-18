<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { useQueryClient } from '@tanstack/vue-query';
import { isEmpty } from 'lodash';

import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';
import {
    PBadge,
    PCopyButton,
    PI,
    PSelectDropdown, PStatus,
    PToolboxTable,
} from '@cloudforet/mirinae';
import type { MenuItem } from '@cloudforet/mirinae/types/controls/context-menu/type';
import type { KeyItemSet } from '@cloudforet/mirinae/types/controls/search/query-search/type';
import type { ToolboxOptions } from '@cloudforet/mirinae/types/controls/toolbox/type';
import type { DefinitionField } from '@cloudforet/mirinae/types/data-display/tables/definition-table/type';
import { iso8601Formatter } from '@cloudforet/utils';

import { APP_STATUS_TYPE } from '@/api-clients/identity/app/schema/constant';
import type { AppModel } from '@/api-clients/identity/app/schema/model';
import { useRoleApi } from '@/api-clients/identity/role/composables/use-role-api';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-data-model';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import UserAPIKeyModal from '@/common/components/modals/UserAPIKeyModal.vue';
import { useQueryTags } from '@/common/composables/query-tags';

import { indigo, peacock } from '@/styles/colors';

import AppManagementDoubleCheckModal from '@/services/iam/components/AppManagementDoubleCheckModal.vue';
import AppManagementFormModal from '@/services/iam/components/AppManagementFormModal.vue';
import AppManagementStatusModal from '@/services/iam/components/AppManagementStatusModal.vue';
import {
    appStateFormatter,
    calculateTime, useRoleFormatter,
} from '@/services/iam/composables/refined-table-data';
import { useAppListPaginationQuery } from '@/services/iam/composables/use-app-list-pagination-query';
import {
    APP_DROPDOWN_MODAL_TYPE,
    APP_STATE,
} from '@/services/iam/constants/app-constant';
import { useAppPageStore } from '@/services/iam/store/app-page-store';

interface Props {
    tableHeight?: number;
    hasReadWriteAccess?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const appContextStore = useAppContextStore();
const appPageStore = useAppPageStore();
const appPageState = appPageStore.state;
const userStore = useUserStore();

const referenceMap = useAllReferenceDataModel();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
    userId: computed<string|undefined>(() => userStore.state.userId),
});
const tableState = reactive({
    roleTypeFilter: computed<ApiFilter>(() => (storeState.isAdminMode ? { k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: 'eq' } : { k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: 'not' })),
    appSearchHandlers: computed(() => ({
        keyItemSets: [
            {
                title: 'Properties',
                items: [
                    { name: 'name', label: 'Name' },
                    { name: 'state', label: 'State' },
                    { name: 'app_id', label: 'App ID' },
                    { name: 'role_id', label: 'Role ID' },
                    {
                        name: 'last_accessed_at',
                        label: 'Last Activity',
                        dataType: 'datetime',
                    },
                ],
            },
            {
                title: 'Advanced',
                items: [{
                    name: 'tags',
                    label: 'Tags',
                    dataType: 'object',
                }],
            }] as KeyItemSet[],
        valueHandlerMap: {
            name: makeDistinctValueHandler('identity.App', 'name', 'string', [tableState.roleTypeFilter]),
            state: makeEnumValueHandler(APP_STATE),
            app_id: makeDistinctValueHandler('identity.App', 'app_id', 'string', [tableState.roleTypeFilter]),
            role_id: makeDistinctValueHandler('identity.App', 'role_id', 'string', [tableState.roleTypeFilter]),
            last_accessed_at: makeDistinctValueHandler('identity.App', 'last_accessed_at', 'datetime', [tableState.roleTypeFilter]),
            tags: makeDistinctValueHandler('identity.App', 'tags', 'object', [tableState.roleTypeFilter]),
        },
    })),
});
const state = reactive({
    refinedAppItems: computed(() => appListData.value.map((app) => {
        let projectLabel = '';
        if (app.project_group_id) {
            projectLabel = referenceMap.projectGroup[app.project_group_id]?.label;
        } else if (app.project_id) {
            projectLabel = referenceMap.project[app.project_id]?.label;
        }
        return {
            ...app,
            role_type: {
                type: roleListData.value?.results?.filter((r) => r.role_id === app.role_id)[0]?.role_type || '',
                name: roleListData.value?.results?.filter((r) => r.role_id === app.role_id)[0]?.name || '',
            },
            last_accessed_at: calculateTime(app?.last_accessed_at, storeState.timezone),
            project: projectLabel && (app.project_group_id || app.project_id) ? {
                icon: app.project_group_id ? 'ic_folder-filled' : 'ic_document-filled',
                color: app.project_id ? peacock[600] : indigo[500],
                label: projectLabel,
            } : undefined,
        };
    })),
    fields: computed(() => {
        const additionalFields: DefinitionField[] = [];
        if (storeState.isAdminMode) {
            additionalFields.push({ name: 'role_type', label: 'Admin Role' });
        } else {
            additionalFields.push(
                { name: 'role_type', label: 'Workspace Role', sortable: false },
                { name: 'project', label: 'Project', sortable: false },
            );
        }
        return [
            { name: 'name', label: 'App Name' },
            { name: 'state', label: 'State' },
            {
                name: 'app_id', label: 'App ID', sortable: false, disableCopy: false,
            },
            ...additionalFields,
            {
                name: 'tags', label: 'Tags', sortable: false, width: '150px',
            },
            { name: 'last_accessed_at', label: 'Last Activity' },
            { name: 'expired_at', label: 'Expiration Date' },
            { name: 'created_at', label: 'Created' },
        ];
    }),
    selectedIndex: [] as number[],
    selectedApp: computed(() => state.selectedIndex && appListData.value[state.selectedIndex[0]] || {} as AppModel),
});
const modalState = reactive({
    apiKeyModalVisible: false,
    item: {} as AppModel,
});
const paginationState = reactive({
    thisPage: 1,
    pageSize: 15,
});
const sortState = reactive({
    sortBy: 'created_at',
    sortDesc: true,
});
const dropdownMenu = computed<MenuItem[]>(() => ([
    {
        type: 'item', name: APP_DROPDOWN_MODAL_TYPE.EDIT, label: i18n.t('IAM.APP.EDIT'), disabled: isEmpty(state.selectedApp),
    },
    {
        type: 'item', name: APP_DROPDOWN_MODAL_TYPE.DELETE, label: i18n.t('IAM.APP.DELETE'), disabled: isEmpty(state.selectedApp),
    },
    { type: 'divider' },
    {
        type: 'item', name: APP_DROPDOWN_MODAL_TYPE.REGENERATE, label: i18n.t('IAM.APP.REGENERATE'), disabled: isEmpty(state.selectedApp),
    },
    { type: 'divider' },
    {
        type: 'item',
        name: APP_DROPDOWN_MODAL_TYPE.ENABLE,
        label: i18n.t('IAM.APP.ENABLE'),
        disabled: isEmpty(state.selectedApp)
            || (state.selectedApp?.state === APP_STATUS_TYPE.EXPIRED
                || state.selectedApp?.state === APP_STATUS_TYPE.ENABLED)
        ,
    },
    {
        type: 'item',
        name: APP_DROPDOWN_MODAL_TYPE.DISABLE,
        label: i18n.t('IAM.APP.DISABLE'),
        disabled: isEmpty(state.selectedApp)
            || (state.selectedApp?.state === APP_STATUS_TYPE.EXPIRED
                || state.selectedApp?.state === APP_STATUS_TYPE.DISABLED)
        ,
    },
]));

const queryClient = useQueryClient();
const { roleAPI } = useRoleApi();
const roleListApiQueryHelper = new ApiQueryHelper();
const { key: appListBaseQueryKey } = useServiceQueryKey('identity', 'app', 'list');
const { key: roleListQueryKey, params: roleListQueryParams } = useServiceQueryKey('identity', 'role', 'list', {
    params: computed(() => {
        roleListApiQueryHelper.setFilters([
            { k: 'state', v: ROLE_STATE.ENABLED, o: '=' },
        ]);
        return {
            query: roleListApiQueryHelper.data,
        };
    }),
});
const { data: roleListData } = useScopedQuery({
    queryKey: roleListQueryKey,
    queryFn: () => roleAPI.list(roleListQueryParams.value),
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 30,
}, ['DOMAIN', 'WORKSPACE']);

const appListApiQueryHelper = new ApiQueryHelper();
const queryTagHelper = useQueryTags({ keyItemSets: tableState.appSearchHandlers.keyItemSets });
const { queryTags } = queryTagHelper;

const {
    data: appListData,
    totalCount: appListTotalCount,
    isLoading: appListFetching,
} = useAppListPaginationQuery({
    thisPage: computed(() => paginationState.thisPage),
    pageSize: computed(() => paginationState.pageSize),
    params: computed(() => {
        appListApiQueryHelper.setFilters([
            ...queryTagHelper.filters.value,
            storeState.isAdminMode ? { k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: '=' } : { k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: '!=' },
        ]);
        return {
            query: {
                ...appListApiQueryHelper.data,
                sort: [{ key: sortState.sortBy, desc: sortState.sortDesc }],
            },
        };
    }),
});

/* Component */
const refresh = () => {
    queryClient.invalidateQueries({ queryKey: appListBaseQueryKey.value });
};
const handleSelectDropdown = (name) => {
    switch (name) {
    case APP_DROPDOWN_MODAL_TYPE.EDIT: clickFormModal({
        name,
        title: i18n.t('IAM.APP.MODAL.EDIT_TITLE') as string,
        isForm: true,
    });
        break;
    case APP_DROPDOWN_MODAL_TYPE.DELETE: clickFormModal({
        name,
        title: i18n.t('IAM.APP.MODAL.DELETE_TITLE', { app: state.selectedApp.name }) as string,
        isForm: false,
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
    state.selectedIndex = index;
};
const handleChange = async (options: ToolboxOptions = {}) => {
    if (options.sortBy !== undefined) sortState.sortBy = options.sortBy;
    if (options.sortDesc !== undefined) sortState.sortDesc = options.sortDesc;
    if (options.queryTags !== undefined) {
        queryTagHelper.setQueryTags(options.queryTags);
    }
};
const clickFormModal = ({ name, title, isForm }) => {
    appPageStore.setModalInfo(name, title);
    appPageStore.setModalVisible('form', isForm);
    appPageStore.setModalVisible('doubleCheck', !isForm);
};
const clickStatusModal = ({ name, title, theme }) => {
    appPageStore.setModalInfo(name, title, theme);
    appPageStore.setModalVisible('status', true);
};
const handleChangeModalVisible = (value) => {
    appPageStore.setModalVisible('apiKey', value);
};
const handleConfirmButton = (value?: AppModel) => {
    if (value) {
        modalState.item = value;
    }
};
</script>

<template>
    <section class="app-management-table">
        <p-toolbox-table search-type="query"
                         :selectable="props.hasReadWriteAccess"
                         sortable
                         :loading="appListFetching"
                         disabled
                         :multi-select="false"
                         :items="state.refinedAppItems"
                         :fields="state.fields"
                         sort-by="name"
                         :this-page.sync="paginationState.thisPage"
                         :page-size.sync="paginationState.pageSize"
                         :select-index="state.selectedIndex"
                         :key-item-sets="tableState.appSearchHandlers.keyItemSets"
                         :value-handler-map="tableState.appSearchHandlers.valueHandlerMap"
                         :sort-desc="true"
                         :total-count="appListTotalCount"
                         :query-tags="queryTags"
                         :style="{height: `${props.tableHeight}px`}"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="refresh"
        >
            <template v-if="props.hasReadWriteAccess"
                      #toolbox-left
            >
                <p-select-dropdown class="left-toolbox-item-select-dropdown"
                                   :menu="dropdownMenu"
                                   reset-selection-on-menu-close
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
            <template #col-role_type-format="{value}">
                <span class="role-type">
                    <img :src="useRoleFormatter(value.type).image"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                    <span>{{ value.name }}</span>
                </span>
            </template>
            <template #col-project-format="{value}">
                <div v-if="value"
                     class="col-project"
                >
                    <p-i :name="value.icon"
                         :color="value.color"
                         width="1rem"
                         height="1rem"
                    />
                    <span>{{ value.label }}</span>
                </div>
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
                    -
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
        <user-a-p-i-key-modal v-if="appPageState.modalVisible.apiKey"
                              :visible="appPageState.modalVisible.apiKey"
                              :api-key-item="modalState.item"
                              @update:visible="handleChangeModalVisible"
        />
        <app-management-form-modal :selected-app="state.selectedApp"
                                   @confirm="handleConfirmButton"
        />
        <app-management-status-modal :selected-app="state.selectedApp"
                                     @confirm="handleConfirmButton"
        />
        <app-management-double-check-modal :selected-app="state.selectedApp"
                                           @confirm="handleConfirmButton"
        />
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
    .col-project {
        @apply flex items-center;
        gap: 0.5rem;
    }
    .role-type {
        @apply flex items-center;
        padding-right: 1rem;
        gap: 0.5rem;
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }
    }
}

/* custom design-system component - p-data-table */
:deep(.p-data-table) {
    .row-height-fixed td:not(.has-width) {
        overflow-x: initial;
    }
}
</style>
