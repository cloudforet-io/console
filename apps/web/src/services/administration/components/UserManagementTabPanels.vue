<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PDataTable, PHeading } from '@spaceone/design-system';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { TimeStamp } from '@/schema/_common/model';
import type { ProjectListParameters } from '@/schema/identity/project/api-verbs/list';
import type { ProjectModel } from '@/schema/identity/project/model';
import { i18n } from '@/translations';

import { USER_TABS } from '@/services/administration/constants/user-constant';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

interface TableItem {
    project_id?: string;
    name?: string;
    date?: TimeStamp;
    key?: string;
    value?: string;
}
interface Props {
    type: string;
    activeTab: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: '',
    activeTab: '',
});

const userPageStore = useUserPageStore();

const state = reactive({
    loading: false,
    tags: {},
    title: computed(() => (props.type === USER_TABS.PROJECTS
        ? i18n.t('IAM.USER.MAIN.ASSOCIATED_PROJECTS')
        : i18n.t('IAM.USER.MAIN.TAG'))),
    items: [] as TableItem[],
    selectedUser: computed(() => userPageStore.selectedUsers[0]),
});
const tableState = reactive({
    fields: computed(() => (props.type === USER_TABS.PROJECTS
        ? [
            { name: 'name', label: i18n.t('IAM.USER.MAIN.PROJECT'), type: 'link' },
            { name: 'date', label: i18n.t('IAM.USER.MAIN.INVITED') },
        ]
        : [
            { name: 'key', label: i18n.t('COMMON.TAGS.KEY') },
            { name: 'value', label: i18n.t('COMMON.TAGS.VALUE') },
        ])),
});

/* API */
const getProjectItems = async () => {
    state.loading = true;
    try {
        const { results } = await SpaceConnector.clientV2.identity.project.list<ProjectListParameters, ListResponse<ProjectModel>>({
            user_id: state.selectedUser.user_id,
        });
        if (!results) {
            state.items = [];
            return;
        }
        state.items = results?.map((k) => ({
            project_id: k.project_id,
            name: k.name,
            date: k.created_at,
        })) as TableItem[];
    } catch (e) {
        state.items = [];
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch([() => props.activeTab, () => state.selectedUser.user_id], async () => {
    if (props.type === USER_TABS.PROJECTS) {
        await getProjectItems();
    } else {
        state.items = Object.entries(state.selectedUser.tags || {}).map(([k, v]) => ({
            key: k,
            value: v,
        }));
    }
}, { immediate: true });
</script>

<template>
    <div class="user-management-tab-panels">
        <p-heading heading-type="sub"
                   :use-total-count="true"
                   :total-count="state.items.length"
                   :title="state.title"
        />
        <p-data-table :fields="tableState.fields"
                      :items="state.items"
                      :loading="state.loading"
                      :col-copy="props.type === USER_TABS.TAG"
                      sort-by="name"
                      :sortable="props.type === USER_TABS.TAG"
                      :sort-desc="props.type === USER_TABS.TAG"
                      beautify-text
        />
    </div>
</template>

<style scoped lang="postcss">
.user-management-tab-panels {
    @apply flex flex-col;
}
</style>
