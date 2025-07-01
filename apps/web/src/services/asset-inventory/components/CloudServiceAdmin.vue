<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import { useQueryClient } from '@tanstack/vue-query';

import {
    PHeading, PToolboxTable,
} from '@cloudforet/mirinae';


import { useProjectApi } from '@/api-clients/identity/project/composables/use-project-api';
import type { ProjectGetParameters } from '@/api-clients/identity/project/schema/api-verbs/get';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useAllReferenceDataModel } from '@/query/resource-query/reference-model/use-all-reference-data-model';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';

import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';


interface Props {
    cloudServiceProjectId?: string;
}
const props = withDefaults(defineProps<Props>(), {
    cloudServiceProjectId: '',
});
interface UserItem {
    user_id: string;
    user_name: string;
}

const userStore = useUserStore();
const referenceMap = useAllReferenceDataModel();

const state = reactive({
    fields: [
        { label: 'User ID', name: 'user_id' },
        { label: 'User Name', name: 'user_name' },
    ],
    projectUserIdList: computed<string[]>(() => data.value?.users ?? []),
    refinedItems: computed<UserItem[]>(() => {
        const users: UserItem[] = state.projectUserIdList.map((d) => ({
            user_id: d,
            user_name: referenceMap.user[d]?.name || d,
        }));
        return users.filter((d) => {
            const searchText = state.searchText.toLowerCase();
            return d.user_id.toLowerCase().includes(searchText)
                        || d.user_name.toLowerCase().includes(searchText);
        });
    }),
    totalCount: computed<number>(() => data.value?.users?.length ?? 0),
    searchText: '',
    pageLimit: 15,
    pageStart: 1,
    timezone: computed(() => userStore.state.timezone ?? 'UTC'),
});

const queryClient = useQueryClient();
const { projectAPI } = useProjectApi();
const { key, params: queryParams } = useServiceQueryKey('identity', 'project', 'get', {
    params: computed<ProjectGetParameters>(() => ({ project_id: props.cloudServiceProjectId })),
});

const { data, isLoading } = useScopedQuery({
    queryKey: key,
    queryFn: () => projectAPI.get(queryParams.value),
    enabled: computed(() => !!props.cloudServiceProjectId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
}, ['DOMAIN', 'WORKSPACE']);


const handleChangeTable = async (options: any = {}) => {
    if (options.searchText !== undefined) state.searchText = options.searchText;
    if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
};

const handleRefreshUserData = async () => {
    await queryClient.invalidateQueries({ queryKey: key.value });
};

const handleExport = async () => {
    await downloadExcel({
        data: state.refinedItems,
        fields: state.fields,
        file_name_prefix: FILE_NAME_PREFIX.cloudService,
        timezone: state.timezone,
    });
};
</script>

<template>
    <div>
        <p-heading class="pt-8 px-4 pb-4"
                   heading-type="sub"
                   :title="$t('INVENTORY.CLOUD_SERVICE.ADMIN.MEMBER')"
                   :total-count="state.totalCount"
        />
        <p-toolbox-table :fields="state.fields"
                         :items="state.refinedItems.slice(state.pageStart - 1, state.pageStart + state.pageLimit - 1)"
                         :loading="isLoading"
                         :total-count="state.totalCount"
                         class="member-table"
                         @export="handleExport"
                         @change="handleChangeTable"
                         @refresh="handleRefreshUserData"
        />
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-search-table */
:deep(.p-toolbox-table) {
    border-width: 0;
}
</style>
