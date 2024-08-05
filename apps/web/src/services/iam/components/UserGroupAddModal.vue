<script setup lang="ts">
import { reactive } from 'vue';

import {
    PButtonModal, PFieldGroup, PTextInput, PSelectDropdown,
} from '@cloudforet/mirinae';
import type { AutocompleteHandler, SelectDropdownMenuItem } from '@cloudforet/mirinae/types/inputs/dropdown/select-dropdown/type';

import { i18n } from '@/translations';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';



const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.$state;

const state = reactive({
    loading: false,
    groupName: '',
    accessibleRoles: [],
    userMenuItems: [
        {
            name: 'bded132f-5ada-4329-95c8-c20f837c7344',
            label: 'Berkshire',
            type: 'item',
        },
        {
            name: '6fae6d95-913e-4bc3-933b-a9a3d83b8a5a',
            label: 'Table',
            type: 'item',
        },
        {
            name: 'e724a716-5e87-4dd4-ae88-9e3415908bd8',
            label: 'unleash',
            type: 'item',
        },
    ],
});

const fetchListUsers = async () => {
    state.loading = true;
};

const handleUserMenu: AutocompleteHandler = async (inputText: string) => {
    await fetchListUsers(inputText);

    return {
        results: state.userMenuItems as SelectDropdownMenuItem[],
    };
};

const handleConfirm = () => {
};

const handleCancel = () => {
    userGroupPageStore.closeModal();
};

const handleClose = () => {
    userGroupPageStore.closeModal();
};
</script>

<template>
    <p-button-modal class="user-group-add-modal"
                    :header-title="userGroupPageState.modal.title"
                    :visible="userGroupPageState.modal.visible === USER_GROUP_MODAL_TYPE.ADD"
                    :loading="userGroupPageState.loading"
                    size="sm"
                    @confirm="handleConfirm"
                    @cancel="handleCancel"
                    @close="handleClose"
    >
        <template #body>
            <div class="form-wrapper">
                <p-field-group
                    required
                    :label="i18n.t('IAM.USERGROUP.MODAL.ADD.GROUP_NAME')"
                    style-type="secondary"
                >
                    <p-text-input :value="state.groupName"
                                  :placeholder="i18n.t('IAM.USERGROUP.MODAL.ADD.GROUP_NAME_PLACEHOLDER')"
                    />
                </p-field-group>
                <p-field-group
                    required
                    :label="i18n.t('IAM.USERGROUP.MODAL.ADD.ACCESSIBLE_ROLES')"
                    style-type="secondary"
                >
                    <template #default>
                        <div class="dropdown-wrapper">
                            <p-select-dropdown
                                multi-selectable
                                appearance-type="stack"
                                is-fixed-width
                                readonly
                                :selected="[{&quot;name&quot;:&quot;berkshire&quot;}]"
                            />
                        </div>
                    </template>
                </p-field-group>
                <p-field-group
                    :label="i18n.t('IAM.USERGROUP.MODAL.ADD.USERS')"
                    style-type="secondary"
                >
                    <template #default>
                        <div class="dropdown-wrapper">
                            <p-select-dropdown
                                :loading="state.loading"
                                :menu="state.userMenuItems"
                                multi-selectable
                                appearance-type="stack"
                                show-select-marker
                                is-filterable
                                show-delete-all-button
                                page-size="11"
                                use-fixed-menu-style
                                :handler="handleUserMenu"
                            />
                            <!-- :selected="selectedUserItems"
                                :search-text.sync="state.searchText"
                                parent-id="project-member-invite"
                                :invalid="invalid"
                                @update:selected="setForm('selectedUserItems', $event)" -->
                        </div>
                    </template>
                </p-field-group>
            </div>
        </template>
    </p-button-modal>
</template>

<style lang="postcss" scoped>
.user-group-add-modal {
    .modal-contents {
        @apply flex flex-col bg-primary-4 rounded-md;
        margin-bottom: 9rem;
        padding: 1rem;
        gap: 1rem;
    }

    :deep(.p-field-group) {
        margin-bottom: 32px;

        .field-title-box {
            margin-bottom: 13px;

            .title {
                font-size: 0.875rem;
            }
        }
    }
}
</style>
