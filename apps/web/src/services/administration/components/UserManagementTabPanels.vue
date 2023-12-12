<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

import { PDataTable, PHeading } from '@spaceone/design-system';

import { i18n } from '@/translations';

import { USER_TABS } from '@/services/administration/constants/user-tab-constant';
import { useUserPageStore } from '@/services/administration/store/user-page-store';

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
        ? i18n.t('IDENTITY.USER.MAIN.ASSOCIATED_PROJECTS')
        : i18n.t('IDENTITY.USER.MAIN.TAG'))),
    items: {},
    selectedUser: computed(() => userPageStore.selectedUsers[0]),
});
const tableState = reactive({
    fields: computed(() => (props.type === USER_TABS.PROJECTS
        ? [
            { name: 'name', label: i18n.t('IDENTITY.USER.MAIN.PROJECT'), type: 'link' },
            { name: 'date', label: i18n.t('IDENTITY.USER.MAIN.INVITED') },
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
        const response = await userPageStore.listProjects({
            user_id: state.selectedUser.user_id,
        });
        state.items = response.map((k) => ({ project_id: k.project_id, name: k.name, date: k.created_at }));
    } catch (e) {
        state.items = {};
    } finally {
        state.loading = false;
    }
};

/* Watcher */
watch([() => props.activeTab, () => state.selectedUser.user_id], async () => {
    if (props.type === USER_TABS.PROJECTS) {
        await getProjectItems();
    } else {
        // TODO: will be changed to array
        state.items = Object.entries(state.selectedUser.tags || {}).map(([k, v]) => ({ key: k, value: v }));
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
