<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, reactive, ref, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PContextMenu, PEmpty, PFieldGroup, PIconButton, PTextInput, PSelectDropdown,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/src/inputs/context-menu/type';
import { debounce, isEmpty } from 'lodash';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { AuthType } from '@/schema/identity/user/type';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useWorkspaceStore } from '@/store/app-context/workspace/workspace-store';

import type { AddModalMenuItem } from '@/services/administration/components/UserManagementAddModal.vue';
import { checkEmailFormat } from '@/services/administration/helpers/user-management-form-validations';
import { useUserModalSettingStore } from '@/services/administration/store/user-modal-setting-store';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const modalSettingStore = useUserModalSettingStore();
const userPageStore = useUserPageStore();
const workspaceStore = useWorkspaceStore();

const containerRef = ref<HTMLElement|null>(null);
const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);

const emit = defineEmits<{(e: 'change-list', selectedItems: MenuItem[]): void}>();

const storeState = reactive({
    userAuthType: computed(() => store.state.user.authType),
});
const state = reactive({
    loading: false,
    menuVisible: false,
    menuItems: [] as AddModalMenuItem[],
    selectedItems: [] as AddModalMenuItem[],
    selectedAuthType: '' as AuthType,
    // TODO: will be changed
    authTypeMenuItems: computed<MenuItem[]>(() => {
        if (storeState.userAuthType === 'LOCAL') {
            return [{ label: 'local', name: 'LOCAL' }];
        }
        return [
            { label: 'local', name: 'LOCAL' },
            { label: 'external', name: 'EXTERNAL' },
        ];
    }),
});
const formState = reactive({
    searchText: '',
});
const validationState = reactive({
    userIdInvalid: undefined as undefined | boolean,
    userIdInvalidText: '' as TranslateResult,
});

const userListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true);

/* Component */
const hideMenu = async () => {
    emit('change-list', state.selectedItems);
    state.menuVisible = false;
    state.menuItems = [];
    await userPageStore.listWorkspaceUsers({ query: userListApiQueryHelper.data });
};
const handleClickUserIdInput = async () => {
    state.menuVisible = true;
    validationState.userIdInvalid = false;
    validationState.userIdInvalidText = '';
};
const handleClickDeleteButton = (idx: number) => {
    state.selectedItems.splice(idx, 1);
};
const handleSelectMenuItem = async (menuItem: AddModalMenuItem) => {
    state.selectedItems.push(menuItem);
    await hideMenu();
};
const handleChangeUserIdInput = debounce(async (searchText: string) => {
    formState.searchText = searchText;
    validationState.userIdInvalid = false;
    validationState.userIdInvalidText = '';
    await fetchListUsers();
}, 200);

const handleClickEnter = async () => {
    if (formState.searchText === '') return;
    const { isValid, invalidText } = checkEmailFormat(formState.searchText);
    if (!isValid) {
        validationState.userIdInvalid = true;
        validationState.userIdInvalidText = invalidText;
        await hideMenu();
    } else {
        await fetchListWorkspaceUsers(formState.searchText);
    }
};
const handleSelectAuthTypeItem = (idx: number) => {
    state.selectedItems[idx].auth_type = state.selectedAuthType;
};

/* API */
const fetchListUsers = async () => {
    state.loading = true;

    try {
        const response = await modalSettingStore.listUsers({
            keyword: formState.searchText || '@',
            exclude_workspace_id: workspaceStore.getters.currentWorkspaceId,
        });
        state.menuItems = response.map((user) => ({
            user_id: user.user_id,
            label: user.name ? `${user.user_id} (${user.name})` : user.user_id,
            name: user.user_id,
            auth_type: user.auth_type,
        }));
    } finally {
        state.loading = false;
    }
};
const fetchListWorkspaceUsers = async (userId: string) => {
    const params = {
        user_id: userId,
        workspace_id: workspaceStore.getters.currentWorkspaceId,
    };
    const response = await modalSettingStore.getWorkspaceUser(params);
    if (isEmpty(response)) {
        state.selectedItems.push({
            user_id: userId,
            label: userId,
            name: userId,
            isNew: true,
            auth_type: state.authTypeMenuItems[0].name as AuthType,
        });
        formState.searchText = '';
    } else {
        validationState.userIdInvalid = true;
        validationState.userIdInvalidText = i18n.t('IDENTITY.USER.FORM.USER_ID_INVALID_WORKSPACE', { userId });
    }
    await hideMenu();
};

