<script setup lang="ts">
import { PHeading, PButton } from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { i18n } from '@/translations';

import { USER_MODAL_TYPE } from '@/services/administration/constants/user-constant';
import { useUserPageStore } from '@/services/administration/store/user-page-store';
import type { ModalSettingState } from '@/services/administration/types/user-type';

const userPageStore = useUserPageStore();
const userPageState = userPageStore.$state;

/* Component */
const handleClickButton = (type: string) => {
    switch (type) {
    case USER_MODAL_TYPE.REMOVE: updateModalSettings({
        type,
        title: i18n.t('IAM.USER.MAIN.MODAL.REMOVE_TITLE') as string,
        themeColor: 'alert',
        statusVisible: true,
    }); break;
    case USER_MODAL_TYPE.INVITE: updateModalSettings({
        type,
        title: i18n.t('IAM.USER.MAIN.MODAL.INVITE_TITLE') as string,
        themeColor: 'primary',
        addVisible: true,
    }); break;
    case USER_MODAL_TYPE.ADD: updateModalSettings({
        type,
        title: i18n.t('IAM.USER.MAIN.MODAL.CREATE_TITLE') as string,
        themeColor: 'primary',
        addVisible: true,
    }); break;
    default: break;
    }
};
const updateModalSettings = ({
    type, title, themeColor, statusVisible, addVisible,
}: ModalSettingState) => {
    userPageStore.$patch((_state) => {
        _state.modal.type = type;
        _state.modal.title = title;
        _state.modal.themeColor = themeColor;
        _state.modal.visible.status = statusVisible ?? false;
        _state.modal.visible.add = addVisible ?? false;
        _state.modal = cloneDeep(_state.modal);
    });
};
</script>

<template>
    <div>
        <p-heading :title="$t('IAM.USER.TITLE')"
                   use-selected-count
                   use-total-count
                   :total-count="userPageState.totalCount"
                   :selected-count="userPageState.selectedIndices.length"
                   class="user-management-header"
        >
            <template #extra>
                <div class="toolbox-wrapper">
                    <p-button v-if="userPageState.isAdminMode"
                              style-type="primary"
                              icon-left="ic_plus_bold"
                              @click="handleClickButton(USER_MODAL_TYPE.ADD)"
                    >
                        {{ $t('IAM.USER.ADD') }}
                    </p-button>
                    <div v-else>
                        <div v-if="userPageStore.isWorkspaceOwner"
                             class="toolbox"
                        >
                            <p-button style-type="tertiary"
                                      :disabled="userPageStore.selectedUsers.length === 0"
                                      @click="handleClickButton(USER_MODAL_TYPE.REMOVE)"
                            >
                                {{ $t('IAM.USER.REMOVE') }}
                            </p-button>
                            <p-button style-type="primary"
                                      @click="handleClickButton(USER_MODAL_TYPE.INVITE)"
                            >
                                {{ $t('IAM.USER.INVITE') }}
                            </p-button>
                        </div>
                    </div>
                </div>
            </template>
        </p-heading>
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
