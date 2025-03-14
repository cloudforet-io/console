<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    onMounted, reactive, ref, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PContextMenu, PEmpty, PFieldGroup, PIconButton, PSelectDropdown, PBadge,
} from '@cloudforet/mirinae';

import type { UserGetParameters } from '@/api-clients/identity/user/schema/api-verbs/get';
import type { UserModel } from '@/api-clients/identity/user/schema/model';
import type { AuthType } from '@/api-clients/identity/user/schema/type';
import type { FindWorkspaceUserParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/find';
import type { WorkspaceUserGetParameters } from '@/api-clients/identity/workspace-user/schema/api-verbs/get';
import type { SummaryWorkspaceUserModel, WorkspaceUserModel } from '@/api-clients/identity/workspace-user/schema/model';
import { i18n } from '@/translations';

import { useDomainStore } from '@/store/domain/domain-store';

import { checkEmailFormat } from '@/services/iam/helpers/user-management-form-validations';
import { useUserPageStore } from '@/services/iam/store/user-page-store';
import type { AddModalMenuItem, LocalType } from '@/services/iam/types/user-type';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const domainStore = useDomainStore();

const containerRef = ref<HTMLElement|null>(null);
const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);

const emit = defineEmits<{(e: 'change-input', formState): void}>();

const authTypeMenuItem = ref([
    { label: 'Local(Email)', name: 'EMAIL' },
    { label: 'Local(ID)', name: 'ID' },
]);

const state = reactive({
    loading: false,
    menuVisible: false,
    menuItems: [] as AddModalMenuItem[],
    selectedItems: [] as AddModalMenuItem[],
    independentUsersList: [] as SummaryWorkspaceUserModel[],
});
const formState = reactive({
    searchText: '',
    selectedMenuItem: authTypeMenuItem.value[0].name as AuthType|LocalType,
});
const validationState = reactive({
    userIdInvalid: undefined as undefined | boolean,
    userIdInvalidText: '' as TranslateResult,
});


/* Component */
const hideMenu = () => {
    state.menuVisible = false;
};
const handleClickTextInput = async () => {
    state.menuVisible = true;
    resetValidationState();
};
const handleChangeTextInput = (value: string) => {
    resetValidationState();
    formState.searchText = value;
    if (!userPageState.isAdminMode || userPageState.afterWorkspaceCreated) {
        fetchListUsers();
        state.menuVisible = true;
    }
};
const handleEnterTextInput = async () => {
    if (formState.searchText === '') return;

    if (validateUserId()) {
        await getUserList();
    }
};
const handleClickDeleteButton = (idx: number) => {
    state.selectedItems.splice(idx, 1);
    emit('change-input', { userList: state.selectedItems });
};
const handleSelectDropdownItem = (selected: AuthType|LocalType) => {
    formState.selectedMenuItem = selected;
    resetValidationState();
};
const getUserList = async () => {
    let isNew = userPageState.isAdminMode || userPageState.afterWorkspaceCreated;
    try {
        const trimmedText = formState.searchText.trim();
        if (userPageState.isAdminMode || userPageState.afterWorkspaceCreated) {
            await fetchGetUsers(trimmedText);
        } else {
            const isIndependentUser = state.independentUsersList.find((user) => user.user_id === formState.searchText);
            isNew = !isIndependentUser;
            await fetchGetWorkspaceUsers(trimmedText);
        }
    } catch (e) {
        addSelectedItem(formState.searchText, isNew);
        hideMenu();
        formState.searchText = '';
        resetValidationState();
    }
};
const checkEmailValidation = () => {
    const { isValid, invalidText } = checkEmailFormat(formState.searchText);
    if (formState.selectedMenuItem === 'EMAIL') {
        if (!isValid) {
            updateValidationState(invalidText);
            return false;
        }
    }
    if (formState.selectedMenuItem === 'ID') {
        if (isValid) {
            updateValidationState(i18n.t('IAM.USER.FORM.ID_INVALID'));
            return false;
        }
    }
    return true;
};
const resetValidationState = () => {
    validationState.userIdInvalid = false;
    validationState.userIdInvalidText = '';
};

const updateValidationState = (invalidText: TranslateResult = '', isInvalid = true) => {
    validationState.userIdInvalid = isInvalid;
    validationState.userIdInvalidText = invalidText;
};
const validateUserId = () => {
    if (formState.searchText === '') {
        updateValidationState(i18n.t('IAM.USER.FORM.ALT_E_INVALID_FULL_NAME'));
        return false;
    }
    return checkEmailValidation();
};
const clickOutside = () => {
    if (state.menuVisible) {
        checkEmailValidation();
        hideMenu();
    }
};
const handleSelectMenuItem = async (menuItem: AddModalMenuItem) => {
    if (!state.selectedItems.some((item) => item.name === menuItem.name)) {
        state.selectedItems.unshift(menuItem);
        emit('change-input', { userList: state.selectedItems });
    }
    hideMenu();
    resetValidationState();
};
const initAuthTypeList = async () => {
    if (domainStore.state.extendedAuthType !== undefined) {
        authTypeMenuItem.value = [
            { label: domainStore.getters.extendedAuthTypeLabel, name: 'EXTERNAL' },
            ...authTypeMenuItem.value,
        ];
    }
};

const addSelectedItem = (name : string, isNew: boolean) => {
    if (!name) return;
    const trimmedText = name.trim();
    if (state.selectedItems.some((item) => item.name === trimmedText && item.auth_type === formState.selectedMenuItem)) return;

    state.selectedItems.unshift({
        label: trimmedText,
        name: trimmedText,
        user_id: trimmedText,
        auth_type: formState.selectedMenuItem,
        isNew,
    });

    emit('change-input', { userList: state.selectedItems });
};

