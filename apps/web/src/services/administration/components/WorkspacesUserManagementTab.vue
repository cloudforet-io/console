<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PTab } from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import WorkspacesUserManagementTabContents from '@/services/administration/components/WorkspacesUserManagementTabContents.vue';
import { useWorkspacePageStore } from '@/services/administration/store/workspace-page-store';

const workspacePageStore = useWorkspacePageStore();
const workspacePageState = workspacePageStore.$state;

const tabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IAM.WORKSPACES.DETAIL.USERS'), name: 'users', keepAlive: true },
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
        </p-tab>
    </section>
</template>
