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
import { debounce } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { UserGetParameters } from '@/schema/identity/user/api-verbs/get';
import type { UserModel } from '@/schema/identity/user/model';
import type { AuthType } from '@/schema/identity/user/type';
import type { FindWorkspaceUserParameters } from '@/schema/identity/workspace-user/api-verbs/find';
import type { WorkspaceUserGetParameters } from '@/schema/identity/workspace-user/api-verbs/get';
import type { SummaryWorkspaceUserModel, WorkspaceUserModel } from '@/schema/identity/workspace-user/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import ErrorHandler from '@/common/composables/error/errorHandler';

import type { AddModalMenuItem } from '@/services/administration/components/UserManagementAddModal.vue';
import { USER_MODAL_TYPE } from '@/services/administration/constants/user-constant';
import { checkEmailFormat } from '@/services/administration/helpers/user-management-form-validations';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const containerRef = ref<HTMLElement|null>(null);
const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);

const emit = defineEmits<{(e: 'change-list', selectedItems: MenuItem[]): void}>();

const contextMenuItems = [
    { label: 'Google', name: 'GOOGLE', key: 'EXTERNAl' },
    { label: 'Keycloak', name: 'KEYCLOAK', key: 'EXTERNAl' },
    { label: 'Local', name: 'LOCAL', key: 'LOCAL' },
];

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
const dropdownState = reactive({
    selectedMenuItem: contextMenuItems[0].name,
});
const formState = reactive({
    searchText: '',
});
const validationState = reactive({
    userIdInvalid: undefined as undefined | boolean,
    userIdInvalidText: '' as TranslateResult,
});

/* Component */
const hideMenu = () => {
    emit('change-list', state.selectedItems);
    state.menuVisible = false;
};
const handleClickTextInput = async () => {
    state.menuVisible = true;
    validationState.userIdInvalid = false;
    validationState.userIdInvalidText = '';
};
const handleChangeTextInput = debounce(async (searchText: string) => {
    formState.searchText = searchText;
    validationState.userIdInvalid = false;
    validationState.userIdInvalidText = '';
    if (!userPageState.isAdminMode) {
        await fetchListUsers();
    }
}, 200);
const handleEnterTextInput = () => {
    if (formState.searchText === '') return;
    const { isValid, invalidText } = checkEmailFormat(formState.searchText);
    if (!isValid) {
        validationState.userIdInvalid = true;
        validationState.userIdInvalidText = invalidText;
        hideMenu();
    } else {
        getUserList();
    }
};
const handleSelectMenuItem = async (menuItem: AddModalMenuItem) => {
    state.selectedItems.push(menuItem);
    await hideMenu();
};
const handleClickDeleteButton = (idx: number) => {
    state.selectedItems.splice(idx, 1);
};
const handleSelectAuthTypeItem = (idx: number) => {
    state.selectedItems[idx].auth_type = state.selectedAuthType;
};
const handleSelectDropdownItem = (selected: string) => {
    dropdownState.selectedMenuItem = selected;
};
const getUserList = async () => {
    try {
        if (userPageState.isAdminMode) {
            await fetchGetUsers(formState.searchText);
        } else {
            await fetchGetWorkspaceUsers(formState.searchText);
        }
    } catch (e) {
        state.selectedItems.push({
            user_id: formState.searchText,
            label: formState.searchText,
            name: formState.searchText,
            isNew: true,
            auth_type: userPageState.isAdminMode ? dropdownState.selectedMenuItem : state.authTypeMenuItems[0].name as AuthType,
        });
        formState.searchText = '';
    } finally {
        await hideMenu();
    }
};
const checkValidation = () => {
    if (formState.searchText === '') {
        validationState.userIdInvalid = true;
        validationState.userIdInvalidText = i18n.t('IAM.USER.FORM.ALT_E_INVALID_FULL_NAME');
        return;
    }
    const { isValid, invalidText } = checkEmailFormat(formState.searchText);
    if (!isValid) {
        validationState.userIdInvalid = true;
        validationState.userIdInvalidText = invalidText;
    }
};

