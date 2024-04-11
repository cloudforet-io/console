<script lang="ts" setup>
import { computed, reactive } from 'vue';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import GeneralPageLayout from '@/common/modules/page-layouts/GeneralPageLayout.vue';

import Bookmark from '@/services/workspace-home/components/Bookmark.vue';
import Summaries from '@/services/workspace-home/components/Summaries.vue';
import UserConfigs from '@/services/workspace-home/components/UserConfigs.vue';
import WorkspaceInfo from '@/services/workspace-home/components/WorkspaceInfo.vue';

const userWorkspaceStore = useUserWorkspaceStore();
const storeState = reactive({
    currentWorkspaceId: computed(() => userWorkspaceStore.getters.currentWorkspaceId),
});
</script>

<template>
    <general-page-layout :key="storeState.currentWorkspaceId"
                         class="workspace-home-page"
    >
        <div class="page-contents">
            <workspace-info />
            <bookmark />
            <user-configs class="section" />
            <summaries class="section" />
        </div>
    </general-page-layout>
</template>

<style lang="postcss" scoped>
.workspace-home-page {
    height: 100%;
    .page-contents {
        @apply flex flex-col;
        max-width: 87rem;
        margin-right: auto;
        margin-left: auto;
        padding: 0;
        .section {
            margin-top: 1rem;
        }
    }
}
</style>
