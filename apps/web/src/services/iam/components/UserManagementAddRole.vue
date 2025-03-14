<script setup lang="ts">
import { reactive, watch } from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PFieldGroup, PEmpty, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { AutocompleteHandler } from '@cloudforet/mirinae/types/controls/dropdown/select-dropdown/type';


import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import { ROLE_STATE, ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleListParameters } from '@/api-clients/identity/role/schema/api-verbs/list';
import type { RoleModel } from '@/api-clients/identity/role/schema/model';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useRoleFormatter } from '@/services/iam/composables/refined-table-data';
import type { AddModalMenuItem } from '@/services/iam/types/user-type';


const emit = defineEmits<{(e: 'change-input', formState): void}>();

const state = reactive({
    loading: true,
    menuVisible: false,
    menuItems: [] as AddModalMenuItem[],
    selectedItems: [] as AddModalMenuItem[],
});
const formState = reactive({
    searchText: '',
});

const roleListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true);

/* Component */
const menuHandler: AutocompleteHandler = async (inputText: string) => {
    await fetchListRoles(inputText);
    return {
        results: state.menuItems,
    };
};

/* API */
const fetchListRoles = async (inputText: string) => {
    state.loading = true;

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
        state.menuItems = (results ?? []).map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        }));
    } catch (e) {
        ErrorHandler.handleError(e);
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch(() => state.selectedItems, (selectedItems) => {
    emit('change-input', { role: selectedItems[0] });
});
</script>

<template>
    <div class="user-role-wrapper">
        <p-field-group :label="$t('IAM.USER.FORM.ROLE_TITLE')"
                       required
        >
            <p-select-dropdown use-fixed-menu-style
                               :placeholder="$t('IAM.USER.FORM.ROLE_PLACEHOLDER')"
                               :visible-menu.sync="state.menuVisible"
                               :loading="state.loading"
                               :search-text.sync="formState.searchText"
                               :selected.sync="state.selectedItems"
                               :handler="menuHandler"
                               is-filterable
                               show-delete-all-button
                               class="role-select-dropdown"
            >
                <template #dropdown-left-area>
                    <img v-if="state.selectedItems.length > 0"
                         :src="useRoleFormatter(state.selectedItems[0]?.role_type).image"
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
                    <p-empty v-if="state.menuItems.length === 0 && !state.loading"
                             image-size="md"
                             show-image
                             class="no-data-wrapper"
                    >
                        <template #image>
                            <img src="@/assets/images/illust_microscope.svg"
                                 alt="empty-options"
                            >
                        </template>
                        {{ $t('IAM.USER.FORM.NO_DATA') }}
                    </p-empty>
                </template>
            </p-select-dropdown>
        </p-field-group>
    </div>
</template>

<style scoped lang="postcss">
.user-role-wrapper {
    @apply flex flex-col bg-white border border-primary-3 rounded-md;
    height: 4.875rem;
    padding: 0.75rem;
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
        .no-data-wrapper {
            margin-top: 2rem;
            margin-bottom: 2rem;
        }
    }
}
</style>
