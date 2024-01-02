<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput, PSelectDropdown,
} from '@spaceone/design-system';
import type { SelectDropdownMenuItem, AutocompleteHandler } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';
import type { InputItem } from '@spaceone/design-system/types/inputs/input/text-input/type';
import { cloneDeep } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import { RESOURCE_GROUP } from '@/schema/_common/constant';
import type { Tags } from '@/schema/_common/model';
import type { AppModel } from '@/schema/identity/app/model';
import type { RoleListParameters } from '@/schema/identity/role/api-verbs/list';
import { ROLE_TYPE } from '@/schema/identity/role/constant';
import type { RoleModel } from '@/schema/identity/role/model';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import ErrorHandler from '@/common/composables/error/errorHandler';

import { APP_DROPDOWN_MODAL_TYPE } from '@/services/administration/constants/app-constant';
import { useAppPageStore } from '@/services/administration/store/app-page-store';

const appContextStore = useAppContextStore();
const appPageStore = useAppPageStore();
const appPageState = appPageStore.$state;

const emit = defineEmits<{(e: 'confirm', value?: AppModel): void;
}>();

const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isEdit: computed(() => appPageState.modal.type === APP_DROPDOWN_MODAL_TYPE.EDIT),
});
const formState = reactive({
    name: '',
    role: {} as SelectDropdownMenuItem,
    tags: {} as Tags,
    selectedTags: [] as SelectDropdownMenuItem[],
});
const dropdownState = reactive({
    visible: false,
    loading: false,
    searchText: '',
    menuItems: [] as SelectDropdownMenuItem[],
    selectedMenuItems: [] as SelectDropdownMenuItem[],
});

/* Component */
const menuHandler: AutocompleteHandler = async (inputText: string) => {
    await fetchListRoles(inputText);
    return {
        results: dropdownState.menuItems,
    };
};
const handleClose = () => {
    appPageStore.$patch((_state) => {
        _state.modal.type = '';
        _state.modal.visible.form = false;
        _state.modal = cloneDeep(_state.modal);
    });
    initState();
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
const setFormState = () => {
    formState.name = appPageStore.selectedApp.name;
    formState.tags = appPageStore.selectedApp.tags as Tags;
    formState.selectedTags = Object.keys(formState.tags).map((key) => ({
        label: `${key}: ${formState.tags[key]}`,
        name: `${key}: ${formState.tags[key]}`,
    }));
};
const initState = () => {
    formState.name = '';
    formState.role = {} as SelectDropdownMenuItem;
    formState.tags = {} as Tags;
    dropdownState.searchText = '';
    dropdownState.selectedMenuItems = [];
};

/* API */
const roleListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true);
const fetchListRoles = async (inputText: string) => {
    dropdownState.loading = true;
    roleListApiQueryHelper.setFilters([{
        k: 'role_type',
        v: storeState.isAdminMode ? [ROLE_TYPE.DOMAIN_ADMIN] : [ROLE_TYPE.WORKSPACE_OWNER],
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
        dropdownState.menuItems = (results ?? []).map((role) => ({
            label: role.name,
            name: role.role_id,
        }));
    } finally {
        dropdownState.loading = false;
    }
};
const handleConfirm = async () => {
    try {
        if (storeState.isEdit) {
            await appPageStore.updateApp({
                app_id: appPageStore.selectedApp.app_id,
                name: formState.name,
                tags: formState.tags,
            });
            emit('confirm');
        } else {
            const res = await appPageStore.createApp({
                name: formState.name,
                role_id: formState.role.name,
                tags: formState.tags,
                resource_group: storeState.isAdminMode ? RESOURCE_GROUP.DOMAIN : RESOURCE_GROUP.WORKSPACE,
            });
            emit('confirm', res);
            appPageStore.$patch((_state) => {
                _state.modal.visible.apiKey = true;
                _state.modal = cloneDeep(_state.modal);
            });
        }
        handleClose();
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
    }
};

/* Watcher */
watch(() => storeState.isEdit, (isEdit) => {
    if (isEdit) {
        setFormState();
    }
}, { immediate: true });
</script>

<template>
    <div>
        <p-button-modal class="app-management-form-modal"
                        :header-title="appPageState.modal.title"
                        size="sm"
                        :fade="true"
                        :backdrop="true"
                        :visible="appPageState.modal.visible.form"
                        :disabled="storeState.isEdit
                            ? formState.name === ''
                            : formState.name === '' || dropdownState.selectedMenuItems.length === 0"
                        :loading="appPageState.modal.loading"
                        @confirm="handleConfirm"
                        @cancel="handleClose"
                        @close="handleClose"
        >
            <template #body>
                <div class="form-contents">
                    <p-field-group :label="$t('IAM.APP.MODAL.COL_NAME')"
                                   class="input-form"
                                   required
                    >
                        <p-text-input v-model="formState.name"
                                      class="text-input"
                                      block
                        />
                    </p-field-group>
                    <p-field-group v-if="!storeState.isEdit"
                                   :label="storeState.isAdminMode ? $t('IAM.APP.MODAL.COL_ADMIN_ROLE') : $t('IAM.APP.MODAL.COL_WORKSPACE_ROLE')"
                                   required
                                   class="input-form"
                    >
                        <p-select-dropdown use-fixed-menu-style
                                           :placeholder="$t('IAM.APP.MODAL.COL_ADMIN_ROLE_PLACEHOLDER')"
                                           :visible-menu.sync="dropdownState.visible"
                                           :loading="dropdownState.loading"
                                           :search-text.sync="dropdownState.searchText"
                                           :selected.sync="dropdownState.selectedMenuItems"
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
                                      :placeholder="$t('IDENTITY.TAGS_PLACEHOLDER')"
                                      appearance-type="stack"
                                      block
                                      :selected="storeState.isEdit ? formState.selectedTags : []"
                                      @update:selected="handleChangeTags"
                        />
                    </p-field-group>
                </div>
            </template>
        </p-button-modal>
    </div>
</template>

<style lang="postcss">
.app-management-form-modal {
    display: initial;
    .form-contents {
        @apply flex flex-col;
        gap: 1rem;
        .input-form {
            margin-bottom: 0;
        }
    }
}
</style>
