<script lang="ts" setup>
import { computed } from 'vue';

import { PHeading, PButton, PHeadingLayout } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { USER_GROUP_MODAL_TYPE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.state;

const totalCount = computed<number>(() => userGroupPageState.totalCount);

const handleCreateGroup = () => {
    userGroupPageStore.updateModalSettings({
        type: USER_GROUP_MODAL_TYPE.CREATE,
        title: i18n.t('IAM.USER_GROUP.MODAL.CREATE_USER_GROUP.TITLE'),
        themeColor: 'primary',
    });
};
</script>

<template>
    <div>
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('IAM.USER_GROUP.TITLE')"
                           use-selected-count
                           use-total-count
                           :total-count="totalCount"
                />
            </template>
            <template #extra>
                <div class="toolbox-wrapper">
                    <p-button style-type="primary"
                              icon-left="ic_plus_bold"
                              @click="handleCreateGroup"
                    >
                        <span>{{ $t('IAM.USER_GROUP.CREATE') }}</span>
                    </p-button>
                </div>
            </template>
        </p-heading-layout>
    </div>
</template>
