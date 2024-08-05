<script setup lang="ts">
import { computed, reactive } from 'vue';

import { makeDistinctValueHandler, makeEnumValueHandler } from '@cloudforet/core-lib/component-util/query-search';
import { getApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import { PToolboxTable } from '@cloudforet/mirinae';

import { useQueryTags } from '@/common/composables/query-tags';

import UserGroupTableToolbox from '@/services/iam/components/UserGroupTableToolbox.vue';
import { calculateTime } from '@/services/iam/composables/refined-table-data';
import { USER_GROUP_SEARCH_HANDLERS, USER_GROUP_STATE } from '@/services/iam/constants/user-group-constant';
import { useUserGroupPageStore } from '@/services/iam/store/user-group-page-store';
import { useUserPageStore } from '@/services/iam/store/user-page-store';





interface Props {
    tableHeight: number;
}

const userGroupPageStore = useUserGroupPageStore();
const userGroupPageState = userGroupPageStore.$state;

const userGroupListApiQueryHelper = new ApiQueryHelper()
    .setPageStart(userGroupPageState.pageStart).setPageLimit(userGroupPageState.pageLimit)
    .setSort('name', true);
let userGroupListApiQuery = userGroupListApiQueryHelper.data;

const { queryTags } = useQueryTags({ keyItemSets: USER_GROUP_SEARCH_HANDLERS.keyItemSets });

const userPageStore = useUserPageStore();

const tableState = reactive({
    fields: computed(() => [
        { name: 'user_id', label: 'User ID' },
        { name: 'name', label: 'Name' },
        { name: 'state', label: 'State' },
        { name: 'MFA', lable: 'mfa' },
        { name: 'role_id', label: 'Admin Role', sortKey: 'role_type' },
        { name: 'tags', label: 'Tags', sortable: false },
        { name: 'auth_type', label: 'Auth Type' },
        { name: 'last_accessed_at', label: 'Last Activity' }]),
    items: computed(() => userGroupPageState.users.map((user) => ({
        ...user,
        mfa: user?.mfa?.state === 'ENABLED' ? 'ON' : 'OFF',
        last_accessed_at: calculateTime(user?.last_accessed_at, userPageStore.timezone),
    }))),
    valueHandlerMap: computed(() => {
        const resourceType = 'identity.User';

        return {
            user_id: makeDistinctValueHandler(resourceType, 'user_id'),
            name: makeDistinctValueHandler(resourceType, 'name', 'string', [{ k: 'name', v: '', o: 'not' }]),
            state: makeEnumValueHandler(USER_GROUP_STATE),
            email: makeDistinctValueHandler(resourceType, 'email'),
            auth_type: makeDistinctValueHandler(resourceType, 'auth_type'),
            last_accessed_at: makeDistinctValueHandler(resourceType, 'last_accessed_at', 'datetime'),
            tags: makeDistinctValueHandler(resourceType, 'tags'),
        };
    }),
});

const props = withDefaults(defineProps<Props>(), {
    tableHeight: 400,
});

const handleSelect = async (index: number[]) => {
    userGroupPageStore.$patch({ selectedIndices: index });
};

const handleChange = async (options: any = {}) => {
    // options에는 페이제네이션의 값이 설정될 때마다 해당 설정 값만 들어간다,
    // page 넘길시 options = { pageStary: 15 }
    // page 개수 정할시 options = { pageLimit: 30 }
    userGroupListApiQuery = getApiQueryWithToolboxOptions(userGroupListApiQueryHelper, options) ?? userGroupListApiQuery;

    // 이 코드의 존재 이유 페이지네이션 관련 상태는 userGrioListApiQuery에서 관리되고 다른 곳에서도 userGroupPageStore의 페이지네이션 상태는 사용되지 않는다.
    // if (options.queryTags !== undefined) {
    //     userGroupPageStore.$patch((_state) => {
    //         _state.searchFilters = userGroupListApiQueryHelper.filters;
    //     });
    // }
    // if (options.pageStart !== undefined) userGroupPageStore.$patch({ pageStart: options.pageStart });
    // if (options.pageLimit !== undefined) userGroupPageStore.$patch({ pageLimit: options.pageLimit });

    await userGroupPageStore.listUsers({ query: userGroupListApiQuery });
};

</script>

<template>
    <section class="user-group-table">
        <p-toolbox-table
            :style="{height: `${props.tableHeight}px`}"
            :loading="userGroupPageState.loading"
            :total-count="userGroupPageState.totalCount"
            :fields="tableState.fields"
            :items="tableState.items"

            searchable
            search-type="query"
            :query-tags="queryTags"
            :key-item-sets="USER_GROUP_SEARCH_HANDLERS.keyItemSets"
            :value-handler-map="tableState.valueHandlerMap"

            selectable
            :select-index="userGroupPageState.selectedIndices"

            sortable
            sort-by="name"
            :sort-desc="true"

            @select="handleSelect"
            @change="handleChange"
            @refresh="handleChange"
        >
            <template #toolbox-left>
                <user-group-table-toolbox />
            </template>
        </p-toolbox-table>
    </section>
</template>
