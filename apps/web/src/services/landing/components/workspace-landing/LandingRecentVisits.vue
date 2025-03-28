<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PFieldTitle } from '@cloudforet/mirinae';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';

import type { RecentConfig } from '@/common/modules/navigations/type';

import LandingWorkspaceRecentList from '@/services/landing/components/workspace-landing/LandingWorkspaceRecentList.vue';
import { BOARD_TYPE } from '@/services/landing/constants/landing-constants';
import type { WorkspaceBoardSet } from '@/services/landing/type/type';

interface Props {
    workspaceList?: WorkspaceModel[];
    recentVisits?: RecentConfig[];
}

const props = withDefaults(defineProps<Props>(), {
    workspaceList: () => ([]),
    recentVisits: undefined,
});

const state = reactive({
    recentBoardSets: computed<WorkspaceBoardSet[]>(() => {
        const orderList: WorkspaceBoardSet[] = [];
        props.recentVisits?.forEach((recentItem) => {
            const matchingObj = props.workspaceList.find((workspaceItem) => !workspaceItem.is_dormant && workspaceItem.workspace_id === recentItem.itemId);
            if (matchingObj) {
                orderList.push({
                    ...matchingObj,
                    rounded: true,
                });
            }
        });
        return orderList;
    }),
});
</script>

<template>
    <div class="landing-recent-visits">
        <p-field-title :label="$t('LADING.RECENT')"
                       color="dark"
                       font-weight="bold"
                       size="md"
        />
        <landing-workspace-recent-list :board-sets="state.recentBoardSets"
                                       :board-type="BOARD_TYPE.RECENT"
        />
    </div>
</template>

<style scoped lang="postcss">
.landing-recent-visits {
    @apply flex flex-col;
    gap: 1rem;
}
</style>
