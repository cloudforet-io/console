<script setup lang="ts">
import { watch } from 'vue';
import { useRoute } from 'vue-router/composables';

import { PHeading, PButton } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { USER_MODAL_TYPE } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';

interface Props {
    hasReadWriteAccess?: boolean;
}

const props = defineProps<Props>();

const userWorkspaceStore = useUserWorkspaceStore();
const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userPageGetters = userPageStore.getters;

const route = useRoute();

/* Component */
const handleClickButton = (type: string) => {
    switch (type) {
    case USER_MODAL_TYPE.REMOVE: userPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USER.MAIN.MODAL.REMOVE_TITLE') as string,
        themeColor: 'alert',
        modalVisibleType: 'status',
    }); break;
    case USER_MODAL_TYPE.INVITE: userPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USER.MAIN.MODAL.INVITE_TITLE', { workspace_name: userWorkspaceStore.getters.currentWorkspace?.name }) as string,
        themeColor: 'primary',
        modalVisibleType: 'add',
    }); break;
    case USER_MODAL_TYPE.ADD: userPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USER.MAIN.MODAL.CREATE_TITLE') as string,
        themeColor: 'primary',
        modalVisibleType: 'add',
    }); break;
    default: break;
    }
};

watch(() => route.query, (query) => {
    if (!query) return;
    if (query.isAddUser) {
        userPageStore.updateModalSettings({
            type: USER_MODAL_TYPE.ADD,
            title: i18n.t('IAM.USER.MAIN.MODAL.CREATE_TITLE') as string,
            themeColor: 'primary',
            modalVisibleType: 'add',
        });
    }
}, { immediate: true });
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
            <template v-if="props.hasReadWriteAccess"
                      #extra
            >
                <div class="toolbox-wrapper">
                    <p-button v-if="userPageState.isAdminMode"
                              style-type="primary"
                              icon-left="ic_plus_bold"
                              @click="handleClickButton(USER_MODAL_TYPE.ADD)"
                    >
                        <span class="button-label">{{ $t('IAM.USER.ADD') }}</span>
                    </p-button>
                    <div v-else-if="userPageGetters.isWorkspaceOwner"
                         class="toolbox"
                    >
                        <p-button style-type="negative-secondary"
                                  :disabled="userPageGetters.selectedUsers.length === 0"
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
            </template>
        </p-heading>
    </div>
</template>

<style scoped lang="postcss">
.user-management-header {
    .toolbox-wrapper {
        .toolbox {
            @apply flex ;
            gap: 1rem;
        }
        .button-label {
            line-height: 1rem;
        }
    }
}
</style>
