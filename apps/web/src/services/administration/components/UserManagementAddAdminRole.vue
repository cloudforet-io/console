<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PFieldGroup, PEmpty, PSelectDropdown, PFieldTitle, PToggleButton, PDivider, PButton,
} from '@spaceone/design-system';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useRoleFormatter } from '@/services/administration/composables/refined-table-data';
import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';
import type { AddModalMenuItem } from '@/services/administration/types/user-type';

interface Props {
    isSetAdminRole: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isSetAdminRole: true,
});

const router = useRouter();

const emit = defineEmits<{(e: 'change-input', formState): void,
}>();

const state = reactive({
    proxyIsSetAdminRole: useProxyValue('isSetAdminRole', props, emit),
});
const workspaceState = reactive({
    loading: true,
    visible: false,
    menuItems: [] as AddModalMenuItem[],
    selectedItems: [] as AddModalMenuItem[],
    searchText: '',
});
const roleState = reactive({
    loading: true,
    visible: false,
    menuItems: [] as AddModalMenuItem[],
    selectedItems: [] as AddModalMenuItem[],
    searchText: '',
});

const roleListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true);
const workspaceListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true);

/* Component */
const workspaceMenuHandler: AutocompleteHandler = async (inputText: string) => {
    await fetchListWorkspaces(inputText);
    return {
        results: workspaceState.menuItems as SelectDropdownMenuItem[],
    };
};
const roleMenuHandler: AutocompleteHandler = async (inputText: string) => {
    await fetchListRoles(inputText);
    return {
        results: roleState.menuItems as SelectDropdownMenuItem[],
    };
};
const handleChangeToggleButton = () => {
    state.proxyIsSetAdminRole = !state.proxyIsSetAdminRole;
};

