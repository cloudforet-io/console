<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTab } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import WorkspacesUserManagementTabContents from '@/services/advanced/components/WorkspacesUserManagementTabContents.vue';
import WorkspaceTagManagementTabContents from '@/services/advanced/components/WorkspaceTagManagementTabContents.vue';
import { useWorkspacePageStore } from '@/services/advanced/store/workspace-page-store';

const workspacePageStore = useWorkspacePageStore();
const workspacePageState = workspacePageStore.$state;

const tabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IAM.WORKSPACES.DETAIL.USERS'), name: 'users', keepAlive: true },
        { label: i18n.t('COMMON.TAGS.TITLE'), name: 'tags', keepAlive: true },
    ])),
    activeTab: 'users',
});

</script>

<template>
    <section>
        <p-tab v-if="workspacePageState.selectedIndices.length === 1"
               :tabs="tabState.tabs"
               :active-tab.sync="tabState.activeTab"
        >
            <template #users>
                <workspaces-user-management-tab-contents />
            </template>
            <template #tags>
                <workspace-tag-management-tab-contents :active-tab="tabState.activeTab" />
            </template>
        </p-tab>
    </section>
</template>
