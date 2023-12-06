<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PHeading, PButton } from '@spaceone/design-system';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import UserManagementButtonModal from '@/services/administration/components/UserManagementButtonModal.vue';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

const appContextStore = useAppContextStore();
const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

const state = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
    isWorkspaceOwner: computed(() => store.state.user.roleType === ROLE_TYPE.WORKSPACE_OWNER),
});
const modalState = reactive({
    mode: '',
    title: '',
    themeColor: 'primary',
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

/* Modal Handler */
const clickRemove = () => {
    modalState.mode = 'remove';
    modalState.title = i18n.t('IDENTITY.USER.MAIN.MODAL.REMOVE_TITLE') as string;
    modalState.themeColor = 'alert';
    userPageStore.$patch((_state) => {
        _state.modalVisible.status = true;
    });
};
const clickInvite = () => {
    modalState.mode = 'invite';
    modalState.title = i18n.t('IDENTITY.USER.MAIN.MODAL.INVITE_TITLE') as string;
    userPageStore.$patch((_state) => {
        _state.modalVisible.form = true;
    });
};
const clickAdd = () => {
    modalState.mode = 'create';
    modalState.title = i18n.t('IDENTITY.USER.MAIN.MODAL.CREATE_TITLE') as string;
    userPageStore.$patch((_state) => {
        _state.modalVisible.form = true;
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
        <user-management-button-modal :header-title="modalState.title"
                                      :mode="modalState.mode"
                                      :theme-color="modalState.themeColor"
        />
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
