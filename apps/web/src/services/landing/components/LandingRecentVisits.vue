<script setup lang="ts">
import { computed, reactive } from 'vue';

import { PFieldTitle } from '@spaceone/design-system';

import type { WorkspaceModel } from '@/schema/identity/workspace/model';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { ReferenceData } from '@/lib/helper/config-data-helper';
import { convertWorkspaceConfigToReferenceData } from '@/lib/helper/config-data-helper';

import type { RecentConfig } from '@/common/modules/navigations/type';

import LandingWorkspaceBoard from '@/services/landing/components/LandingWorkspaceBoard.vue';
import { BOARD_TYPE } from '@/services/landing/constants/landing-constants';

interface Props {
    recentVisits?: RecentConfig[];
}

const props = withDefaults(defineProps<Props>(), {
    recentVisits: () => ([]),
});

const userWorkspaceStore = useUserWorkspaceStore();
const workspaceStoreGetters = userWorkspaceStore.getters;

const storeState = reactive({
    workspaceList: computed<WorkspaceModel[]>(() => workspaceStoreGetters.workspaceList),
});

const state = reactive({
    recentBoardSets: computed<ReferenceData[]>(() => convertWorkspaceConfigToReferenceData(props.recentVisits ?? [], storeState.workspaceList)),
});
</script>

<template>
    <div class="landing-recent-visits">
        <p-field-title :label="$t('LADING.RECENT')"
                       color="dark"
                       font-weight="bold"
                       size="md"
        />
        <landing-workspace-board :board-sets="state.recentBoardSets"
                                 :board-type="BOARD_TYPE.RECENT"
        />
    </div>
</template>

<style scoped lang="postcss">
.landing-recent-visits {
    @apply flex flex-col;
    gap: 1rem;
    .recent-board {
        @apply grid grid-cols-3 gap-2;
    }
}
</style>
