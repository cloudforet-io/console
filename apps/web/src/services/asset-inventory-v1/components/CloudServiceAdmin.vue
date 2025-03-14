<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PHeading, PToolboxTable,
} from '@cloudforet/mirinae';


import type { ProjectGetParameters } from '@/api-clients/identity/project/schema/api-verbs/get';
import type { ProjectModel } from '@/api-clients/identity/project/schema/model';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { UserReferenceMap } from '@/store/reference/user-reference-store';
import { useUserStore } from '@/store/user/user-store';

import { FILE_NAME_PREFIX } from '@/lib/excel-export/constant';
import { downloadExcel } from '@/lib/helper/file-download-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';


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

const allReferenceStore = useAllReferenceStore();
const userStore = useUserStore();
const storeState = reactive({
    users: computed<UserReferenceMap>(() => allReferenceStore.getters.user),
});
const state = reactive({
    fields: [
        { label: 'User ID', name: 'user_id' },
        { label: 'User Name', name: 'user_name' },
    ],
    projectUserIdList: [] as string[],
    refinedItems: computed<UserItem[]>(() => {
        const users: UserItem[] = state.projectUserIdList.map((d) => ({
            user_id: d,
            user_name: storeState.users[d]?.name ?? d,
        }));
        return users.filter((d) => {
            const searchText = state.searchText.toLowerCase();
            return d.user_id.toLowerCase().includes(searchText)
                        || d.user_name.toLowerCase().includes(searchText);
        });
    }),
    loading: true,
    totalCount: 0,
    searchText: '',
    pageLimit: 15,
    pageStart: 1,
    timezone: computed(() => userStore.state.timezone ?? 'UTC'),
});

const getProjectUserData = async () => {
    state.loading = true;
    try {
        const res = await SpaceConnector.clientV2.identity.project.get<ProjectGetParameters, ProjectModel>({
            project_id: props.cloudServiceProjectId,
        });
        state.projectUserIdList = res.users ?? [];
        state.totalCount = res.users?.length ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
        state.projectUserIdList = [];
    } finally {
        state.loading = false;
    }
};

const handleChangeTable = async (options: any = {}) => {
    if (options.searchText !== undefined) state.searchText = options.searchText;
    if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
};

const handleRefreshUserData = async () => {
    await getProjectUserData();
};

const handleExport = async () => {
    await downloadExcel({
        data: state.refinedItems,
        fields: state.fields,
        file_name_prefix: FILE_NAME_PREFIX.cloudService,
        timezone: state.timezone,
    });
};

watch(() => props.cloudServiceProjectId, (after, before) => {
    if (!after) {
        state.projectUserIdList = [];
    } else if (after !== before) getProjectUserData();
}, { immediate: true });
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
                         :loading="state.loading"
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
