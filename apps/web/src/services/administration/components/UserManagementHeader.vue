<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PHeading, PButton } from '@spaceone/design-system';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import UserManagementAddModal from '@/services/administration/components/UserManagementAddModal.vue';
import UserManagementStatusModal from '@/services/administration/components/UserManagementStatusModal.vue';
import { useUserModalSettingStore } from '@/services/administration/store/user-modal-setting-store';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const appContextStore = useAppContextStore();
const modalSettingStore = useUserModalSettingStore();
const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const emit = defineEmits<{(e: 'confirm'): void; }>();

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceOwner: computed(() => store.state.user.roleType === ROLE_TYPE.WORKSPACE_OWNER),
});

/* Component */
const handleClickButton = (type: string) => {
    switch (type) {
    case 'remove': clickRemove(); break;
    case 'invite': clickInvite(); break;
    case 'add': clickAdd(); break;
    default: break;
    }
};
const handleConfirm = () => {
    emit('confirm');
};

/* Modal Handler */
const clickRemove = () => {
    modalSettingStore.$patch((_state) => {
        _state.mode = 'remove';
        _state.title = i18n.t('IDENTITY.USER.MAIN.MODAL.REMOVE_TITLE') as string;
        _state.themeColor = 'alert';
        _state.visible.status = true;
    });
};
const clickInvite = () => {
    modalSettingStore.$patch((_state) => {
        _state.mode = 'invite';
        _state.title = i18n.t('IDENTITY.USER.MAIN.MODAL.INVITE_TITLE') as string;
        _state.themeColor = 'primary';
        _state.visible.additional = true;
    });
};
const clickAdd = () => {
    modalSettingStore.$patch((_state) => {
        _state.mode = 'create';
        _state.title = i18n.t('IDENTITY.USER.MAIN.MODAL.CREATE_TITLE') as string;
        _state.themeColor = 'primary';
        _state.visible.additional = true;
    });
};
</script>

<template>
    <div>
        <p-heading :title="$t('IDENTITY.USER.MAIN.TITLE')"
                   use-selected-count
                   use-total-count
                   :total-count="userPageState.totalCount"
                   :selected-count="userPageState.selectedIndices.length"
                   class="user-management-header"
        >
            <template #extra>
                <div class="toolbox-wrapper">
                    <p-button v-if="state.isAdminMode"
                              style-type="primary"
                              icon-left="ic_plus_bold"
                              @click="handleClickButton('add')"
                    >
                        {{ $t('IDENTITY.USER.MAIN.ADD') }}
                    </p-button>
                    <div v-else>
                        <div v-if="state.isWorkspaceOwner"
                             class="toolbox"
                        >
                            <p-button style-type="tertiary"
                                      :disabled="userPageStore.selectedUsers.length === 0"
                                      @click="handleClickButton('remove')"
                            >
                                {{ $t('IDENTITY.USER.MAIN.REMOVE') }}
                            </p-button>
                            <p-button style-type="primary"
                                      @click="handleClickButton('invite')"
                            >
                                {{ $t('IDENTITY.USER.MAIN.INVITE') }}
                            </p-button>
                        </div>
                    </div>
                </div>
            </template>
        </p-heading>
        <user-management-add-modal @confirm="handleConfirm" />
        <user-management-status-modal @confirm="handleConfirm" />
    </div>
</template>

<style scoped lang="postcss">
.user-management-header {
    .toolbox-wrapper {
        .toolbox {
            @apply flex;
            gap: 1rem;
        }
    }
}
</style>