/* API */
const fetchListUsers = async () => {
    state.loading = true;

    try {
        const { results } = await SpaceConnector.clientV2.identity.workspaceUser.find<FindWorkspaceUserParameters, ListResponse<SummaryWorkspaceUserModel>>({
            keyword: formState.searchText || '@',
        });
        state.menuItems = results?.map((user) => ({
            user_id: user.user_id,
            label: user.name ? `${user.user_id} (${user.name})` : user.user_id,
            name: user.user_id,
        })) as AddModalMenuItem[];
    } catch (e: any) {
        ErrorHandler.handleRequestError(e, e.message);
        state.menuItems = [];
    } finally {
        state.loading = false;
    }
};
const fetchGetWorkspaceUsers = async (userId: string) => {
    await SpaceConnector.clientV2.identity.workspaceUser.get<WorkspaceUserGetParameters, WorkspaceUserModel>({
        user_id: userId,
    });
    validationState.userIdInvalid = true;
    validationState.userIdInvalidText = i18n.t('IAM.USER.FORM.USER_ID_INVALID_WORKSPACE', { userId });
};
const fetchGetUsers = async (userId: string) => {
    await SpaceConnector.clientV2.identity.user.get<UserGetParameters, UserModel>({
        user_id: userId,
    });
    validationState.userIdInvalid = true;
    validationState.userIdInvalidText = i18n.t('IAM.USER.FORM.USER_ID_INVALID_DOMAIN', { userId });
};

/* Context Menu */
onClickOutside(containerRef, hideMenu);

watch(() => state.menuVisible, async (menuVisible) => {
    if (menuVisible) {
        formState.searchText = '';
        state.selectedAuthType = state.authTypeMenuItems[0].name as AuthType;
        if (!userPageState.isAdminMode) {
            await fetchListUsers();
        }
    } else {
        await checkValidation();
        state.menuItems = [];
    }
});
</script>

<template>
    <div class="user-info-wrapper">
        <p-field-group required
                       :invalid="validationState.userIdInvalid"
                       :invalid-text="validationState.userIdInvalidText"
                       :class="{'is-admin-mode': userPageState.isAdminMode}"
        >
            <template #label>
                <strong v-if="userPageState.modal.type === USER_MODAL_TYPE.INVITE">
                    {{ $t('IAM.USER.FORM.USER_ID') }}
                </strong>
                <span v-else>
                    <span>{{ $t('IAM.USER.FORM.AUTH_TYPE') }}</span>
                    <span class="and-mark">&</span>
                    <span>{{ $t('IAM.USER.FORM.USER_ID') }}</span>
                </span>
            </template>
            <template #default="{invalid}">
                <div ref="containerRef"
                     class="input-wrapper"
                >
                    <div v-if="userPageState.isAdminMode">
                        <p-select-dropdown :menu="contextMenuItems"
                                           :selected="dropdownState.selectedMenuItem"
                                           class="type-dropdown"
                                           @update:selected="handleSelectDropdownItem"
                        />
                    </div>
                    <div class="input-form-wrapper">
                        <p-text-input ref="targetRef"
                                      :invalid="invalid"
                                      :value="formState.searchText"
                                      class="user-id-input"
                                      @click="handleClickTextInput"
                                      @keyup.enter="handleEnterTextInput"
                                      @update:value="handleChangeTextInput"
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
                    <p-select-dropdown v-if="item.isNew"
                                       :selected="item.auth_type"
                                       :menu="contextMenuItems"
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

/* custom design-system component - p-button */
:deep(.p-field-group) {
    @apply relative;
    .invalid-feedback {
        @apply absolute;
        bottom: -1.125rem;
        left: 0;
    }
    &.is-admin-mode {
        .invalid-feedback {
            left: 6.75rem;
        }
    }
}
</style>
