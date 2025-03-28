<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router/composables';

import { partition, sortBy } from 'lodash';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PFieldTitle, PButton, PButtonTab, PIconButton, PEmpty,
} from '@cloudforet/mirinae';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { UserProfileGetWorkspacesParameters } from '@/api-clients/identity/user-profile/schema/api-verbs/get-workspaces';
import type { MyWorkspaceModel } from '@/api-clients/identity/user-profile/schema/model';
import type { WorkspaceGroupModel } from '@/api-clients/identity/workspace-group/schema/model';
import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { useUserWorkspaceGroupStore } from '@/store/app-context/workspace/user-workspace-group-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import ErrorHandler from '@/common/composables/error/errorHandler';
import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';

import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';
import LandingWorkspaceBoard from '@/services/landing/components/workspace-landing/landing-group-workspaces/LandingWorkspaceBoard.vue';
import LandingWorkspaceGroupManageOverlay from '@/services/landing/components/workspace-landing/landing-group-workspaces/LandingWorkspaceGroupManageOverlay.vue';
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
        if (landingPageStoreState.selectedWorkspaceGroup === 'all') {
            return state.workspaceList;
        }
        return state.workspacesInSelectedGroup;
    }),
    workspacesInSelectedGroup: [] as MyWorkspaceModel[],
    workspacesInSelectedGroupTotalCount: 0,
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
    isAllWorkspaceTab: computed(() => landingPageStoreState.selectedWorkspaceGroup === 'all'),
    isOverlayOpen: false,
    isButtonGroupOpened: false,
    isShowAllVisible: computed(() => {
        if (landingPageStoreState.selectedWorkspaceGroup === 'all') {
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

const fetchWorkspaces = async (groupId:string) => {
    if (groupId === 'all') {
        return;
    }
    try {
        const { results } = await SpaceConnector.clientV2.identity.userProfile.getWorkspaces<UserProfileGetWorkspacesParameters, ListResponse<MyWorkspaceModel>>({
            workspace_group_id: groupId,
        });
        state.workspacesInSelectedGroup = results ?? [];
        state.workspacesInSelectedGroupTotalCount = results?.length ?? 0;
    } catch (e) {
        ErrorHandler.handleError(e);
    }
};

watch(() => landingPageStoreState.selectedWorkspaceGroup, (groupId) => {
    fetchWorkspaces(groupId);
});

(async () => {
    await userWorkspaceGroupStore.load();
})();

</script>

<template>
    <div class="landing-group-workspaces">
        <div class="workspace-group-filter-container"
             :class="{ 'is-opened': state.isButtonGroupOpened }"
        >
            <p-button-tab v-model="landingPageStoreState.selectedWorkspaceGroup"
                          :tabs="state.workspaceFilterList"
            >
                <template #additional-button>
                    <p-icon-button v-if="props.hasReadWriteAccess && props.isDomainAdmin"
                                   name="ic_settings"
                                   style-type="tertiary"
                                   size="sm"
                                   class="ml-1"
                                   @click="() => { router.push({ name: ADMIN_ADVANCED_ROUTE.WORKSPACE_GROUP._NAME})}"
                    />
                </template>
            </p-button-tab>
            <p-icon-button :name="state.isButtonGroupOpened ? 'ic_chevron-up' : 'ic_chevron-down'"
                           style-type="tertiary"
                           @click="handleClickButtonGroupToggle"
            />
        </div>
        <div class="title-wrapper">
            <p-field-title :label="$t('LADING.WORKSPACES')"
                           color="dark"
                           font-weight="bold"
                           size="md"
                           class="title"
            >
                <template #right>
                    <span class="cnt">({{ state.isAllWorkspaceTab ? state.workspaceList.length : state.workspacesInSelectedGroupTotalCount }})</span>
                </template>
            </p-field-title>
            <div class="right-part-wrapper">
                <p-button v-if="landingPageStoreState.selectedWorkspaceGroup !== 'all'"
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
        <p-empty v-if="state.workspaceBoardSets.length === 0"
                 show-image
                 image-size="sm"
        >
            {{ $t('LADING.NO_WORKSPACE') }}
        </p-empty>
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
            scrollbar-width: none; /* for Firefox */
            -ms-overflow-style: none; /* for IE, Edge */
            &::-webkit-scrollbar {
                display: none; /* for Chrome, Safari, Opera */
            }

            .button-group {
                margin: 0;
                flex-wrap: nowrap;
                min-height: unset;

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
