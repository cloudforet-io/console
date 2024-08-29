<script setup lang="ts">
import {
    reactive,
} from 'vue';



import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PButton, PToolboxTable, PStatus, PSelectDropdown, PTooltip,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { ROLE_STATE } from '@/schema/identity/role/constant';
import type { BasicRoleModel, RoleModel } from '@/schema/identity/role/model';
import { i18n } from '@/translations';

import { useUserWorkspaceGroupStore } from '@/store/app-context/workspace/user-workspace-group-store';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import { useRoleFormatter, groupUserStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { useSelectDropDownList } from '@/services/advanced/composables/use-select-drop-down-list';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';

const userWorkspaceGroupStore = useUserWorkspaceGroupStore();
const userWorkspaceGroupStoreState = userWorkspaceGroupStore.state;
const landingPageStore = useLandingPageStore();
const landingPageStoreGetter = landingPageStore.getters;
const landingPageStoreGroupUserState = landingPageStore.groupUserTableState;


const tableState = reactive({
    fields: [
        { name: 'user_id', label: 'User ID' },
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
        { name: 'role', label: 'Role' },
        { name: 'remove_button', label: ' ', sortable: false },
    ],
});

const {
    loading, searchText, menuList, selectedItems, handleClickShowMore,
} = useSelectDropDownList<BasicRoleModel>({
    pageSize: 10,
    transformer: (_role) => ({
        label: _role.name,
        name: _role.role_id,
        role_type: _role.role_type,
    }),
    fetcher: (apiQueryHelper) => SpaceConnector.clientV2.identity.role.listBasicRole<RoleListParameters, ListResponse<RoleModel>>({
        query: {
            ...apiQueryHelper.data,
            filter: [
                ...(apiQueryHelper.data?.filter || []),
                { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
            ],
        },
    }),
});


const handleSelect = (index) => {
    landingPageStoreGroupUserState.selectedIndices = index;
};

const handleChange = (options: any = {}) => {
    if (options.pageStart) {
        landingPageStore.$patch((_state) => {
            _state.groupUserTableState.pageStart = options.pageStart;
        });
    }

    if (options.pageLimit) {
        landingPageStore.$patch((_state) => {
            _state.groupUserTableState.pageStart = 1;
            _state.groupUserTableState.pageLimit = options.pageLimit;
            _state.groupUserTableState.thisPage = 1;
        });
    }
};

const handleSelectMenu = () => {
    showSuccessMessage(i18n.t('IAM.WORKSPACE_GROUP.ALT_S_UPDATE_ROLE'), '');
};

const handleRefresh = () => {
    userWorkspaceGroupStore.load();
};

const handleAddUsersButtonClick = () => {
};

const handleSelectedGroupUsersRemoveButtonClick = () => {
};

const handleSelectedGroupUserRemoveButtonClick = (item) => {
    console.log(item);
};

const handleChangeSort = (name:string, isDesc:boolean) => {
    landingPageStore.$patch((_state) => {
        if (name === 'role') {
            _state.groupUserTableState.sortBy = `${name}_type`;
        } else {
            _state.groupUserTableState.sortBy = name;
        }

        _state.groupUserTableState.selectedIndices = [];
        _state.groupUserTableState.isDesc = isDesc;
    });
};

// watch(() => workspaceGroupPageState.groupUserSearchText, () => {
//     workspaceGroupPageStore.$patch((_state) => {
//         _state.state.selectedUserIndices = [];
//     });
// });
//
// onUnmounted(() => {
//     workspaceGroupPageStore.resetGroupUser();
// });
</script>

<template>
    <section class="workspace-group-tab-group-user">
        <p-heading class="workspace-group-tab-group-user-header"
                   :title="$t('IAM.WORKSPACE_GROUP.TAB.GROUP_USER')"
                   use-total-count
                   :total-count="landingPageStoreGetter.workspaceGroupUserTotalCount"
                   heading-type="sub"
        >
            <template #extra>
                <div class="workspace-group-tab-group-user-button-wrapper">
                    <p-button style-type="negative-primary"
                              :disabled="!landingPageStoreGroupUserState.selectedIndices.length"
                              @click="handleSelectedGroupUsersRemoveButtonClick"
                    >
                        {{ $t('IAM.WORKSPACE_GROUP.TAB.REMOVE') }}
                    </p-button>
                    <p-button style-type="secondary"
                              icon-left="ic_plus_bold"
                              @click="handleAddUsersButtonClick"
                    >
                        {{ $t('IAM.WORKSPACE_GROUP.TAB.ADD_USER') }}
                    </p-button>
                </div>
            </template>
        </p-heading>
        <p-toolbox-table class="workspace-group-tab-group-user-table"
                         :loading="userWorkspaceGroupStoreState.loading"
                         :fields="tableState.fields"
                         :items="landingPageStoreGetter.workspaceGroupUserTableItem"
                         :select-index="landingPageStoreGroupUserState.selectedIndices"
                         :total-count="landingPageStoreGetter.workspaceGroupUserTotalCount"
                         sort-by="user_id"
                         search-type="plain"
                         :sort-desc="true"
                         :this-page.sync="landingPageStoreGroupUserState.thisPage"
                         :search-text.sync="landingPageStoreGroupUserState.searchText"
                         selectable
                         sortable
                         searchable
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleRefresh"
                         @changeSort="handleChangeSort"
        >
            <template #col-state-format="{ value }">
                <p-status v-bind="groupUserStateFormatter(value)"
                          class="capitalize"
                />
            </template>
            <template #col-role-format="{ item }">
                <span class="role-type">
                    <img :src="useRoleFormatter(item.role_type).image"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                    <span>{{ useRoleFormatter(item.role_type).name }}</span>
                    <p-select-dropdown
                        is-filterable
                        use-fixed-menu-style
                        style-type="transparent"
                        class="role-select-dropdown"
                        :menu="menuList"
                        :selected.sync="selectedItems"
                        :search-text.sync="searchText"
                        :loading="loading"
                        disable-handler
                        page-size="10"
                        @click-show-more="handleClickShowMore"
                        @select="handleSelectMenu"
                    >
                        <template #dropdown-button>
                            <span />
                        </template>
                        <!-- eslint-disable vue/no-template-shadow -->
                        <template #menu-item--format="{ item }">
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
            <template #col-remove_button-format="{ item }">
                <p-button size="sm"
                          style-type="tertiary"
                          @click.stop="() => handleSelectedGroupUserRemoveButtonClick(item)"
                >
                    {{ $t('IAM.WORKSPACE_GROUP.TAB.REMOVE') }}
                </p-button>
            </template>
        </p-toolbox-table>
    </section>
</template>

<style lang="postcss" scoped>
.workspace-group-tab-group-user {
    .workspace-group-tab-group-user-button-wrapper {
        display: flex;
        gap: 1rem;
    }

    .workspace-group-tab-group-user-table {
        border: none;
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

    /* custom design-system component - p-select-dropdown */
    :deep(.p-select-dropdown) {
        .no-data {
            position: initial;
        }
    }
}
</style>
