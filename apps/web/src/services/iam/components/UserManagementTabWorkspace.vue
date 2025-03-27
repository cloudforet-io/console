<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PButton,
    PDataTable, PHeading, PLink, PSelectDropdown, PStatus, PTooltip,
} from '@cloudforet/mirinae';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';
import type { DataTableFieldType } from '@cloudforet/mirinae/types/data-display/tables/data-table/type';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { RESOURCE_GROUP } from '@/api-clients/_common/schema/constant';
import type { RoleBindingDeleteParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/delete';
import type { RoleBindingListParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/list';
import type { RoleBindingUpdateRoleParameters } from '@/api-clients/identity/role-binding/schema/api-verbs/update-role';
import type { RoleBindingModel } from '@/api-clients/identity/role-binding/schema/model';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceModel, WorkspaceState } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import UserManagementRemoveModal from '@/services/iam/components/UserManagementRemoveModal.vue';
import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

interface WorkspaceItem {
    name: string;
    id: string;
}
interface RoleBindingItem {
    type: string;
    name: string;
    role_binding_id: string;
}
interface TableItem {
    workspace: WorkspaceItem;
    role_binding: RoleBindingItem;
    created_at: string;
    is_dormant: boolean;
    state?: WorkspaceState
}
interface Props {
    activeTab: string;
    hasReadWriteAccess?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    activeTab: '',
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userStore = useUserStore();

const storeState = reactive({
    timezone: computed<string>(() => userStore.state.timezone ?? 'UTC'),
});
const state = reactive({
    loading: false,
    tags: {},
    items: [] as TableItem[],
    sortBy: 'workspace_id',
    sortDesc: true,
    selectedUser: computed(() => userPageStore.getters.selectedUsers[0]),
    selectedRemoveItem: '',
});
const tableState = reactive({
    fields: computed<DataTableFieldType[]>(() => {
        const defaultFields: DataTableFieldType[] = [
            { name: 'workspace', label: i18n.t('IAM.USER.MAIN.WORKSPACE') as string },
            { name: 'state', label: i18n.t('IAM.USER.MAIN.STATE') as string },
            { name: 'role_binding', label: i18n.t('IAM.USER.MAIN.ROLE') as string, sortable: false },
            { name: 'created_at', label: i18n.t('IAM.USER.MAIN.INVITED') as string, sortable: false },
        ];
        if (props.hasReadWriteAccess) {
            defaultFields.push({ name: 'remove_button', label: ' ', sortable: false });
        }
        return defaultFields;
    }),
});
const dropdownState = reactive({
    loading: false,
    visibleMenu: false,
    selectedMenuIndex: undefined as undefined | number,
    searchText: '',
    selectedItems: [] as SelectDropdownMenuItem[],
    menuItems: [] as SelectDropdownMenuItem[],
});
const modalState = reactive({
    visible: false,
    title: '',
    loading: false,
});

/* Component */
const handleChangeSort = (sortBy, sortDesc) => {
    state.sortBy = sortBy;
    state.sortDesc = sortDesc;
    fetchWorkspaceList();
};
const handleMenuVisible = (idx: number) => {
    if (!dropdownState.visibleMenu) return;
    dropdownState.selectedMenuIndex = idx;
};
const handleClickButton = async (value: string) => {
    state.selectedRemoveItem = value;
    modalState.visible = true;
    modalState.title = i18n.t('IAM.USER.MAIN.MODAL.REMOVE_WORKSPACE_TITLE') as string;
};
const closeRemoveModal = () => {
    modalState.visible = false;
};

/* API */
const roleListApiQueryHelper = new ApiQueryHelper();
const workspaceApiHelper = new ApiQueryHelper()
    .setPage(1, 15);
const fetchWorkspaceList = async () => {
    state.loading = true;
    workspaceApiHelper.setSort(state.sortBy, state.sortDesc);
    workspaceApiHelper.setFilters([
        { k: 'user_id', v: state.selectedUser.user_id || '', o: '=' },
        { k: 'resource_group', v: RESOURCE_GROUP.WORKSPACE, o: '=' },
    ]);
    try {
        const { results: workspaceResults } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>();
        const { results } = await SpaceConnector.clientV2.identity.roleBinding.list<RoleBindingListParameters, ListResponse<RoleBindingModel>>({
            query: workspaceApiHelper.data,
        });
        if (!results) {
            state.items = [];
            return;
        }
        const _results: TableItem[] = [];
        (results ?? []).forEach((k) => {
            const workspaceInfo = workspaceResults?.find((w) => w.workspace_id === k.workspace_id);
            if (!workspaceInfo || workspaceInfo?.state === WORKSPACE_STATE.DISABLE) return;
            _results.push({
                workspace: {
                    name: workspaceInfo?.name || '',
                    id: k.workspace_id,
                },
                role_binding: {
                    type: k.role_type,
                    name: userPageState.roles.find((r) => r.role_id === k.role_id)?.name || '',
                    role_binding_id: k.role_binding_id,
                },
                created_at: k.created_at,
                state: workspaceInfo?.state || undefined,
                is_dormant: workspaceInfo?.is_dormant || false,
            });
        });
        state.items = _results;
    } catch (e) {
        state.items = [];
    } finally {
        state.loading = false;
    }
};
const dropdownMenuHandler: AutocompleteHandler = async (inputText: string) => {
    dropdownState.loading = true;

    roleListApiQueryHelper.setFilters([
        { k: 'role_type', v: [ROLE_TYPE.WORKSPACE_OWNER, ROLE_TYPE.WORKSPACE_MEMBER], o: '=' },
        { k: 'state', v: ROLE_STATE.ENABLED, o: '=' },
    ]);
    if (inputText) {
        roleListApiQueryHelper.addFilter({
            k: 'name',
            v: inputText,
            o: '',
        });
    }
    try {
        const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
            query: {
                ...roleListApiQueryHelper.data,
                filter: [
                    ...(roleListApiQueryHelper.data?.filter || []),
                    { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
                ],
            },
        });
        dropdownState.menuItems = (results ?? []).map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        dropdownState.loading = false;
    }

    return {
        results: dropdownState.menuItems,
    };
};
const handleSelectDropdownItem = async (value, rowIndex) => {
    try {
        const response = await SpaceConnector.clientV2.identity.roleBinding.updateRole<RoleBindingUpdateRoleParameters, RoleBindingModel>({
            role_binding_id: state.items[rowIndex].role_binding.role_binding_id,
            role_id: value || '',
        });
        showSuccessMessage(i18n.t('IAM.USER.MAIN.ALT_S_CHANGE_ROLE'), '');
        const roleName = userPageState.roles.find((role) => role.role_id === response.role_id)?.name ?? '';
        state.items[rowIndex].role_binding = {
            name: roleName,
            type: response.role_type,
            role_binding_id: response.role_binding_id,
        };
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};
const handleRemoveButton = async () => {
    modalState.loading = true;
    try {
        await SpaceConnector.clientV2.identity.roleBinding.delete<RoleBindingDeleteParameters>({
            role_binding_id: state.selectedRemoveItem,
        });
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_REMOVE_USER'), '');
        closeRemoveModal();
        await fetchWorkspaceList();
    } catch (e) {
        showErrorMessage(i18n.t('IDENTITY.USER.MAIN.ALT_E_REMOVE_USER'), '');
        ErrorHandler.handleError(e);
    } finally {
        modalState.loading = false;
    }
};

/* Watcher */
watch([() => props.activeTab, () => state.selectedUser.user_id], async () => {
    await fetchWorkspaceList();
}, { immediate: true });
</script>

<template>
    <div class="user-management-tab-workspace">
        <p-heading class="pt-8 px-4 pb-6"
                   heading-type="sub"
                   :use-total-count="true"
                   :total-count="state.items.length"
                   :title="$t('IAM.USER.MAIN.ASSOCIATED_WORKSPACE')"
        />
        <p-data-table :fields="tableState.fields"
                      :items="state.items"
                      :loading="state.loading"
                      :sort-by="state.sortBy"
                      :sort-desc="state.sortDesc"
                      sortable
                      @changeSort="handleChangeSort"
        >
            <template #col-workspace-format="{value, item}">
                <span class="workspace-id-wrapper">
                    <p-link :to="{ name: WORKSPACE_HOME_ROUTE._NAME, params: { workspaceId: value.id } }"
                            new-tab
                            :disabled="item.is_dormant"
                            :text="value.name"
                            action-icon="internal-link"
                    />
                </span>
            </template>
            <template #col-state-format="{value, item}">
                <p-status v-bind="workspaceStateFormatter(item.is_dormant ? WORKSPACE_STATE.DORMANT : value)"
                          class="capitalize"
                />
            </template>
            <template #col-role_binding-format="{value, rowIndex}">
                <span class="role-type">
                    <img :src="useRoleFormatter(value.type).image"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                    <p-select-dropdown is-filterable
                                       use-fixed-menu-style
                                       :disabled="!props.hasReadWriteAccess"
                                       style-type="transparent"
                                       :visible-menu="dropdownState.visibleMenu"
                                       :loading="dropdownState.loading"
                                       :search-text.sync="dropdownState.searchText"
                                       :handler="dropdownMenuHandler"
                                       class="role-select-dropdown"
                                       @update:visible-menu="handleMenuVisible(rowIndex)"
                                       @select="handleSelectDropdownItem($event, rowIndex)"
                    >
                        <template #dropdown-button>
                            <span>{{ value.name }}</span>
                        </template>
                        <template #menu-item--format="{item}">
                            <div class="role-menu-item">
                                <img :src="useRoleFormatter(item.role_type).image"
                                     alt="role-type-icon"
                                     class="role-type-icon"
                                >
                                <p-tooltip position="bottom"
                                           :contents="item.label"
                                           class="role-label"
                                >
                                    <span>{{ item.label }}</span>
                                </p-tooltip>
                                <span class="role-type">{{ useRoleFormatter(item.role_type, true).name }}</span>
                            </div>
                        </template>
                    </p-select-dropdown>
                </span>
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
            <template #col-remove_button-format="{ item }">
                <p-button style-type="negative-secondary"
                          size="sm"
                          class="remove-button"
                          @click="handleClickButton(item.role_binding.role_binding_id)"
                >
                    {{ $t('IAM.USER.REMOVE') }}
                </p-button>
            </template>
        </p-data-table>
        <user-management-remove-modal v-if="modalState.visible"
                                      :visible.sync="modalState.visible"
                                      :title="modalState.title"
                                      :loading="modalState.loading"
                                      @confirm="handleRemoveButton"
        />
    </div>
</template>

<style scoped lang="postcss">
.user-management-tab-workspace {
    @apply flex flex-col;
    .role-type {
        @apply flex items-center;
        gap: 0.5rem;
        .role-type-icon {
            @apply rounded-full;
            width: 1.5rem;
            height: 1.5rem;
        }
        .role-select-dropdown {
            width: auto;
            .role-menu-item {
                @apply flex items-center;
                gap: 0.25rem;
                .role-type-icon {
                    width: 1rem;
                    height: 1rem;
                }
                .role-label {
                    @apply truncate;
                    width: 14.375rem;
                }
                .role-type {
                    @apply text-label-sm text-gray-400;
                }
            }
        }
    }
    .workspace-id-wrapper {
        @apply flex items-center;
    }
    .icon-link {
        margin-left: 0.125rem;
    }
}

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .no-data {
        position: initial;
    }
}
</style>
