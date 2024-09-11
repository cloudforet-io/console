<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { partition, sortBy } from 'lodash';

import {
    PFieldTitle, PButton, PButtonTab, PIconButton,
} from '@cloudforet/mirinae';

import type { WorkspaceGroupModel } from '@/schema/identity/workspace-group/model';
import type { WorkspaceModel } from '@/schema/identity/workspace/model';
import { i18n } from '@/translations';

import { makeAdminRouteName } from '@/router/helpers/route-helper';

import { useUserWorkspaceGroupStore } from '@/store/app-context/workspace/user-workspace-group-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';

import { ADVANCED_ROUTE } from '@/services/advanced/routes/route-constant';
import LandingWorkspaceBoard from '@/services/landing/components/LandingWorkspaceBoard.vue';
import LandingWorkspaceGroupManageOverlay from '@/services/landing/components/LandingWorkspaceGroupManageOverlay.vue';
import { BOARD_TYPE } from '@/services/landing/constants/landing-constants';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';
import type { WorkspaceBoardSet } from '@/services/landing/type/type';

const PAGE_SIZE = 16;

interface Props {
    favoriteList?: FavoriteItem[];
    isDomainAdmin?: boolean;
    hasReadWriteAccess?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    favoriteList: undefined,
    isDomainAdmin: false,
});

const emit = defineEmits<{(e: 'create'): void}>();
const router = useRouter();

// store setting
const userWorkspaceStore = useUserWorkspaceStore();
const userWorkspaceStoreGetters = userWorkspaceStore.getters;
const userWorkspaceGroupStore = useUserWorkspaceGroupStore();
const userWorkspaceGroupStoreGetters = userWorkspaceGroupStore.getters;
const landingPageStore = useLandingPageStore();
const landingPageStoreState = landingPageStore.state;

const state = reactive({
    isShowAll: false,
    workspaceList: computed<WorkspaceModel[]>(() => userWorkspaceStoreGetters.workspaceList),
    selectedGroupWorkspaceList: computed(() => {
        if (landingPageStoreState.selectedProjectGroup === 'all') {
            return state.workspaceList;
        }
        const selectedGroupsWorkspaceId = state.workspaceGroupList.find((group) => group.workspace_group_id === landingPageStoreState.selectedProjectGroup)?.workspaces || [];
        return state.workspaceList.filter((workspace) => selectedGroupsWorkspaceId.includes(workspace.workspace_id));
    }),
    workspaceBoardSets: computed<WorkspaceBoardSet[]>(() => {
        const favoriteOrderList = sortBy(state.selectedGroupWorkspaceList, (workspaceItem) => {
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
    workspaceGroupList: computed(() => userWorkspaceGroupStoreGetters.workspaceGroupList),
    workspaceFilterList: computed(() => [
        { label: i18n.t('LADING.ALL_WORKSPACE'), name: 'all' },
        ...state.workspaceGroupList.map((group:WorkspaceGroupModel) => ({ label: group.name, name: group.workspace_group_id })),
    ]),
    isAllWorkspaceTab: computed(() => landingPageStoreState.selectedProjectGroup === 'all'),
    isOverlayOpen: false,
    isButtonGroupOpened: false,
    isShowAllVisible: computed(() => {
        if (landingPageStoreState.selectedProjectGroup === 'all') {
            return state.workspaceList.length > PAGE_SIZE && state.workspaceBoardSets.length < state.workspaceList.length;
        }
        return state.selectedGroupWorkspaceList.length > PAGE_SIZE && state.workspaceBoardSets.length < state.selectedGroupWorkspaceList.length;
    }),
});

const handleClickShowAll = () => {
    state.isShowAll = true;
};

const handleClickButtonGroupToggle = () => {
    state.isButtonGroupOpened = !state.isButtonGroupOpened;
};
const handleOpenOverlay = () => {
    state.isOverlayOpen = true;
};

(async () => {
    await userWorkspaceGroupStore.load();
})();

</script>

<template>
    <div class="landing-group-workspaces">
        <div class="workspace-group-filter-container"
             :class="{ 'is-opened': state.isButtonGroupOpened }"
        >
            <p-button-tab v-model="landingPageStoreState.selectedProjectGroup"
                          :tabs="state.workspaceFilterList"
            >
                <template #additional-button>
                    <p-icon-button v-if="props.hasReadWriteAccess && props.isDomainAdmin"
                                   name="ic_settings"
                                   style-type="tertiary"
                                   size="sm"
                                   class="ml-1"
                                   @click="() => { router.push({ name: makeAdminRouteName(ADVANCED_ROUTE.WORKSPACE_GROUP._NAME)})}"
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
            <div class="right-part-wrapper">
                <p-button v-if="landingPageStoreState.selectedProjectGroup !== 'all'"
                          style-type="tertiary"
                          size="md"
                          icon-left="ic_settings"
                          @click="handleOpenOverlay"
                >
                    {{ $t('LADING.SETTINGS') }}
                </p-button>
                <p-button v-if="props.hasReadWriteAccess && props.isDomainAdmin"
                          style-type="primary"
                          size="md"
                          icon-left="ic_plus_bold"
                          @click="emit('create')"
                >
                    {{ $t('LADING.CREATE') }}
                </p-button>
            </div>
        </div>
        <landing-workspace-board :board-sets="state.workspaceBoardSets"
                                 :board-type="BOARD_TYPE.ALL_WORKSPACE"
                                 :is-domain-admin="props.isDomainAdmin"
        />
        <div class="show-more-button-wrapper">
            <p-button v-if="state.isShowAllVisible"
                      icon-right="ic_chevron-down"
                      style-type="transparent"
                      size="md"
                      class="show-more-button"
                      @click="handleClickShowAll"
            >
                {{ $t('LADING.SHOW_ALL') }}
            </p-button>
            <landing-workspace-group-manage-overlay :is-overlay-open.sync="state.isOverlayOpen" />
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
            overflow-x: auto;
            .button-group {
                margin: 0;
                flex-wrap: nowrap;

                > button {
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

        .right-part-wrapper {
            @apply flex gap-2;
        }

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
