<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PDataTable, PHeading } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { TimeStamp } from '@/schema/_common/model';
import type { ProjectListParameters } from '@/schema/identity/project/api-verbs/list';
import type { ProjectModel } from '@/schema/identity/project/model';
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
    items: [] as TableItem[],
    selectedUser: computed(() => userPageStore.selectedUsers[0]),
});
const tableState = reactive({
    fields: computed(() => [
        { name: 'name', label: i18n.t('IAM.USER.MAIN.PROJECT') as string },
        { name: 'date', label: i18n.t('IAM.USER.MAIN.INVITED') as string },
    ]),
});

/* API */
const getProjectList = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.clientV2.identity.project.list<ProjectListParameters, ListResponse<ProjectModel>>({
            user_id: state.selectedUser.user_id,
        });
        if (!results) {
            state.items = [];
            return;
        }
        state.items = (results ?? []).map((k) => ({
            project_id: k.project_id,
            name: k.name,
            date: k.created_at,
        }));
    } catch (e) {
        state.items = [];
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch([() => props.activeTab, () => state.selectedUser.user_id], async () => {
    await getProjectList();
}, { immediate: true });
</script>

<template>
    <div class="user-management-tab-project">
        <p-heading heading-type="sub"
                   :use-total-count="true"
                   :total-count="state.items.length"
                   :title="$t('IAM.USER.MAIN.ASSOCIATED_PROJECTS')"
        />
        <p-data-table :fields="tableState.fields"
                      :items="state.items"
                      :loading="state.loading"
                      sort-by="name"
                      beautify-text
        />
    </div>
</template>

<style scoped lang="postcss">
.user-management-tab-project {
    @apply flex flex-col;
}
</style>
