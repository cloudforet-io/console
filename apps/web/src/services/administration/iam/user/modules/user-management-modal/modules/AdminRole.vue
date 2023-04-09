<template>
    <div class="admin-role-wrapper">
        <div class="admin-role-headline">
            <p-toggle-button
                :value="state.isToggled"
                @change-toggle="handleUpdateToggle"
            />
            <span class="title">{{ $t('IDENTITY.USER.FORM.ASSIGN_DOMAIN_ROLE') }}</span>
        </div>
        <!-- CAUTION: Do not remove key binding at select dropdown. This is for initiating scroll parent to refresh fixed menu style. -->
        <p-select-dropdown v-if="state.isToggled"
                           :key="props.activeTab"
                           :items="formState.domainRoleItem"
                           :disabled="formState.domainRoleItem.length < 2 || state.isSameId"
                           use-fixed-menu-style
                           :selected="state.selectedMenuIndex"
                           index-mode
                           class="dropdown"
                           @select="handleSelectedMenuIndex"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PToggleButton, PSelectDropdown } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import { store } from '@/store';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

interface Props {
    activeTab?: string
}
const props = withDefaults(defineProps<Props>(), {
    activeTab: '',
});

const emit = defineEmits<{(e: 'change-input', formState): void}>();

const state = reactive({
    isSameId: false,
    isToggled: false,
    selectedMenuIndex: 0,
});
const formState = reactive({
    domainRole: '',
    domainRoleItem: computed(() => [
        { type: 'item', label: i18n.t('IDENTITY.USER.FORM.NOT_SELECT_ROLE'), name: '' },
        ...formState.domainRoleList,
    ]),
    domainRoleList: [] as any[],
});

/* Components */
const handleUpdateToggle = () => {
    state.isToggled = !state.isToggled;
};
const handleSelectedMenuIndex = (selectedIndex: number) => {
    state.selectedMenuIndex = selectedIndex;
    formState.domainRole = formState.domainRoleItem[selectedIndex].label;
    emit('change-input', { domainRole: formState.domainRole });
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
})();
</script>

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