/* API */
const fetchListRoles = async (inputText: string) => {
    roleState.loading = true;

    if (state.proxyIsSetAdminRole) {
        roleListApiQueryHelper.setFilters([{
            k: 'role_type',
            v: [ROLE_TYPE.DOMAIN_ADMIN],
            o: '=',
        }]);
    } else {
        roleListApiQueryHelper.setFilters([{
            k: 'role_type',
            v: [ROLE_TYPE.WORKSPACE_OWNER, ROLE_TYPE.WORKSPACE_MEMBER],
            o: '=',
        }]);
    }

    if (inputText) {
        roleListApiQueryHelper.addFilter({
            k: 'name',
            v: inputText,
            o: '',
        });
    }
    try {
        const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
            query: roleListApiQueryHelper.data,
        });
        roleState.menuItems = (results ?? []).map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        roleState.loading = false;
    }
};
const fetchListWorkspaces = async (inputText: string) => {
    workspaceState.loading = true;

    workspaceListApiQueryHelper.setFilters([{
        k: 'name',
        v: inputText,
        o: '',
    }]);
    try {
        const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>();
        workspaceState.menuItems = (results ?? []).map((role) => ({
            label: role.name,
            name: role.workspace_id,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        workspaceState.loading = false;
    }
};

/* Watcher */
watch([() => roleState.selectedItems, () => workspaceState.selectedItems], ([role, workspace]) => {
    emit('change-input', {
        role: role[0],
        workspace,
    });
});
watch(() => state.proxyIsSetAdminRole, () => {
    roleState.selectedItems = [];
    workspaceState.selectedItems = [];
});
</script>

<template>
    <div class="user-admin-role-wrapper">
        <div class="title-wrapper">
            <p-field-title :label="$t('IAM.USER.FORM.ASSIGN_DOMAIN_ROLE')" />
            <p-toggle-button v-model="state.proxyIsSetAdminRole"
                             @change-toggle="handleChangeToggleButton"
            />
        </div>
        <div v-if="!state.proxyIsSetAdminRole"
             class="workspace-role-form-view"
        >
            <p-divider />
            <p-field-group :label="$t('IAM.USER.FORM.ADD_WORKSPACE')"
                           required
                           class="workspace-role-form"
            >
                <p-select-dropdown use-fixed-menu-style
                                   :placeholder="$t('IAM.USER.FORM.SELECT_WORKSPACE')"
                                   :visible-menu.sync="workspaceState.visible"
                                   :loading="workspaceState.loading"
                                   :search-text.sync="workspaceState.searchText"
                                   :selected.sync="workspaceState.selectedItems"
                                   :handler="workspaceMenuHandler"
                                   is-filterable
                                   multi-selectable
                                   appearance-type="badge"
                                   show-delete-all-button
                                   class="workspace-select-dropdown"
                                   :class="{'no-data': workspaceState.menuItems.length === 0 && !workspaceState.loading}"
                >
                    <template #no-data-area>
                        <p-empty v-if="workspaceState.menuItems.length === 0 && !workspaceState.loading"
                                 image-size="sm"
                                 show-image
                                 show-button
                                 class="no-data-wrapper"
                        >
                            <template #image>
                                <img src="@/assets/images/illust_planet.svg"
                                     alt="empty-options"
                                >
                            </template>
                            <template #button>
                                <p-button style-type="substitutive"
                                          icon-left="ic_plus_bold"
                                          @click="router.push({ name: ADMINISTRATION_ROUTE.PREFERENCE.WORKSPACES._NAME })"
                                >
                                    {{ $t('IAM.USER.FORM.CREATE_WORKSPACE') }}
                                </p-button>
                            </template>
                            {{ $t('IAM.USER.FORM.NO_WORKSPACE') }}
                        </p-empty>
                    </template>
                </p-select-dropdown>
            </p-field-group>
            <p-field-group :label="$t('IAM.USER.FORM.WITH_ROLE')"
                           required
            >
                <p-select-dropdown use-fixed-menu-style
                                   :placeholder="$t('IAM.USER.FORM.ROLE_PLACEHOLDER')"
                                   :visible-menu.sync="roleState.visible"
                                   :loading="roleState.loading"
                                   :search-text.sync="roleState.searchText"
                                   :selected.sync="roleState.selectedItems"
                                   :handler="roleMenuHandler"
                                   is-filterable
                                   show-delete-all-button
                                   class="role-select-dropdown"
                >
                    <template #dropdown-left-area>
                        <img v-if="roleState.selectedItems.length > 0"
                             :src="useRoleFormatter(roleState.selectedItems[0]?.role_type).image"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                    </template>
                    <template #menu-item--format="{item}">
                        <div class="role-menu-item">
                            <img :src="useRoleFormatter(item.role_type).image"
                                 alt="role-type-icon"
                                 class="role-type-icon"
                            >
                            <span>{{ item.label }}</span>
                            <span class="role-type">({{ item.role_type }})</span>
                        </div>
                    </template>
                    <template #no-data-area>
                        <p-empty v-if="roleState.menuItems.length === 0 && !roleState.loading"
                                 image-size="sm"
                                 show-image
                                 show-button
                                 class="no-data-wrapper"
                        >
                            <template #image>
                                <img src="@/assets/images/illust_microscope.svg"
                                     alt="empty-options"
                                >
                            </template>
                            <template #button>
                                <router-link :to="{ name: ADMINISTRATION_ROUTE.IAM.ROLE.CREATE._NAME }">
                                    <p-button style-type="substitutive"
                                              icon-right="ic_arrow-right-up"
                                    >
                                        {{ $t('IAM.USER.FORM.CREATE_ROLE') }}
                                    </p-button>
                                </router-link>
                            </template>
                            {{ $t('IAM.USER.FORM.NO_ROLE') }}
                        </p-empty>
                    </template>
                </p-select-dropdown>
            </p-field-group>
        </div>
        <div v-else
             class="admin-role-form-view"
        >
            <span class="help-text">{{ $t('IAM.USER.FORM.ADMIN_ROLE_HELP_TEXT') }}</span>
            <p-field-group :label="$t('IAM.USER.FORM.WITH_ROLE')"
                           required
            >
                <p-select-dropdown use-fixed-menu-style
                                   :placeholder="$t('IAM.USER.FORM.SELECT_ROLE')"
                                   :visible-menu.sync="roleState.visible"
                                   :loading="roleState.loading"
                                   :search-text.sync="roleState.searchText"
                                   :selected.sync="roleState.selectedItems"
                                   :handler="roleMenuHandler"
                                   is-filterable
                                   show-delete-all-button
                                   class="role-select-dropdown"
                >
                    <template #dropdown-left-area>
                        <img v-if="roleState.selectedItems.length > 0"
                             :src="useRoleFormatter(roleState.selectedItems[0]?.role_type).image"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                    </template>
                    <template #menu-item--format="{item}">
                        <div class="role-menu-item">
                            <img :src="useRoleFormatter(item.role_type).image"
                                 alt="role-type-icon"
                                 class="role-type-icon"
                            >
                            <span>{{ item.label }}</span>
                            <span class="role-type">({{ item.role_type }})</span>
                        </div>
                    </template>
                    <template #no-data-area>
                        <p-empty v-if="roleState.menuItems.length === 0 && !roleState.loading"
                                 image-size="sm"
                                 show-image
                                 show-button
                                 class="no-data-wrapper"
                        >
                            <template #image>
                                <img src="@/assets/images/illust_microscope.svg"
                                     alt="empty-options"
                                >
                            </template>
                            <template #button>
                                <router-link :to="{ name: ADMINISTRATION_ROUTE.IAM.ROLE.CREATE._NAME }">
                                    <p-button style-type="substitutive"
                                              icon-right="ic_arrow-right-up"
                                    >
                                        {{ $t('IAM.USER.FORM.CREATE_ROLE') }}
                                    </p-button>
                                </router-link>
                            </template>
                            {{ $t('IAM.USER.FORM.NO_ROLE') }}
                        </p-empty>
                    </template>
                </p-select-dropdown>
            </p-field-group>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.user-admin-role-wrapper {
    @apply flex flex-col bg-white border border-primary-3 rounded-md;
    padding: 0.75rem;
    gap: 0.75rem;
    .title-wrapper {
        @apply flex justify-between;
    }
    .workspace-role-form-view {
        @apply flex flex-col;
        gap: 0.75rem;
        .workspace-role-form {
            margin-bottom: 0;
        }
    }
    .admin-role-form-view {
        @apply flex flex-col;
        margin-top: -0.25rem;
        gap: 0.375rem;
        .help-text {
            @apply text-paragraph-md text-gray-700;
        }
    }
    .role-select-dropdown {
        width: 100%;
        .role-type-icon {
            @apply rounded-full;
            width: 1rem;
            height: 1rem;
        }
        .role-menu-item {
            @apply flex items-center;
            gap: 0.25rem;
            .role-type {
                @apply text-gray-500;
            }
        }
    }
    .no-data-wrapper {
        margin-top: 2rem;
        margin-bottom: 2rem;
    }
}

/* TODO: will be deleted after p-select-dropdown update */

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .selection-display-container {
        @apply flex items-center;
        gap: 0.25rem;
    }
    &.no-data {
        .clear-all-wrapper {
            @apply hidden;
        }
    }
}
</style>
