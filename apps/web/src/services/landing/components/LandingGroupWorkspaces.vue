<script setup lang="ts">
import { computed, reactive } from 'vue';

import { partition, sortBy } from 'lodash';

import {
    PFieldTitle, PButton, PButtonTab, PIconButton,
} from '@cloudforet/mirinae';

import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';
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
        { label: 'test group 1', name: 'test1' },
        { label: 'test group 2', name: 'test2' },
        { label: 'test group 3', name: 'test3' },
        { label: 'test group 4', name: 'test4' },
        { label: 'test group 5', name: 'test5' },
        ...state.workspaceGroupList.map((group:WorkspaceGroupModel) => ({ label: group.name, name: group.workspace_group_id })),
    ]),
    activeTab: 'all',
    isAllWorkspaceTab: computed(() => state.activeTab === 'all'),
    isButtonGroupOpened: false,
});

const handleClickShowAll = () => {
    state.isShowAll = true;
};

const handleClickButtonGroupToggle = () => {
    state.isButtonGroupOpened = !state.isButtonGroupOpened;
};

const fetchWorkspaceGroupList = async () => {
    // try {
    //     const response = await SpaceConnector.clientV2.identity.workspaceGroup.list<WorkspaceGroupListParameters, ListResponse<WorkspaceGroupModel>>();
    //     state.workspaceGroupList = response;
    // } catch (e) {
    //     console.error(e);
    // }
};

const fetchWorkspaceList = async () => {
    // try {
    //     const response = await SpaceConnector.clientV2.identity.workspace.list<WorkspaceListParameters, ListResponse<WorkspaceModel>>();
    //     state.workspaceList = response;
    // } catch (e) {
    //     console.error(e);
    // }
};

(async () => {
    await fetchWorkspaceGroupList();
    await fetchWorkspaceList();
})();

</script>

<template>
    <div class="landing-group-workspaces">
        <div class="workspace-group-filter-container"
             :class="{ 'is-opened': state.isButtonGroupOpened }"
        >
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
            </p-button-tab>
            <p-icon-button :name="state.isButtonGroupOpened ? 'ic_chevron-up' : 'ic_chevron-down'"
                           style-type="tertiary"
                           @click="handleClickButtonGroupToggle"
            />
        </div>
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
    </div>
</template>

<style scoped lang="postcss">
.landing-group-workspaces {
    @apply flex flex-col;
    gap: 1rem;

    .workspace-group-filter-container {
        @apply flex gap-4;

        /* custom design-system component - p-button-tab */
        :deep(.p-button-tab) {
            width: calc(100% - 3rem);
            .button-group {
                margin: 0;
                overflow-x: auto;
                flex-wrap: nowrap;

                .tab-header-button {
                    flex-shrink: 0;
                }
            }

            .button-group::-webkit-scrollbar {
                display: none;
            }

            .tab-pane {
                padding-bottom: 0;
            }
        }
    }
    .is-opened {
        /* custom design-system component - p-button-tab */
        :deep(.p-button-tab) {
            .button-group {
                flex-wrap: wrap;
            }
        }
    }

    .title-wrapper {
        @apply flex items-center justify-between;

        margin-top: 1rem;
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
