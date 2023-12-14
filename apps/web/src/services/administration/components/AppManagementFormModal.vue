<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput, PSelectDropdown,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import type { InputItem } from '@spaceone/design-system/types/inputs/input/text-input/type';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { Tags } from '@/schema/_common/model';
import { ROLE_TYPE } from '@/schema/identity/role/constant';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { useAppPageStore } from '@/services/administration/store/app-page-store';

const appContextStore = useAppContextStore();
const appPageStore = useAppPageStore();
const appPageState = appPageStore.$state;

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const formState = reactive({
    name: '',
    role: {} as SelectDropdownMenuItem,
    tags: {} as Tags,
});
const dropdownState = reactive({
    visible: false,
    loading: false,
    searchText: '',
    menuItems: [] as SelectDropdownMenuItem[],
    selectedItems: [] as SelectDropdownMenuItem[],
});

/* Component */
const menuHandler: AutocompleteHandler = async (inputText: string) => {
    await fetchListRoles(inputText);
    return {
        results: dropdownState.menuItems,
    };
};
const handleClose = () => {
    formState.name = '';
    formState.role = {} as SelectDropdownMenuItem;
    formState.tags = {} as Tags;
    dropdownState.searchText = '';
    dropdownState.selectedItems = [];
    appPageStore.$patch((_state) => {
        _state.modal.visible.form = false;
    });
};
const handleChangeTags = (items: InputItem[]) => {
    const refinedTags = items.map((item) => {
        if (item.name.includes(':')) {
            const tags = item.name.split(':').map((tag) => tag.trim());
            return { [tags[0]]: tags[1] };
        }
        return { [item.name]: item.name };
    });

    formState.tags = Object.assign({}, ...refinedTags);
};
const handleSelectItem = (item: SelectDropdownMenuItem) => {
    formState.role = item;
};

/* API */
const roleListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true);
const fetchListRoles = async (inputText: string) => {
    dropdownState.loading = true;
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
        const response = await appPageStore.listRoles({
            query: roleListApiQueryHelper.data,
        });
        dropdownState.menuItems = response.map((role) => ({
            label: role.name,
            name: role.role_id,
            role_type: role.role_type,
        }));
    } finally {
        dropdownState.loading = false;
    }
};
// TODO: will be checked after implementing the API
const handleConfirm = async () => {
    try {
        await appPageStore.createApp({
            name: formState.name,
            role_id: formState.role.name,
            tags: formState.tags,
            resource_group: storeState.isAdminMode ? RESOURCE_GROUP.DOMAIN : RESOURCE_GROUP.WORKSPACE,
        });
        handleClose();
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};
</script>

<template>
    <p-button-modal class="user-management-form-modal"
                    :header-title="appPageState.modal.title"
                    size="sm"
                    :fade="true"
                    :backdrop="true"
                    :visible="appPageState.modal.visible.form"
                    :disabled="formState.name === '' || dropdownState.selectedItems.length === 0"
                    :loading="appPageState.modal.loading"
                    @confirm="handleConfirm"
                    @cancel="handleClose"
                    @close="handleClose"
    >
        <template #body>
            <p-field-group :label="$t('IAM.APP.MODAL.COL_NAME')"
                           class="input-form"
                           required
            >
                <p-text-input v-model="formState.name"
                              class="text-input"
                              block
                />
            </p-field-group>
            <p-field-group :label="storeState.isAdminMode ? $t('IAM.APP.MODAL.COL_ADMIN_ROLE') : $t('IAM.APP.MODAL.COL_WORKSPACE_ROLE')"
                           required
            >
                <p-select-dropdown use-fixed-menu-style
                                   :placeholder="$t('IAM.APP.MODAL.COL_ADMIN_ROLE_PLACEHOLDER')"
                                   :visible-menu.sync="dropdownState.visible"
                                   :loading="dropdownState.loading"
                                   :search-text.sync="dropdownState.searchText"
                                   :selected.sync="dropdownState.selectedItems"
                                   :handler="menuHandler"
                                   is-filterable
                                   :multi-selectable="false"
                                   class="role-select-dropdown"
                                   @select="handleSelectItem"
                />
            </p-field-group>
            <p-field-group :label="$t('IAM.APP.MODAL.COL_TAG')"
                           class="input-form"
            >
                <p-text-input class="text-input"
                              multi-input
                              appearance-type="stack"
                              block
                              @update:selected="handleChangeTags"
                />
            </p-field-group>
        </template>
    </p-button-modal>
</template>

<style lang="postcss">
.user-management-form-modal {
    display: initial;
}
</style>
