<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { isEmpty } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PFieldGroup, PEmpty, PSelectDropdown, PFieldTitle, PButton, PToggleButton,
} from '@cloudforet/mirinae';
import type {
    AutocompleteHandler,
    SelectDropdownMenuItem,
} from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';

import { useUserStore } from '@/store/user/user-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import { useProxyValue } from '@/common/composables/proxy-state';

import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';
import { ADMIN_IAM_ROUTE } from '@/services/iam/routes/admin/route-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { AddModalMenuItem, UserListItemType } from '@/services/iam/types/user-type';

interface Props {
    role?: AddModalMenuItem
    isChangedToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    role: undefined,
    isChangedToggle: false,
});

const emit = defineEmits<{(e: 'update:role', formState): void,
    (e: 'update:is-changed-toggle', type: string): void,
}>();
const userPageStore = useUserPageStore();
const userStore = useUserStore();

const roleState = reactive({
    loading: true,
    visible: false,
    searchText: '',
    data: computed<UserListItemType>(() => userPageStore.getters.selectedUsers[0]),
    menuItems: [] as AddModalMenuItem[],
    proxySelectedItems: useProxyValue('role', props, emit),
    selectedItems: computed(() => {
        if (isEmpty(roleState.proxySelectedItems)) return [];
        return [{
            label: roleState.proxySelectedItems.label,
            name: roleState.proxySelectedItems.name,
            role_type: roleState.proxySelectedItems.role_type,
        }];
    }),
    proxyIsChangedToggle: useProxyValue('isChangedToggle', props, emit),
});

const roleListApiQueryHelper = new ApiQueryHelper()
    .setSort('name', true);

/* Component */
const roleMenuHandler: AutocompleteHandler = async (inputText: string) => {
    await fetchListRoles(inputText);
    return {
        results: roleState.menuItems as SelectDropdownMenuItem[],
    };
};
const handleSelectMenuItem = (role: AddModalMenuItem) => {
    roleState.proxySelectedItems = role;
};
const handleChangeToggleButton = (value) => {
    roleState.proxyIsChangedToggle = value;
};

/* API */
const fetchListRoles = async (inputText: string) => {
    roleState.loading = true;

    roleListApiQueryHelper.setFilters([
        { k: 'role_type', v: [ROLE_TYPE.DOMAIN_ADMIN], o: '=' },
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
        roleState.menuItems = (results ?? [])?.map((role) => ({
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

/* Watcher */
watch(() => roleState.proxySelectedItems, (role) => {
    roleState.proxyIsChangedToggle = !!role.name;
}, { immediate: true });
</script>

<template>
    <div class="user-admin-role-wrapper">
        <div class="title-wrapper">
            <p-field-title :label="$t('IAM.USER.FORM.ASSIGN_DOMAIN_ROLE')" />
            <p-toggle-button :value="roleState.proxyIsChangedToggle"
                             @change-toggle="handleChangeToggleButton"
            />
        </div>
        <div v-if="roleState.proxyIsChangedToggle"
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
                                   :search-text="roleState.searchText"
                                   :selected="roleState.selectedItems"
                                   :handler="roleMenuHandler"
                                   :disabled="roleState.data.user_id === userStore.state.userId"
                                   is-filterable
                                   show-delete-all-button
                                   class="role-select-dropdown"
                                   @select="handleSelectMenuItem"
                >
                    <template #dropdown-left-area>
                        <img v-if="!isEmpty(roleState.proxySelectedItems)"
                             :src="useRoleFormatter(roleState.proxySelectedItems.role_type).image"
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
    @apply flex flex-col bg-white rounded-md;
    padding: 0.75rem;
    gap: 0.75rem;
    .title-wrapper {
        @apply flex justify-between;
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