/* Context Menu */
onClickOutside(containerRef, hideMenu);

watch(() => state.menuVisible, async (menuVisible) => {
    if (menuVisible) {
        formState.searchText = '';
        state.selectedAuthType = state.authTypeMenuItems[0].name as AuthType;
        await fetchListUsers();
    }
});
</script>

<template>
    <div class="user-info-wrapper">
        <p-field-group :label="$t('IDENTITY.USER.FORM.USER_ID')"
                       required
                       :invalid="validationState.userIdInvalid"
                       :invalid-text="validationState.userIdInvalidText"
        >
            <template #default="{invalid}">
                <div ref="containerRef"
                     class="input-form-wrapper"
                >
                    <p-text-input ref="targetRef"
                                  :value="formState.searchText"
                                  :invalid="invalid"
                                  class="user-id-input"
                                  @click="handleClickUserIdInput"
                                  @keyup.enter="handleClickEnter"
                                  @update:value="handleChangeUserIdInput"
                    />
                    <p-context-menu v-if="state.menuVisible && state.menuItems.length > 0"
                                    ref="contextMenuRef"
                                    :loading="state.loading"
                                    :menu="state.menuItems"
                                    :selected="state.selectedItems"
                                    multi-selectable
                                    class="user-context-menu"
                                    @select="handleSelectMenuItem"
                    />
                </div>
            </template>
        </p-field-group>
        <p-empty v-if="state.selectedItems.length === 0"
                 show-image
                 :title="$t('IDENTITY.USER.FORM.NO_USER')"
                 class="empty-wrapper"
        >
            {{ $t('IDENTITY.USER.FORM.NO_USER_DESC') }}
        </p-empty>
        <div v-else
             class="selected-user-list"
        >
            <div v-for="(item, idx) in state.selectedItems"
                 :key="`selected-user-list-item-${idx}`"
                 class="selected-user-list-item"
            >
                <div class="selected-user-label-wrapper">
                    <span class="label">{{ item.name }}</span>
                    <span v-if="item.isNew"
                          class="new"
                    >new</span>
                </div>
                <div class="selected-toolbox">
                    <p-select-dropdown v-if="item.isNew"
                                       :selected.sync="state.selectedAuthType"
                                       :menu="state.authTypeMenuItems"
                                       class="auth-type-dropdown"
                                       style-type="transparent"
                                       @select="handleSelectAuthTypeItem(idx)"
                    />
                    <p-icon-button name="ic_delete"
                                   class="delete-btn"
                                   width="1.5rem"
                                   height="1.5rem"
                                   @click="handleClickDeleteButton(idx)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="postcss">
.user-info-wrapper {
    @apply flex flex-col bg-white border border-primary-3 rounded-md;
    height: 18rem;
    padding: 0.75rem;
    .input-form-wrapper {
        @apply relative;
        .user-id-input {
            width: 100%;
        }
        .user-context-menu {
            @apply absolute;
            top: 2rem;
            left: 0;
            max-height: 13.5rem;
            z-index: 10;
        }
    }
    .empty-wrapper {
        margin: auto;
    }
    .selected-user-list {
        @apply overflow-y-scroll;
        height: 12.5rem;
        .selected-user-list-item {
            @apply flex items-center justify-between;
            height: 2.25rem;
            padding-right: 0.5rem;
            padding-left: 0.5rem;
            .selected-user-label-wrapper {
                @apply flex items-start;
                gap: 0.125rem;
                .label {
                    @apply text-label-md;
                }
                .new {
                    @apply text-label-sm text-coral-500;
                    margin-top: -0.125rem;
                }
            }
            .selected-toolbox {
                @apply flex items-center;
            }
        }
    }
}
</style>
