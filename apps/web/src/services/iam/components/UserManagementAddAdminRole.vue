<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PFieldGroup, PEmpty, PSelectDropdown, PFieldTitle, PToggleButton, PDivider, PButton, PStatus,
} from '@cloudforet/mirinae';
import type {
    AutocompleteHandler,
} from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';
import type { WorkspaceListParameters } from '@/api-clients/identity/workspace/schema/api-verbs/list';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';
import type { AddModalMenuItem, AddAdminRoleFormState } from '@/services/iam/types/user-type';

interface Props {
    isSetAdminRole: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isSetAdminRole: true,
});

const router = useRouter();



const emit = defineEmits<{(e: 'change-input', formState: AddAdminRoleFormState): void,
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
const workspaceGroupState = reactive({
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

const roleListApiQueryHelper = new ApiQueryHelper().setSort('name', true);
const workspaceListApiQueryHelper = new ApiQueryHelper();
const workspaceGroupListApiQueryHelper = new ApiQueryHelper();

const handleChangeToggleButton = () => {
    state.proxyIsSetAdminRole = !state.proxyIsSetAdminRole;
};
const workspaceGroupMenuHandler: AutocompleteHandler = async (inputText: string, pageStart = 1, pageLimit = 10) => {
    workspaceGroupState.loading = true;

    workspaceGroupListApiQueryHelper
        .setSort('name', true)
        .setFilters([
            { k: 'name', v: inputText, o: '' },
        ]);
    try {
        const { results } = await SpaceConnector.clientV2.identity.workspaceGroup.list<WorkspaceListParameters, ListResponse<WorkspaceGroupModel>>({
            query: workspaceGroupListApiQueryHelper.data,
        });
        const refinedMenuItems = (results ?? []).map((workspaceGroup:WorkspaceGroupModel) => ({
            label: workspaceGroup.name,
            name: workspaceGroup.workspace_group_id,
        }));

        const totalCount = pageStart - 1 + Number(pageLimit);
        const slicedResults = refinedMenuItems?.slice(pageStart - 1, totalCount);
        workspaceGroupState.menuItems = slicedResults;
        return {
            results: slicedResults,
            more: totalCount < refinedMenuItems.length,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            results: [],
            more: false,
        };
    } finally {
        workspaceGroupState.loading = false;
    }
};
const workspaceMenuHandler: AutocompleteHandler = async (inputText: string, pageStart = 1, pageLimit = 10) => {
    workspaceState.loading = true;

    workspaceListApiQueryHelper
        .setSort('name', true)
        .setFilters([
            { k: 'name', v: inputText, o: '' },
            { k: 'state', v: 'ENABLED', o: '' },
            { k: 'is_dormant', v: false, o: '' },
        ]);
    try {
        const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
            query: workspaceListApiQueryHelper.data,
        });
        const refinedMenuItems = (results ?? []).map((workspace) => ({
            label: workspace.name,
            name: workspace.workspace_id,
            tags: workspace.tags,
            is_dormant: workspace.is_dormant,
        }));

        const totalCount = pageStart - 1 + Number(pageLimit);
        const slicedResults = refinedMenuItems?.slice(pageStart - 1, totalCount);
        workspaceState.menuItems = slicedResults;
        return {
            results: slicedResults,
            more: totalCount < refinedMenuItems.length,
        };
    } catch (e) {
        ErrorHandler.handleError(e);
        return {
            results: [],
            more: false,
        };
    } finally {
        workspaceState.loading = false;
    }
};
const roleMenuHandler: AutocompleteHandler = async (inputText: string, pageStart = 1, pageLimit = 10) => {
    roleState.loading = true;

    if (state.proxyIsSetAdminRole) {
        roleListApiQueryHelper.setFilters([{
            k: 'role_type',
            v: [ROLE_TYPE.DOMAIN_ADMIN],
            o: '=',
        }]);
    } else {
        roleListApiQueryHelper.setFilters([
            { k: 'role_type', v: [ROLE_TYPE.WORKSPACE_OWNER, ROLE_TYPE.WORKSPACE_MEMBER], o: '=' },
            { k: 'state', v: ROLE_STATE.ENABLED, o: '=' },
        ]);
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
            query: {
                ...roleListApiQueryHelper.data,
                filter: [
                    ...(roleListApiQueryHelper.data?.filter || []),
                    { k: 'state', v: ROLE_STATE.ENABLED, o: 'eq' },
                ],
            },
        });
        const refinedMenuItems = (results ?? []).map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        }));
        const totalCount = pageStart - 1 + Number(pageLimit);
        const slicedResults = refinedMenuItems?.slice(pageStart - 1, totalCount);
        roleState.menuItems = slicedResults;
        return {
            results: slicedResults,
            more: totalCount < refinedMenuItems.length,
        };
    } catch (e) {
        ErrorHandler.handleError(e);

        return {
            results: [],
            more: false,
        };
    } finally {
        roleState.loading = false;
    }
};

