<script setup lang="ts">
import {
    computed, reactive, watch,
} from 'vue';
import { useRoute } from 'vue-router/composables';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PHeading, PButton, PHeadingLayout } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import { useQueryTags } from '@/common/composables/query-tags';

import { useUserListPaginationQuery } from '@/services/iam/composables/use-user-list-pagination-query';
import { USER_MODAL_TYPE, USER_SEARCH_HANDLERS } from '@/services/iam/constants/user-constant';
import { useUserPageStore } from '@/services/iam/store/user-page-store';

import { useUserListQuery } from '../composables/use-user-list-query';


interface Props {
    hasReadWriteAccess?: boolean;
}

const props = defineProps<Props>();

const queryTagHelper = useQueryTags({ keyItemSets: USER_SEARCH_HANDLERS.keyItemSets });
const userListApiQueryHelper = new ApiQueryHelper();

const queryState = reactive({
    sortKey: 'name',
    sortDesc: true,
});
const {
    totalCount: userTotalCount,
} = useUserListPaginationQuery({
    params: computed(() => {
        userListApiQueryHelper.setSort(queryState.sortKey, queryState.sortDesc);
        userListApiQueryHelper.setFilters(queryTagHelper.filters.value);
        return {
            query: userListApiQueryHelper.data,
        };
    }),
    thisPage: computed(() => 1),
    pageSize: computed(() => 15),
});

const userWorkspaceStore = useUserWorkspaceStore();
const userPageStore = useUserPageStore();
const userPageState = userPageStore.state;
const userPageGetters = userPageStore.getters;

const selectedUserIds = computed<string[]>(() => userPageState.selectedUserIds);
const { workspaceUserListData: selectedWorkspaceUsers } = useUserListQuery(selectedUserIds);

const route = useRoute();

const state = reactive({
    selectedUsersType: computed<'OnlyWorkspaceGroupUser'|'OnlyWorkspaceUser'|'Mixed'>(() => {
        const userTypeList = selectedWorkspaceUsers.value?.map((user) => (user?.role_binding_info?.workspace_group_id ? 'workspaceGroupUser' : 'workspaceUser')) ?? [];
        if (userTypeList.includes('workspaceGroupUser') && userTypeList.includes('workspaceUser')) return 'Mixed';
        if (userTypeList.includes('workspaceGroupUser')) return 'OnlyWorkspaceGroupUser';
        return 'OnlyWorkspaceUser';
    }),
});

/* Component */
const handleClickButton = (type: string) => {
    switch (type) {
    case USER_MODAL_TYPE.REMOVE: {
        if (state.selectedUsersType === 'OnlyWorkspaceGroupUser') {
            userPageStore.updateModalSettings({
                type: '',
                title: i18n.t('IAM.USER.MAIN.MODAL.CAN_NOT_REMOVE_USER_TITLE'),
                themeColor: 'alert',
                modalVisibleType: 'removeOnlyWorkspaceGroup',
            });
            return;
        }
        if (state.selectedUsersType === 'Mixed') {
            userPageStore.updateModalSettings({
                type: '',
                title: i18n.t('IAM.USER.MAIN.MODAL.REMOVE_USER_TITLE'),
                themeColor: 'alert',
                modalVisibleType: 'removeMixed',
            });
            return;
        }
        userPageStore.updateModalSettings({
            type,
            title: i18n.t('IAM.USER.MAIN.MODAL.REMOVE_TITLE'),
            themeColor: 'alert',
            modalVisibleType: 'status',
        });
        return;
    }
    case USER_MODAL_TYPE.INVITE: userPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USER.MAIN.MODAL.INVITE_TITLE', { workspace_name: userWorkspaceStore.getters.currentWorkspace?.name }),
        themeColor: 'primary',
        modalVisibleType: 'add',
    }); break;
    case USER_MODAL_TYPE.ADD: userPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USER.MAIN.MODAL.CREATE_TITLE'),
        themeColor: 'primary',
        modalVisibleType: 'add',
    }); break;
    case USER_MODAL_TYPE.ASSIGN: userPageStore.updateModalSettings({
        type,
        title: i18n.t('IAM.USER.MAIN.MODAL.ASSIGN_TITLE'),
        themeColor: 'primary',
        modalVisibleType: 'assignToUserGroup',
    }); break;
    default: break;
    }
};

watch(() => route.query, (query) => {
    if (!query) return;
    if (query.isAddUser) {
        userPageStore.updateModalSettings({
            type: USER_MODAL_TYPE.ADD,
            title: i18n.t('IAM.USER.MAIN.MODAL.CREATE_TITLE'),
            themeColor: 'primary',
            modalVisibleType: 'add',
        });
    }
}, { immediate: true });
</script>

<template>
    <div>
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('IAM.USER.TITLE')"
                           use-selected-count
                           use-total-count
                           :total-count="userTotalCount"
                           :selected-count="userPageState.selectedIndices.length"
                />
            </template>
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
                        <p-button style-type="tertiary"
                                  :disabled="selectedWorkspaceUsers === undefined"
                                  @click="handleClickButton(USER_MODAL_TYPE.ASSIGN)"
                        >
                            {{ $t('IAM.USER.ASSIGN_TO_USER_GROUP.TITLE') }}
                        </p-button>
                        <p-button style-type="negative-secondary"
                                  :disabled="selectedWorkspaceUsers === undefined"
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
        </p-heading-layout>
    </div>
</template>

<style scoped lang="postcss">
.toolbox-wrapper {
    .toolbox {
        @apply flex ;
        gap: 1rem;
    }
    .button-label {
        line-height: 1rem;
    }
}
</style>
