<script setup lang="ts">
import {
    computed, onMounted, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PButton,
    PDataTable, PHeading, PI, PSelectDropdown,
} from '@spaceone/design-system';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { iso8601Formatter } from '@cloudforet/utils';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { RoleBindingDeleteParameters } from '@/schema/identity/role-binding/api-verbs/delete';
import type { RoleBindingListParameters } from '@/schema/identity/role-binding/api-verbs/list';
import type { RoleBindingUpdateRoleParameters } from '@/schema/identity/role-binding/api-verbs/update-role';
import type { RoleBindingModel } from '@/schema/identity/role-binding/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useRoleFormatter } from '@/services/administration/composables/refined-table-data';
import { useUserPageStore } from '@/services/administration/store/user-page-store';
import { HOME_DASHBOARD_ROUTE } from '@/services/home-dashboard/routes/route-constant';

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
}
interface Props {
    activeTab: string;
}

const props = withDefaults(defineProps<Props>(), {
    activeTab: '',
});

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const router = useRouter();

const storeState = reactive({
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
});
const state = reactive({
    loading: false,
    tags: {},
    items: [] as TableItem[],
    sortBy: 'workspace_id',
    sortDesc: true,
    selectedUser: computed(() => userPageStore.selectedUsers[0]),
});
const tableState = reactive({
    fields: computed(() => [
        { name: 'workspace', label: i18n.t('IAM.USER.MAIN.WORKSPACE') as string },
        { name: 'role_binding', label: i18n.t('IAM.USER.MAIN.ROLE_TYPE') as string, sortable: false },
        { name: 'created_at', label: i18n.t('IAM.USER.MAIN.INVITED') as string, sortable: false },
        { name: 'remove_button', label: ' ', sortable: false },
    ]),
});
const dropdownState = reactive({
    loading: false,
    visibleMenu: false,
    selectedMenuIndex: undefined as undefined | number,
    searchText: '',
    selectedItems: [] as SelectDropdownMenuItem[],
    menuItems: [] as SelectDropdownMenuItem[],
});

/* Component */
const handleChangeSort = (sortBy, sortDesc) => {
    state.sortBy = sortBy;
    state.sortDesc = sortDesc;
    getWorkspaceList();
};
const handleClickLink = (id: string) => {
    router.push({ name: HOME_DASHBOARD_ROUTE._NAME, params: { workspaceId: id } });
};
const handleMenuVisible = (idx: number) => {
    if (!dropdownState.visibleMenu) return;
    dropdownState.selectedMenuIndex = idx;
};

/* API */
const roleListApiQueryHelper = new ApiQueryHelper();
const workspaceApiHelper = new ApiQueryHelper()
    .setPage(1, 15);
const getWorkspaceList = async () => {
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
        state.items = (results ?? []).map((k) => ({
            workspace: {
                name: workspaceResults?.find((w) => w.workspace_id === k.workspace_id)?.name || '',
                id: k.workspace_id,
            },
            role_binding: {
                type: k.role_type,
                name: userPageState.roles.find((r) => r.role_id === k.role_id)?.name || '',
                role_binding_id: k.role_binding_id,
            },
            created_at: k.created_at,
        }));
    } catch (e) {
        state.items = [];
    } finally {
        state.loading = false;
    }
};
const dropdownMenuHandler: AutocompleteHandler = async (inputText: string) => {
    dropdownState.loading = true;

    roleListApiQueryHelper.setFilters([{
        k: 'role_type',
        v: [ROLE_TYPE.WORKSPACE_OWNER, ROLE_TYPE.WORKSPACE_MEMBER],
        o: '=',
    }]);
    if (inputText) {
        roleListApiQueryHelper.addFilter({
            k: 'name',
            v: inputText,
            o: '',
        });
    }
    try {
        const results = await userPageStore.listRoles({
            query: roleListApiQueryHelper.data,
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
            role_id: value.name || '',
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
const handleClickButton = async (value: string) => {
    try {
        await SpaceConnector.clientV2.identity.roleBinding.delete<RoleBindingDeleteParameters>({
            role_binding_id: value,
        });
        showSuccessMessage(i18n.t('IDENTITY.USER.MAIN.ALT_S_REMOVE_USER'), '');
        await getWorkspaceList();
    } catch (e) {
        showErrorMessage(i18n.t('IDENTITY.USER.MAIN.ALT_E_REMOVE_USER'), '');
        ErrorHandler.handleError(e);
    }
};

/* Watcher */
watch([() => props.activeTab, () => state.selectedUser.user_id], async () => {
    await getWorkspaceList();
}, { immediate: true });

/* Init */
onMounted(() => {
    dropdownMenuHandler('');
});
</script>

<template>
    <div class="user-management-tab-workspace">
        <p-heading heading-type="sub"
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
            <template #col-workspace-format="{value}">
                <span class="workspace-id-wrapper">
                    <span>{{ value.name }}</span>
                    <router-link :to="{ name: HOME_DASHBOARD_ROUTE._NAME, params: { workspaceId: value.id } }"
                                 target="_blank"
                    >
                        <p-i name="ic_arrow-right-up"
                             width="0.75rem"
                             height="0.75rem"
                             class="icon-link"
                             @click="handleClickLink(value.id)"
                        />
                    </router-link>
                </span>
            </template>
            <template #col-role_binding-format="{value, rowIndex}">
                <span class="role-type">
                    <img :src="useRoleFormatter(value.type).image"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                    <p-select-dropdown is-filterable
                                       use-fixed-menu-style
                                       style-type="transparent"
                                       :visible-menu="dropdownState.visibleMenu"
                                       :loading="dropdownState.loading"
                                       :search-text.sync="dropdownState.searchText"
                                       :selected="dropdownState.menuItems.filter((item) => item.label === value.name)"
                                       :handler="dropdownMenuHandler"
                                       class="role-select-dropdown"
                                       @update:visible-menu="handleMenuVisible(rowIndex)"
                                       @select="handleSelectDropdownItem($event, rowIndex)"
                    >
                        <template #menu-item--format="{item}">
                            <div class="role-menu-item">
                                <img :src="useRoleFormatter(item.role_type).image"
                                     alt="role-type-icon"
                                     class="role-type-icon"
                                >
                                <div class="role-info-wrapper">
                                    <span>{{ item.label }}</span>
                                    <span class="role-type">({{ item.role_type }})</span>
                                </div>
                            </div>
                        </template>
                    </p-select-dropdown>
                </span>
            </template>
            <template #col-created_at-format="{value}">
                {{ iso8601Formatter(value, storeState.timezone) }}
            </template>
            <template #col-remove_button-format="{ item }">
                <p-button style-type="tertiary"
                          size="sm"
                          class="remove-button"
                          @click="handleClickButton(item.role_binding.role_binding_id)"
                >
                    {{ $t('IAM.USER.REMOVE') }}
                </p-button>
            </template>
        </p-data-table>
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
                .role-info-wrapper {
                    @apply flex flex-col;
                    gap: 0.25rem;
                    .role-type {
                        @apply text-gray-500;
                    }
                }
            }
        }
    }
    .workspace-id-wrapper {
        @apply flex items-center;
        gap: 0.125rem;
    }
    .icon-link {
        @apply cursor-pointer;
    }
}
</style>
