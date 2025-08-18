<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PHeading, PButton, PHeadingLayout } from '@cloudforet/mirinae';

import { i18n } from '@/translations';

import { useQueryTags } from '@/common/composables/query-tags';

import { useUserGroupListPaginationQuery } from '@/services/iam/composables/use-user-group-list-pagination-query';
import { USER_GROUP_MODAL_TYPE, USER_GROUP_SEARCH_HANDLERS } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';


interface Props {
  hasReadWriteAccess?: boolean;
}

const props = defineProps<Props>();

const userGroupPageStore = useUserGroupPageStore();

const queryTagHelper = useQueryTags({ keyItemSets: USER_GROUP_SEARCH_HANDLERS });
const userGroupListApiQueryHelper = new ApiQueryHelper();

const queryState = reactive({
    sortKey: 'name',
    sortDesc: true,
});

const { totalCount: userGroupListTotalCount } = useUserGroupListPaginationQuery({
    params: computed(() => {
        userGroupListApiQueryHelper.setSort(queryState.sortKey, queryState.sortDesc);
        userGroupListApiQueryHelper.setFilters(queryTagHelper.filters.value);
        return {
            query: userGroupListApiQueryHelper.data,
        };
    }),
});

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
                           :total-count="userGroupListTotalCount"
                />
            </template>
            <template v-if="props.hasReadWriteAccess"
                      #extra
            >
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
