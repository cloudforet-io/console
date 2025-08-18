<script setup lang="ts">
import { reactive, computed } from 'vue';

import { PTab, PBadge } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import { WORKSPACE_GROUP_TABS } from '@/services/advanced/constants/workspace-group-constant';
import LandingWorkspaceGroupTabGroupUser from '@/services/landing/components/workspace-landing/landing-group-workspaces/LandingWorkspaceGroupTabGroupUser.vue';
import LandingWorkspaceGroupTabWorkspace from '@/services/landing/components/workspace-landing/landing-group-workspaces/LandingWorkspaceGroupTabWorkspace.vue';
import { useUserProfileGetWorkspaceGroupsQuery } from '@/services/landing/composables/use-user-profile-get-workspace-groups-query';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';

const landingPageStore = useLandingPageStore();
const landingPageState = landingPageStore.state;
const state = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IAM.WORKSPACE_GROUP.TAB.GROUP_USER'), name: WORKSPACE_GROUP_TABS.GROUP_USER },
        { label: i18n.t('IAM.WORKSPACE_GROUP.TAB.WORKSPACE'), name: WORKSPACE_GROUP_TABS.WORKSPACE },
    ])),
    activeTab: WORKSPACE_GROUP_TABS.GROUP_USER,
});
const workspaceGroupTotalCount = computed<number>(() => {
    const target = workspaceGroupList.value?.find((item) => item.workspace_group_id === landingPageState.selectedWorkspaceGroupId);
    return target?.users?.length ?? 0;
});

/* Query */
const { data: workspaceGroupList } = useUserProfileGetWorkspaceGroupsQuery();

</script>

<template>
    <section class="workspace-group-tab">
        <p-tab :tabs="state.tabs"
               :active-tab.sync="state.activeTab"
        >
            <template #extra="{name}">
                <p-badge v-if="name === WORKSPACE_GROUP_TABS.GROUP_USER"
                         shape="round"
                         badge-type="subtle"
                         style-type="gray100"
                         size="sm"
                >
                    {{ workspaceGroupTotalCount }}
                </p-badge>
            </template>
            <template #group_user>
                <landing-workspace-group-tab-group-user />
            </template>
            <template #workspace>
                <landing-workspace-group-tab-workspace />
            </template>
        </p-tab>
    </section>
</template>
