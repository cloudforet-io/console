<script setup lang="ts">
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { PToggleButton, PSelectDropdown } from '@spaceone/design-system';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { User } from '@/services/administration/iam/user/type';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface Props {
    activeTab?: string
    item?: User;
}
const props = withDefaults(defineProps<Props>(), {
    activeTab: '',
    item: undefined,
});
const store = useStore();
const { t } = useI18n();

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const emit = defineEmits<{(e: 'change-input', formState): void}>();

const state = reactive({
    isSameId: false,
    isToggled: false,
    selectedMenuIndex: 0,
});
const formState = reactive({
    domainRole: '',
    roleId: '',
    domainRoleList: [] as any[],
});

/* Components */
const handleUpdateToggle = () => {
    state.isToggled = !state.isToggled;
    if (state.isToggled) {
        state.selectedMenuIndex = 0;
        formState.domainRole = formState.domainRoleList[0].label;
        formState.roleId = formState.domainRoleList[0].name;
    } else {
        formState.domainRole = '';
        formState.roleId = '';
    }
    emit('change-input', { ...formState, domainRole: formState.domainRole, roleId: formState.roleId });
};
const handleSelectedMenuIndex = (selectedIndex: number) => {
    state.selectedMenuIndex = selectedIndex;
    formState.domainRole = formState.domainRoleList[selectedIndex].label;
    formState.roleId = formState.domainRoleList[selectedIndex].name;
    emit('change-input', { ...formState, domainRole: formState.domainRole, roleId: formState.roleId });
};
const setForm = async () => {
    if (formState.domainRoleList[0] && userPageStore.selectedUsers[0].role_bindings && userPageStore.selectedUsers[0].role_bindings.length > 0) {
        state.selectedMenuIndex = formState.domainRoleList.findIndex((data) => data.name === props.item?.role_bindings?.find((role) => role.role_info.role_type === 'DOMAIN')?.role_info.role_id);
        if (state.selectedMenuIndex === -1) return;
        state.isToggled = true;
        formState.domainRole = formState.domainRoleList[state.selectedMenuIndex].label;
        formState.roleId = formState.domainRoleList[state.selectedMenuIndex].name;
        emit('change-input', { ...formState, domainRole: formState.domainRole, roleId: formState.roleId });
    } else formState.domainRole = '';
};

/* API */
const getRoleList = async () => {
    try {
        const { results } = await SpaceConnector.client.identity.role.list({
            role_type: 'DOMAIN',
        });
        formState.domainRoleList = results.map((d) => ({
            type: 'item',
            label: d.name,
            name: d.role_id,
        }));
        formState.domainRole = formState.domainRoleList[0].label;
    } catch (e) {
        ErrorHandler.handleError(e);
        formState.domainRoleList = [];
    }
};

/* init */
(async () => {
    await Promise.allSettled([
        getRoleList(),
        // LOAD REFERENCE STORE
        store.dispatch('reference/user/load'),
    ]);
    if (userPageState.visibleUpdateModal) {
        await setForm();
    }
})();
</script>

<template>
    <div class="admin-role-wrapper">
        <div class="admin-role-headline">
            <p-toggle-button
                :value="state.isToggled"
                @change-toggle="handleUpdateToggle"
            />
            <span class="title">{{ t('IDENTITY.USER.FORM.ASSIGN_DOMAIN_ROLE') }}</span>
        </div>
        <!-- CAUTION: Do not remove key binding at select dropdown. This is for initiating scroll parent to refresh fixed menu style. -->
        <p-select-dropdown v-if="state.isToggled"
                           :key="`admin-role-${props.activeTab}`"
                           :items="formState.domainRoleList"
                           :disabled="formState.domainRoleList.length < 2 || state.isSameId"
                           use-fixed-menu-style
                           :selected="state.selectedMenuIndex"
                           index-mode
                           class="dropdown"
                           @select="handleSelectedMenuIndex"
        />
    </div>
</template>

<style lang="postcss" scoped>
.admin-role-wrapper {
    @apply flex flex-col bg-white rounded-lg;
    padding: 0.75rem;
    gap: 0.875rem;
    .admin-role-headline {
        @apply flex items-center;
        gap: 0.5rem;
        .title {
            @apply text-label-md font-bold;
        }
    }
}
</style>