/* Watcher */
watch([() => roleState.selectedItems, () => workspaceState.selectedItems, () => workspaceGroupState.selectedItems], ([role, workspace, workspaceGroup]) => {
    emit('change-input', {
        role: role[0],
        workspace,
        workspaceGroup,
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
                <div class="target-wrapper">
                    <p-field-group style-type="substitutive"
                                   :label="$t('IAM.USER.FORM.WORKSPACE_GROUP')"
                                   required
                    >
                        <p-select-dropdown use-fixed-menu-style
                                           page-size="10"
                                           :placeholder="$t('IAM.USER.FORM.SELECT_WORKSPACE_GROUP')"
                                           :visible-menu.sync="workspaceGroupState.visible"
                                           :loading="workspaceGroupState.loading"
                                           :search-text.sync="workspaceGroupState.searchText"
                                           :selected.sync="workspaceGroupState.selectedItems"
                                           :handler="workspaceGroupMenuHandler"
                                           parent-id="workspace-role-form"
                                           show-select-marker
                                           show-select-header
                                           is-filterable
                                           multi-selectable
                                           appearance-type="badge"
                                           show-delete-all-button
                                           class="workspace-select-dropdown"
                                           :class="{'no-data': workspaceGroupState.menuItems.length === 0 && !workspaceGroupState.loading}"
                        >
                            <template #menu-item--format="{item}">
                                <div class="menu-item-wrapper"
                                     :class="{'is-dormant': item?.is_dormant}"
                                >
                                    <span class="label-text">{{ item.label }}</span>
                                </div>
                            </template>
                            <template #no-data-area>
                                <p-empty v-if="workspaceGroupState.menuItems.length === 0 && !workspaceGroupState.loading"
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
                                                  @click="router.push({ name: makeAdminRouteName(ADVANCED_ROUTE.WORKSPACES._NAME) })"
                                        >
                                            {{ $t('IAM.USER.FORM.CREATE_WORKSPACE') }}
                                        </p-button>
                                    </template>
                                    {{ $t('IAM.USER.FORM.NO_WORKSPACE') }}
                                </p-empty>
                            </template>
                        </p-select-dropdown>
                    </p-field-group>
                    <p-field-group style-type="substitutive"
                                   :label="$t('IAM.USER.FORM.WORKSPACE')"
                                   required
                    >
                        <p-select-dropdown use-fixed-menu-style
                                           page-size="10"
                                           :placeholder="$t('IAM.USER.FORM.SELECT_WORKSPACE')"
                                           :visible-menu.sync="workspaceState.visible"
                                           :loading="workspaceState.loading"
                                           :search-text.sync="workspaceState.searchText"
                                           :selected.sync="workspaceState.selectedItems"
                                           :handler="workspaceMenuHandler"
                                           parent-id="workspace-role-form"
                                           show-select-marker
                                           show-select-header
                                           is-filterable
                                           multi-selectable
                                           appearance-type="badge"
                                           show-delete-all-button
                                           class="workspace-select-dropdown"
                                           :class="{'no-data': workspaceState.menuItems.length === 0 && !workspaceState.loading}"
                        >
                            <template #menu-item--format="{item}">
                                <div class="menu-item-wrapper"
                                     :class="{'is-dormant': item?.is_dormant}"
                                >
                                    <div class="label">
                                        <workspace-logo-icon :text="item?.label || ''"
                                                             :theme="item?.tags?.theme"
                                                             size="xs"
                                        />
                                        <span class="label-text">{{ item.label }}</span>
                                        <p-status v-if="item?.is_dormant"
                                                  v-bind="workspaceStateFormatter(WORKSPACE_STATE.DORMANT)"
                                                  class="capitalize state"
                                        />
                                    </div>
                                </div>
                            </template>
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
                                                  @click="router.push({ name: makeAdminRouteName(ADVANCED_ROUTE.WORKSPACES._NAME) })"
                                        >
                                            {{ $t('IAM.USER.FORM.CREATE_WORKSPACE') }}
                                        </p-button>
                                    </template>
                                    {{ $t('IAM.USER.FORM.NO_WORKSPACE') }}
                                </p-empty>
                            </template>
                        </p-select-dropdown>
                    </p-field-group>
                </div>
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
                                   page-size="10"
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
                            <span class="role-type">({{ useRoleFormatter(item.role_type).name }})</span>
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
                                <router-link :to="{ name: ADMIN_IAM_ROUTE.ROLE.CREATE._NAME }">
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
                                <router-link :to="{ name: ADMIN_IAM_ROUTE.ROLE.CREATE._NAME }">
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

            .target-wrapper {
                @apply p-2 flex flex-col gap-2 bg-gray-100 rounded-md;

                .workspace-select-dropdown {
                    .menu-item-wrapper {
                        @apply flex justify-between;
                        max-width: 100%;

                        .label {
                            @apply flex items-center gap-2;
                        }
                        .state {
                            @apply text-label-sm;
                        }
                        .label-text {
                            @apply truncate;
                            max-width: 36.875rem;
                        }
                        &.is-dormant {
                            .label-text {
                                max-width: 31.25rem;
                            }
                        }
                    }
                }
            }
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

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    &.no-data {
        .clear-all-wrapper {
            @apply hidden;
        }
    }
}
</style>
