<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PFieldGroup, PEmpty, PSelectDropdown,
} from '@spaceone/design-system';
import type { AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleType } from '@/schema/identity/role/type';
import { store } from '@/store';

import { useUserModalSettingStore } from '@/services/administration/store/user-modal-setting-store';

interface SelectMenu {
    label: string;
    name: string;
    role_type: RoleType;
}

const modalSettingStore = useUserModalSettingStore();

const route = useRoute();

const state = reactive({
    loading: false,
    searchText: '',
    selectedItems: [] as SelectMenu[],
    menuItems: [] as SelectMenu[],
    menuVisible: false,
    // TODO: will be removed after the backend is ready
    domain_id: computed(() => store.state.domain.domainId),
});

/* Component */
const roleTypeIconFormatter = (type: RoleType) => {
    switch (type) {
    case ROLE_TYPE.WORKSPACE_OWNER: return '/images/img_avatar_workspace-owner.png';
    case ROLE_TYPE.WORKSPACE_MEMBER: return '/images/img_avatar_workspace-member.png';
    default: return '';
    }
};
const menuHandler: AutocompleteHandler = async (inputText: string) => {
    await fetchListRoles(inputText);
    return {
        results: state.menuItems,
    };
};

/* API */
const roleListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true)
    .setFiltersAsRawQueryString(route.query?.filters);

const fetchListRoles = async (inputText: string) => {
    state.loading = true;
    try {
        roleListApiQueryHelper.setOrFilters([
            {
                k: 'role_type',
                v: ROLE_TYPE.WORKSPACE_OWNER,
                o: '=',
            },
            {
                k: 'role_type',
                v: ROLE_TYPE.WORKSPACE_MEMBER,
                o: '=',
            }]);
        if (inputText) {
            roleListApiQueryHelper.setFilters([{
                k: 'name',
                v: inputText,
                o: '',
            }]);
        }
        const params = {
            query: roleListApiQueryHelper.data,
            domain_id: state.domain_id,
        };

        const response = await modalSettingStore.listRoles(params);
        state.menuItems = response.map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        }));
    } finally {
        state.loading = false;
    }
};
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
                               :search-text.sync="state.searchText"
                               :selected.sync="state.selectedItems"
                               :handler="menuHandler"
                               :is-filterable="state.menuItems.length > 0"
                               show-delete-all-button
                               class="role-select-dropdown"
            >
                <template #dropdown-left-area>
                    <img v-if="state.selectedItems.length > 0"
                         :src="roleTypeIconFormatter(state.selectedItems[0]?.role_type)"
                         alt="role-type-icon"
                         class="role-type-icon"
                    >
                </template>
                <template #menu-item--format="{item}">
                    <div class="role-menu-item">
                        <img :src="roleTypeIconFormatter(item.role_type)"
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
