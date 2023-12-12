<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PFieldGroup, PEmpty, PSelectDropdown,
} from '@spaceone/design-system';
import type { AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';

import type { AddModalMenuItem } from '@/services/administration/components/UserManagementAddModal.vue';
import { userRoleFormatter } from '@/services/administration/composables/refined-user-data';
import { useUserModalSettingStore } from '@/services/administration/store/user-modal-setting-store';

const modalSettingStore = useUserModalSettingStore();

const emit = defineEmits<{(e: 'change-role', role: AddModalMenuItem): void}>();

const state = reactive({
    loading: false,
    menuVisible: false,
    menuItems: [] as AddModalMenuItem[],
    selectedItems: [] as AddModalMenuItem[],
    // TODO: will be removed after the backend is ready
    domain_id: computed(() => store.state.domain.domainId),
});
const formState = reactive({
    searchText: '',
});

/* Component */
const menuHandler: AutocompleteHandler = async (inputText: string) => {
    await fetchListRoles(inputText);
    return {
        results: state.menuItems,
    };
};

/* API */
const roleListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true);

const fetchListRoles = async (inputText: string) => {
    state.loading = true;
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
        const response = await modalSettingStore.listRoles({
            query: roleListApiQueryHelper.data,
            domain_id: state.domain_id,
        });
        state.menuItems = response.map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        }));
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch(() => state.selectedItems, (selectedItems) => {
    emit('change-role', selectedItems[0]);
});
</script>

<template>
    <div class="user-role-wrapper">
        <p-field-group :label="$t('IDENTITY.USER.FORM.ROLE_TITLE')"
                       required
        >
            <p-select-dropdown use-fixed-menu-style
                               :placeholder="$t('IDENTITY.USER.FORM.ROLE_PLACEHOLDER')"
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
                         :src="userRoleFormatter(state.selectedItems[0]?.role_type).image"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                </template>
                <template #menu-item--format="{item}">
                    <div class="role-menu-item">
                        <img :src="userRoleFormatter(item.role_type).image"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                        <span>{{ item.label }}</span>
                        <span class="role-type">({{ item.role_type }})</span>
                    </div>
                </template>
                <template #no-data-area>
                    <p-empty v-if="state.menuItems.length === 0"
                             image-size="md"
                             show-image
                             class="no-data-wrapper"
                    >
                        <template #image>
                            <img src="@/assets/images/illust_microscope.svg"
                                 alt="empty-options"
                            >
                        </template>
                        {{ $t('INVENTORY.COLLECTOR.NO_DATA') }}
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

/* TODO: will be deleted after p-select-dropdown update */

/* custom design-system component - p-select-dropdown */
:deep(.p-select-dropdown) {
    .selection-display-container {
        @apply flex items-center;
        gap: 0.25rem;
    }
}
</style>
