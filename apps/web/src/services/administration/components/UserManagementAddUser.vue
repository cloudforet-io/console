<script setup lang="ts">
import {
    computed, reactive, ref, toRef,
} from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRoute } from 'vue-router/composables';

import {
    PContextMenu, PEmpty, PFieldGroup, PTextInput, useContextMenuController,
} from '@spaceone/design-system';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import { debounce } from 'lodash';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { UserListParameters } from '@/schema/identity/user/api-verbs/list';
import { store } from '@/store';

import { useUserModalSettingStore } from '@/services/administration/store/user-modal-setting-store';

const modalSettingStore = useUserModalSettingStore();
const modalSettingState = modalSettingStore.$state;

const route = useRoute();

const contextMenuRef = ref<any|null>(null);
const targetRef = ref<HTMLElement | null>(null);

const state = reactive({
    loading: false,
    dropdownMenuItems: computed<MenuItem[]>(() => modalSettingState.users.map((user) => ({
        label: user.name ? `${user.user_id} (${user.name})` : user.user_id,
        name: user.user_id,
    }))),
    selectedItems: [] as MenuItem[],
    // TODO: will be removed after the backend is ready
    domain_id: computed(() => store.state.domain.domainId),
});
const formState = reactive({
    userIds: computed(() => {
        if (state.selectedItems.length === 0) {
            return '';
        }
        return state.selectedItems.map((item) => item.name).join(', ');
    }),
    searchText: '',
});
const validationState = reactive({
    userIdValid: undefined as undefined | boolean,
    userIdValidText: '' as TranslateResult,
});

const {
    visibleMenu: contextMenuVisible,
    refinedMenu,
    showContextMenu,
    hideContextMenu,
    reloadMenu,
} = useContextMenuController({
    useFixedStyle: false,
    targetRef,
    contextMenuRef,
    useMenuFiltering: true,
    useReorderBySelection: true,
    searchText: toRef(formState, 'searchText'),
    selected: toRef(state, 'selectedItems'),
    menu: toRef(state, 'dropdownMenuItems'),
});

/* Component */
const handleClickUserIdInput = async () => {
    await reloadMenu();
    if (!contextMenuVisible.value) {
        await showContextMenu();
    } else {
        formState.searchText = '';
        await hideContextMenu();
    }
};
const handleSelectMenuItem = (item: MenuItem) => {
    state.selectedItems.push(item);
};
const handleUpdateSearchText = debounce(async (text: string) => {
    if (text !== '') {
        showContextMenu();
    }
    formState.searchText = text;
    await fetchListWorkspaceUsers();
    await reloadMenu();
}, 200);

/* API */
const userListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(1).setPageLimit(15)
    .setSort('name', true)
    .setFiltersAsRawQueryString(route.query.filters);
const userListApiQuery = userListApiQueryHelper.data;

const fetchListWorkspaceUsers = () => {
    const params: UserListParameters = {
        query: userListApiQuery,
        domain_id: state.domain_id,
    };
    state.loading = true;
    try {
        modalSettingStore.listUsers(params);
    } finally {
        state.loading = false;
    }
};

/* Init */
(async () => {
    await fetchListWorkspaceUsers();
})();
</script>

<template>
    <div class="user-info-wrapper">
        <p-field-group :label="$t('IDENTITY.USER.FORM.USER_ID')"
                       required
                       :invalid="validationState.userIdValid"
                       :invalid-text="validationState.userIdValidText"
        >
            <template #default="{invalid}">
                <div class="input-form-wrapper">
                    <p-text-input ref="targetRef"
                                  :value="contextMenuVisible ? formState.searchText : formState.userIds"
                                  :invalid="invalid"
                                  class="user-id-input"
                                  @click="handleClickUserIdInput"
                                  @update:value="handleUpdateSearchText"
                    />
                    <p-context-menu v-show="contextMenuVisible"
                                    ref="contextMenuRef"
                                    :loading="state.loading"
                                    :menu="refinedMenu"
                                    :selected="state.selectedItems"
                                    multi-selectable
                                    class="user-context-menu"
                                    @select="handleSelectMenuItem"
                    />
                </div>
            </template>
        </p-field-group>
        <p-empty show-image
                 :title="$t('IDENTITY.USER.FORM.NO_USER')"
                 class="empty-wrapper"
        >
            {{ $t('IDENTITY.USER.FORM.NO_USER_DESC') }}
        </p-empty>
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
}
</style>
