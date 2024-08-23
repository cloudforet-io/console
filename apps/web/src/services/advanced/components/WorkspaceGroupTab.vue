<script setup lang="ts">
import { reactive, computed } from 'vue';

import { PTab } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import WorkspaceGroupTabGroupUser from '@/services/advanced/components/WorkspaceGroupTabGroupUser.vue';
import WorkspaceGroupTabWorkspace from '@/services/advanced/components/WorkspaceGroupTabWorkspace.vue';
import { WORKSPACE_GROUP_TABS } from '@/services/advanced/constants/workspace-group-constant';

const emit = defineEmits<{(e: 'refersh', payload: { isGroupUser?: boolean, isWorkspace?: boolean }): void; }>();

const singleItemTabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IAM.WORKSPACE_GROUP.TAB.GROUP_USER'), name: WORKSPACE_GROUP_TABS.GROUP_USER },
        { label: i18n.t('IAM.WORKSPACE_GROUP.TAB.WORKSPACE'), name: WORKSPACE_GROUP_TABS.WORKSPACE },
    ])),
    activeTab: WORKSPACE_GROUP_TABS.GROUP_USER,
});

const handleRefresh = (value) => {
    emit('refresh', value);
};
</script>

<template>
    <section class="workspace-group-tab">
        <p-tab :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #group_user>
                <workspace-group-tab-group-user @refresh="handleRefresh" />
            </template>
            <template #workspace>
                <workspace-group-tab-workspace @refresh="handleRefresh" />
            </template>
        </p-tab>
    </section>
</template>
