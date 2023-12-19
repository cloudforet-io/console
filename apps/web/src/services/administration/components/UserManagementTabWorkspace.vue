<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PDataTable, PHeading } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { TimeStamp } from '@/schema/_common/model';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { i18n } from '@/translations';

import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface TableItem {
    project_id?: string;
    name?: string;
    date?: TimeStamp;
    key?: string;
    value?: string;
}
interface Props {
    activeTab: string;
}

const props = withDefaults(defineProps<Props>(), {
    activeTab: '',
});

const userPageStore = useUserPageStore();

const state = reactive({
    loading: false,
    tags: {},
    items: [] as TableItem[],
    selectedUser: computed(() => userPageStore.selectedUsers[0]),
});
const tableState = reactive({
    fields: computed(() => [
        { name: 'name', label: i18n.t('IAM.USER.MAIN.WORKSPACE') as string },
        { name: 'date', label: i18n.t('IAM.USER.MAIN.INVITED') as string },
    ]),
});

const workspaceApiHelper = new ApiQueryHelper()
    .setPage(1, 15);

/* API */
const getWorkspaceList = async () => {
    state.loading = true;
    workspaceApiHelper.setFilters([{ k: 'user_id', v: state.selectedUser.user_id || '', o: '=' }]);
    try {
        // TODO: will be check
        const { results } = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>({
            query: workspaceApiHelper.data,
        });
        if (!results) {
            state.items = [];
            return;
        }
        console.log(results);
        // state.items = results?.map((k) => ({
        //     project_id: k.project_id,
        //     name: k.name,
        //     date: k.created_at,
        // })) as TableItem[];
    } catch (e) {
        state.items = [];
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch([() => props.activeTab, () => state.selectedUser.user_id], async () => {
    await getWorkspaceList();
}, { immediate: true });
</script>

<template>
    <div class="user-management-tab-workspace">
        <p-heading heading-type="sub"
                   :use-total-count="true"
                   :total-count="state.items.length"
                   :title="$t('IAM.USER.MAIN.ASSOCIATED_WORKSPACE')"
        />
        <p-data-table :fields="tableState.fields"
                      :items="state.items"
                      :loading="state.loading"
                      sort-by="name"
                      sortable
                      beautify-text
        />
    </div>
</template>

<style scoped lang="postcss">
.user-management-tab-workspace {
    @apply flex flex-col;
}
</style>
