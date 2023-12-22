<script setup lang="ts">
import { reactive, watch } from 'vue';

import {
    PFieldGroup, PEmpty, PSelectDropdown, PFieldTitle, PButton,
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

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useRoleFormatter } from '@/services/administration/composables/refined-table-data';
import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';
import type { AddModalMenuItem } from '@/services/administration/types/user-type';


const emit = defineEmits<{(e: 'change-input', formState): void,
}>();

const roleState = reactive({
    loading: true,
    visible: false,
    menuItems: [] as AddModalMenuItem[],
    selectedItems: [] as AddModalMenuItem[],
    searchText: '',
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

/* API */
const fetchListRoles = async (inputText: string) => {
    roleState.loading = true;

    roleListApiQueryHelper.setFilters([{
        k: 'role_type',
        v: [ROLE_TYPE.DOMAIN_ADMIN],
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
        const { results } = await SpaceConnector.clientV2.identity.role.list<RoleListParameters, ListResponse<RoleModel>>({
            query: roleListApiQueryHelper.data,
        });
        roleState.menuItems = results?.map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        })) as AddModalMenuItem[];
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        roleState.loading = false;
    }
};

/* Watcher */
watch(() => roleState.selectedItems, (role) => {
    emit('change-input', {
        role: role[0],
    });
});
</script>

<template>
    <div class="user-admin-role-wrapper">
        <div class="title-wrapper">
            <p-field-title :label="$t('IAM.USER.FORM.ASSIGN_DOMAIN_ROLE')" />
        </div>
        <div class="admin-role-form-view">
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
