<script setup lang="ts">
import { reactive, computed } from 'vue';

import { PTab } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import WorkspaceGroupTabGroupUser from '@/services/advanced/components/WorkspaceGroupTabGroupUser.vue';
import { WORKSPACE_GROUP_TABS } from '@/services/advanced/constants/workspace-group-constant';

const singleItemTabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IAM.WORKSPACE_GROUP.TAB.GROUP_USER'), name: WORKSPACE_GROUP_TABS.GROUP_USER },
        { label: i18n.t('IAM.WORKSPACE_GROUP.TAB.WORKSPACE'), name: WORKSPACE_GROUP_TABS.WORKSPACE },
    ])),
    activeTab: WORKSPACE_GROUP_TABS.GROUP_USER,
});
</script>

<template>
    <section class="workspace-group-tab">
        <p-tab :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #group_user>
                <workspace-group-tab-group-user />
            </template>
        </p-tab>
    </section>
</template>
