<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import {
    PFieldGroup, PSelectDropdown,
} from '@spaceone/design-system';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';

import { useUserModalSettingStore } from '@/services/administration/store/user-modal-setting-store';

interface SelectMenu {
    label: string;
    name: string;
    role_type: string;
}

const modalSettingStore = useUserModalSettingStore();
const modalSettingState = modalSettingStore.$state;

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

/* API */
const roleListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true)
    .setFiltersAsRawQueryString(route.query?.filters);
const roleListApiQuery = roleListApiQueryHelper.data;

const fetchListRoles = async () => {
    state.loading = true;
    try {
        await modalSettingStore.listRoles({
            query: roleListApiQuery,
            domain_id: state.domain_id,
        });
        state.menuItems = modalSettingState.roles.map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        }));
    } finally {
        state.loading = false;
    }
};

/* Init */
(async () => {
    await fetchListRoles();
})();
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
                               :menu="state.menuItems"
                               :selected.sync="state.selectedItems"
                               is-filterable
                               class="role-select-dropdown"
            />
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
    }
}
</style>
