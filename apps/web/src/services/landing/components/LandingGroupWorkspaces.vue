<script setup lang="ts">
import { computed, reactive } from 'vue';

import { partition, sortBy } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldTitle, PButton, PButtonTab, PIconButton,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/schema/_common/api-verbs/list';
import type { WorkspaceGroupListParameters } from '@/schema/identity/workspace-group/api-verbs/list';
import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';
import type { WorkspaceListParameters } from '@/schema/identity/workspace/api-verbs/list';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { i18n } from '@/translations';

import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';

import LandingWorkspaceBoard from '@/services/landing/components/LandingWorkspaceBoard.vue';
import { BOARD_TYPE } from '@/services/landing/constants/landing-constants';
import type { WorkspaceBoardSet } from '@/services/landing/type/type';

const PAGE_SIZE = 16;

interface Props {
    favoriteList?: FavoriteItem[];
    isDomainAdmin?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    favoriteList: undefined,
    isDomainAdmin: false,
});

const emit = defineEmits<{(e: 'create'): void}>();

const state = reactive({
    isShowAll: false,
    workspaceList: [] as WorkspaceModel[],
    workspaceBoardSets: computed<WorkspaceBoardSet[]>(() => {
        const favoriteOrderList = sortBy(state.workspaceList, (workspaceItem) => {
            const correspondingAItem = props.favoriteList?.find((favoriteItem) => favoriteItem?.itemId === workspaceItem.workspace_id);
            return correspondingAItem ? props.favoriteList?.indexOf(correspondingAItem) : Infinity;
        });
        const [active, dormant] = partition(favoriteOrderList, (item) => !item.is_dormant);

        const orderedList = [...active, ...dormant];
        const slicedList = state.isShowAll ? orderedList : orderedList.slice(0, PAGE_SIZE);
        return slicedList.map((d) => ({
            ...d,
            rounded: true,
        }));
    }),
    workspaceGroupList: [] as WorkspaceGroupModel[],
    workspaceFilterList: computed(() => [
        { label: i18n.t('LADING.ALL_WORKSPACE'), name: 'all' },
        { label: i18n.t('LADING.ALL_WORKSPACE2'), name: 'all2' },
        ...state.workspaceGroupList.map((group:WorkspaceGroupModel) => ({ label: group.name, name: group.workspace_group_id })),
    ]),
    activeTab: 'all',
    isAllWorkspaceTab: computed(() => state.activeTab === 'all'),
});

const handleClickShowAll = () => {
    state.isShowAll = true;
};

const fetchWorkspaceGroupList = async () => {
    try {
        const response = await SpaceConnector.clientV2.identity.workspaceGroup.list<WorkspaceGroupListParameters, ListResponse<WorkspaceGroupModel>>();
        state.workspaceGroupList = response;
    } catch (e) {
        console.error(e);
    }
};

const fetchWorkspaceList = async () => {
    try {
        const response = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>();
        state.workspaceList = response;
    } catch (e) {
        console.error(e);
    }
};

(async () => {
    await fetchWorkspaceGroupList();
    await fetchWorkspaceList();
})();

</script>

<template>
    <div class="landing-all-workspaces">
        <p-button-tab v-model="state.activeTab"
                      :tabs="state.workspaceFilterList"
        >
            <template #additional-button>
                <p-icon-button name="ic_settings"
                               style-type="tertiary"
                               size="sm"
                               class="ml-1"
                />
            </template>
            <div class="title-wrapper">
                <p-field-title :label="state.isAllWorkspaceTab ? $t('LADING.ALL_WORKSPACE'): $t('LADING.WORKSPACE_GROUP')"
                               color="dark"
                               font-weight="bold"
                               size="md"
                               class="title"
                >
                    <template #right>
                        <span class="cnt">({{ state.workspaceList.length }})</span>
                    </template>
                </p-field-title>
                <p-button v-if="props.isDomainAdmin"
                          style-type="primary"
                          size="md"
                          icon-left="ic_plus_bold"
                          @click="emit('create')"
                >
                    {{ $t('LADING.CREATE') }}
                </p-button>
            </div>
            <landing-workspace-board :board-sets="state.workspaceBoardSets"
                                     :board-type="BOARD_TYPE.ALL_WORKSPACE"
                                     :is-domain-admin="props.isDomainAdmin"
            />
            <div class="show-more-button-wrapper">
                <p-button v-if="state.workspaceList.length > PAGE_SIZE && state.workspaceBoardSets.length < state.workspaceList.length"
                          icon-right="ic_chevron-down"
                          style-type="transparent"
                          size="md"
                          class="show-more-button"
                          @click="handleClickShowAll"
                >
                    {{ $t('LADING.SHOW_ALL') }}
                </p-button>
            </div>
        </p-button-tab>
    </div>
</template>

<style scoped lang="postcss">
.landing-all-workspaces {
    @apply flex flex-col;
    gap: 1rem;

    /* custom design-system component - p-button-tab */
    :deep(.p-button-tab) {
        .button-group {
            margin: 0;
        }
    }

    .title-wrapper {
        @apply flex items-center justify-between;

        margin-top: 2rem;
        margin-bottom: 1rem;
        .title {
            .cnt {
                @apply text-label-md;
            }
        }
    }

    .show-more-button-wrapper {
        @apply flex justify-center;

        .show-more-button {
            margin-top: 0.5rem;
            width: 6.5rem;
        }
    }
}
</style>
