<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import {
    computed, reactive, ref, watch,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';

import {
    PContextMenu, PEmpty, PFieldGroup, PIconButton, PTextInput,
} from '@spaceone/design-system';
import { debounce } from 'lodash';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { UserModel } from '@/schema/identity/user/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useWorkspaceStore } from '@/store/app-context/workspace/workspace-store';

import { useUserModalSettingStore } from '@/services/administration/store/user-modal-setting-store';

interface UserMenuItem extends UserModel {
    label: string;
}

const modalSettingStore = useUserModalSettingStore();
const workspaceStore = useWorkspaceStore();

const containerRef = ref<HTMLElement|null>(null);
const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);

const state = reactive({
    loading: false,
    isFocus: false,
    menuVisible: false,
    menuItems: [] as UserMenuItem[],
    selectedItems: [] as UserMenuItem[],
    validItems: [] as UserMenuItem[],
    // TODO: will be removed after the backend is ready
    domain_id: computed(() => store.state.domain.domainId),
});
const formState = reactive({
    searchText: '',
    userIds: '',
});
const validationState = reactive({
    userIdInvalid: undefined as undefined | boolean,
    userIdInvalidText: '' as TranslateResult,
});

/* Component */
const hideMenu = () => {
    state.menuVisible = false;
};
const handleClickUserIdInput = async () => {
    state.menuVisible = true;
    validationState.userIdInvalid = false;
    validationState.userIdInvalidText = '';
};
const handleClickDeleteButton = (idx: number) => {
    state.validItems.splice(idx, 1);
};
const handleSelectMenuItem = async (menuItem: UserMenuItem) => {
    state.isFocus = false;
    state.selectedItems.push(menuItem);
    formState.userIds = state.selectedItems.map((item) => item.user_id).join(', ');
    await fetchListWorkspaceUsers(menuItem);
};
const handleChangeUserIdInput = debounce(async (searchText: string) => {
    if (!state.isFocus) return;
    formState.searchText = searchText;
    validationState.userIdInvalid = false;
    validationState.userIdInvalidText = '';
    await fetchListUsers();
}, 200);

const handleClickEnter = async () => {
    if (!state.isFocus) return;
    const selectedItem = state.menuItems.filter((item) => item.user_id === formState.searchText);
    await fetchListWorkspaceUsers(selectedItem[0]);
    formState.searchText = '';
    hideMenu();
};

/* API */

const fetchListUsers = async () => {
    state.loading = true;

    const userListApiQueryHelper = new ApiQueryHelper()
        .setPageStart(1).setPageLimit(15)
        .setSort('name', true);
    if (formState.searchText) {
        userListApiQueryHelper.setFilters([{
            k: 'user_id',
            v: formState.searchText,
            o: '',
        }]);
    }

    try {
        const response = await modalSettingStore.listUsers({
            query: userListApiQueryHelper.data,
            domain_id: state.domain_id,
        });
        state.menuItems = response.map((user) => ({
            ...user,
            label: user.name ? `${user.user_id} (${user.name})` : user.user_id,
            name: user.user_id,
        }));
    } finally {
        state.loading = false;
    }
};
const fetchListWorkspaceUsers = async (item: UserMenuItem) => {
    const params = {
        user_id: item.user_id,
        workspace_id: workspaceStore.getters.currentWorkspaceId,
        domain_id: state.domain_id,
    };
    const response = await modalSettingStore.getWorkspaceUser(params);
    if (!response) {
        state.validItems.push(item);
    } else {
        hideMenu();
        formState.userIds = item.user_id;
        validationState.userIdInvalid = true;
        validationState.userIdInvalidText = i18n.t('IDENTITY.USER.FORM.USER_ID_INVALID_WORKSPACE', { userId: item.user_id });
    }
};

/* Context Menu */
onClickOutside(containerRef, hideMenu);

watch(() => state.menuVisible, async (menuVisible) => {
    if (menuVisible) {
        formState.searchText = '';
        await fetchListUsers();
    } else {
        formState.userIds = '';
        state.isFocus = false;
        state.selectedItems = [];
        state.menuItems = [];
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
                                  :value="state.isFocus ? formState.searchText : formState.userIds"
                                  :invalid="invalid"
                                  class="user-id-input"
                                  @focusin="state.isFocus = true"
                                  @click="handleClickUserIdInput"
                                  @keyup.enter="handleClickEnter"
                                  @update:value="handleChangeUserIdInput"
                    />
                    <p-context-menu v-if="state.menuVisible"
                                    ref="contextMenuRef"
                                    :loading="state.loading"
                                    :menu="state.menuItems"
                                    :selected="state.validItems"
                                    multi-selectable
                                    class="user-context-menu"
                                    @select="handleSelectMenuItem"
                    />
                </div>
            </template>
        </p-field-group>
        <p-empty v-if="state.validItems.length === 0"
                 show-image
                 :title="$t('IDENTITY.USER.FORM.NO_USER')"
                 class="empty-wrapper"
        >
            {{ $t('IDENTITY.USER.FORM.NO_USER_DESC') }}
        </p-empty>
        <div v-else
             class="selected-user-list"
        >
            <div v-for="(item, idx) in state.validItems"
                 :key="`selected-user-list-item-${idx}`"
                 class="selected-user-list-item"
            >
                <div class="selected-user-label-wrapper">
                    <span class="label">{{ item.name }}</span>
                    <span class="new">new</span>
                </div>
                <div>
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
        }
    }
}
</style>
