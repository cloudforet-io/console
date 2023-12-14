<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PHeading, PToolboxTable,
} from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ProjectGetParameters } from '@/schema/identity/project/api-verbs/get';
import type { ProjectModel } from '@/schema/identity/project/model';
import { store } from '@/store';

import type { UserReferenceMap } from '@/store/modules/reference/user/type';

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

const storeState = reactive({
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
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
    timezone: computed(() => store.state.user.timezone ?? 'UTC'),
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
    // TODO: check it's working
    if (options.searchText !== undefined) state.searchText = options.searchText;
    if (options.pageLimit !== undefined) state.pageLimit = options.pageLimit;
    if (options.pageStart !== undefined) state.pageStart = options.pageStart;
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

// LOAD REFERENCE STORE
(async () => {
    await store.dispatch('reference/user/load');
})();
</script>

<template>
    <div>
        <p-heading heading-type="sub"
                   :title="$t('INVENTORY.CLOUD_SERVICE.ADMIN.MEMBER')"
                   :total-count="state.totalCount"
        />
        <p-toolbox-table :fields="state.fields"
                         :items="state.refinedItems.slice(state.pageStart - 1, state.pageStart + state.pageLimit - 1)"
                         :loading="state.loading"
                         :total-count="state.totalCount"
                         @export="handleExport"
                         @change="handleChangeTable"
                         @refresh="handleChangeTable()"
        />
    </div>
</template>

<style lang="postcss" scoped>
/* custom design-system component - p-search-table */
:deep(.p-search-table) {
    border-width: 0;
}
</style>