/* API */
const fetchListUsers = async () => {
    state.loading = true;
    try {
        let params: FindWorkspaceUserParameters = { keyword: formState.searchText || '@' };
        if (!userPageState.isAdminMode) {
            params = {
                ...params,
                workspace_id: userPageState.createdWorkspaceId,
            };
        }
        const results = await userPageStore.findWorkspaceUser(params);
        state.menuItems = results.map((user) => ({
            user_id: user.user_id,
            label: user.name ? `${user.user_id} (${user.name})` : user.user_id,
            name: user.user_id,
        }));
        if (!userPageState.isAdminMode) {
            state.independentUsersList = results;
        }
    } catch (e) {
        state.menuItems = [];
    } finally {
        state.loading = false;
    }
};
// user existence check
const fetchGetWorkspaceUsers = async (userId: string) => {
    await SpaceConnector.clientV2.identity.workspaceUser.get<WorkspaceUserGetParameters, WorkspaceUserModel>({
        user_id: userId,
    });
    updateValidationState(i18n.t('IAM.USER.FORM.USER_ID_INVALID_WORKSPACE', { userId }));
};
const fetchGetUsers = async (userId: string) => {
    await SpaceConnector.clientV2.identity.user.get<UserGetParameters, UserModel>({
        user_id: userId,
    });
    updateValidationState(i18n.t('IAM.USER.FORM.USER_ID_INVALID_DOMAIN', { userId }));
};

onClickOutside(containerRef, clickOutside);

watch(() => state.menuVisible, async (menuVisible) => {
    if (menuVisible) {
        resetValidationState();
        if (!userPageState.isAdminMode) {
            await fetchListUsers();
        }
    } else {
        state.menuItems = [];
    }
});

onMounted(() => {
    initAuthTypeList();
});
</script>

<template>
    <div class="user-info-wrapper">
        <p-field-group required
                       :invalid="validationState.userIdInvalid"
                       :invalid-text="validationState.userIdInvalidText"
                       class="user-info-field-group"
                       :class="{'is-admin-mode': userPageState.isAdminMode, 'is-id-format': formState.selectedMenuItem === 'ID'}"
        >
            <template #label>
                <span>
                    <span>{{ $t('IAM.USER.FORM.AUTH_TYPE') }}</span>
                    <span class="and-mark">&</span>
                    <span>{{ $t('IAM.USER.FORM.USER_ID') }}</span>
                </span>
            </template>
            <template #default="{invalid}">
                <div ref="containerRef"
                     class="input-wrapper"
                >
                    <div>
                        <p-select-dropdown :menu="authTypeMenuItem"
                                           :selected="formState.selectedMenuItem"
                                           is-fixed-width
                                           class="type-dropdown"
                                           @update:selected="handleSelectDropdownItem"
                        />
                    </div>
                    <div class="input-form-wrapper">
                        <input ref="targetRef"
                               :value="formState.searchText"
                               class="user-id-input"
                               :class="{'invalid': invalid}"
                               @click="handleClickTextInput"
                               @keyup.enter="handleEnterTextInput"
                               @input="handleChangeTextInput($event.target.value)"
                        >
                        <p-context-menu v-if="state.menuVisible && state.menuItems.length > 0"
                                        ref="contextMenuRef"
                                        :loading="state.loading"
                                        :menu="state.menuItems"
                                        :selected="state.selectedItems"
                                        :highlight-term="formState.searchText"
                                        multi-selectable
                                        class="user-context-menu"
                                        @select="handleSelectMenuItem"
                        />
                    </div>
                </div>
            </template>
        </p-field-group>
        <p-empty v-if="state.selectedItems.length === 0"
                 show-image
                 :title="$t('IAM.USER.FORM.NO_USER')"
                 class="empty-wrapper"
        >
            {{ $t('IAM.USER.FORM.NO_USER_DESC') }}
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
                    <p-badge v-if="item.auth_type"
                             badge-type="subtle"
                             :style-type="(item.auth_type === 'EMAIL' || item.auth_type === 'ID') ? 'primary3' : 'blue200'"
                    >
                        {{ authTypeMenuItem.find((i) => i.name === item.auth_type).label || '' }}
                    </p-badge>
                    <p-icon-button name="ic_delete"
                                   class="delete-btn"
                                   size="sm"
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
    .user-info-field-group {
        margin-bottom: 0;
    }
    .and-mark {
        @apply font-normal;
        margin-right: 0.25rem;
        margin-left: 0.25rem;
    }
    .input-wrapper {
        @apply flex;
        margin-top: 0.25rem;
        gap: 0.25rem;
        .input-form-wrapper {
            @apply relative;
            width: 100%;
            .user-id-input {
                @apply text-label-md border border-gray-300 rounded;
                width: 100%;
                height: 2rem;
                padding: 0.375rem 0.5rem;
                &.invalid {
                    @apply border-alert;
                }
            }
            .user-context-menu {
                @apply absolute;
                top: 2rem;
                left: 0;
                max-height: 13.5rem;
                z-index: 10;
            }
        }
    }
    .empty-wrapper {
        margin: auto;
    }
    .selected-user-list {
        @apply overflow-y-auto;
        height: 12.5rem;
        margin-top: 1rem;
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
                gap: 0.25rem;
            }
        }
    }
}

/* custom design-system component - p-field-group */
:deep(.p-field-group) {
    @apply relative;
    .invalid-feedback {
        @apply absolute;
        bottom: -1.125rem;
        left: 8rem;
    }
    &.is-id-format {
        .invalid-feedback {
            left: 7rem;
        }
    }
}
</style>
