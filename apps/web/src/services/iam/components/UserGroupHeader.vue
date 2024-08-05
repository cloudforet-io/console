<script setup lang="ts">
import { PHeading, PButton } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.$state;

const handleCreateUserGroup = (type: string) => {
    switch (type) {
    case USER_GROUP_MODAL_TYPE.ADD: userGroupPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USERGROUP.MODAL.ADD.TITLE'),
        visible: USER_GROUP_MODAL_TYPE.ADD,
        themeColor: 'primary',
    }); break;
    default:
        break;
    }
};
</script>

<template>
    <div>
        <p-heading :title="i18n.t('IAM.USERGROUP.TITLE')"
                   use-selected-count
                   use-total-count
                   :total-count="userGroupPageState.totalCount"
                   :selected-count="userGroupPageState.selectedIndices.length"
                   class="user-group-header"
        >
            <template #extra>
                <p-button style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateUserGroup(USER_GROUP_MODAL_TYPE.ADD)"
                >
                    {{ i18n.t('IAM.USERGROUP.CREATE') }}
                </p-button>
            </template>
        </p-heading>
    </div>
</template>

<style scoped lang="postcss">
.user-group-header {
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
