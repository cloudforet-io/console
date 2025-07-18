<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { partition, sortBy } from 'lodash';

import {
    PFieldTitle, PButton, PButtonTab, PIconButton, PEmpty, PDataLoader,
} from '@cloudforet/mirinae';

import type { WorkspaceModel } from '@/api-clients/identity/workspace/schema/model';
import { i18n } from '@/translations';

import { useUserStore } from '@/store/user/user-store';

import { useFavoriteStore } from '@/common/modules/favorites/favorite-button/store/favorite-store';
import type { FavoriteItem } from '@/common/modules/favorites/favorite-button/type';

import { gray } from '@/styles/colors';

import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';
import LandingWorkspaceBoard from '@/services/landing/components/workspace-landing/landing-group-workspaces/LandingWorkspaceBoard.vue';
import LandingWorkspaceGroupManageOverlay from '@/services/landing/components/workspace-landing/landing-group-workspaces/LandingWorkspaceGroupManageOverlay.vue';
import LandingEmptyContents from '@/services/landing/components/workspace-landing/LandingEmptyContents.vue';
import { useUserProfileGetWorkspaceGroupsQuery } from '@/services/landing/composables/use-user-profile-get-workspace-groups-query';
import { useUserProfileGetWorkspacesQuery } from '@/services/landing/composables/use-user-profile-get-workspaces-query';
import { BOARD_TYPE } from '@/services/landing/constants/landing-constants';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';
import type { WorkspaceBoardSet } from '@/services/landing/type/type';


const PAGE_SIZE = 16;

const props = defineProps<{
    hasReadWriteAccess?: boolean;
}>();
const emit = defineEmits<{(e: 'create'): void}>();

const router = useRouter();

const landingPageStore = useLandingPageStore();
const landingPageState = landingPageStore.state;
const userStore = useUserStore();
const favoriteStore = useFavoriteStore();
const favoriteGetters = favoriteStore.getters;

const storeState = reactive({
    isDomainAdmin: computed<boolean>(() => userStore.getters.isDomainAdmin),
    favoriteList: computed<FavoriteItem[]>(() => sortBy(favoriteGetters.workspaceItems as FavoriteItem[], 'label')),
});
const state = reactive({
    isShowAll: false,
    selectedGroupWorkspaceList: computed<WorkspaceModel[]>(() => {
        if (landingPageState.selectedWorkspaceGroupId === 'all') {
            return workspaceList.value || [];
        }
        return workspaceListByGroup.value || [];
    }),
    workspaceBoardSets: computed<WorkspaceBoardSet[]>(() => {
        const favoriteOrderList = sortBy(state.selectedGroupWorkspaceList, (workspaceItem) => {
            const correspondingAItem = storeState.favoriteList?.find((favoriteItem) => favoriteItem?.itemId === workspaceItem.workspace_id);
            return correspondingAItem ? storeState.favoriteList?.indexOf(correspondingAItem) : Infinity;
        });
        const [active, dormant] = partition(favoriteOrderList, (item) => !item.is_dormant);

        const orderedList = [...active, ...dormant];
        const slicedList = state.isShowAll ? orderedList : orderedList.slice(0, PAGE_SIZE);
        return slicedList.map((d) => ({
            ...d,
            rounded: true,
        }));
    }),
    workspaceFilterList: computed(() => [
        { label: i18n.t('LADING.ALL_WORKSPACE'), name: 'all' },
        ...workspaceGroupList.value?.map((group) => ({ label: group.name, name: group.workspace_group_id })) || [],
    ]),
    isAllWorkspaceTab: computed(() => landingPageState.selectedWorkspaceGroupId === 'all'),
    isOverlayOpen: false,
    isButtonGroupOpened: false,
    isShowAllVisible: computed(() => {
        if (landingPageState.selectedWorkspaceGroupId === 'all') {
            return workspaceListTotalCount.value > PAGE_SIZE && state.workspaceBoardSets.length < workspaceListTotalCount.value;
        }
        return state.selectedGroupWorkspaceList.length > PAGE_SIZE && state.workspaceBoardSets.length < state.selectedGroupWorkspaceList.length;
    }),
});
const isLoading = computed<boolean>(() => isWorkspaceListLoading.value || isWorkspaceListByGroupLoading.value);
const showEmptyContents = computed<boolean>(() => {
    if (isLoading.value) return false;
    if (landingPageState.selectedWorkspaceGroupId !== 'all') return false;
    return true;
});

/* Query */
const { data: workspaceList, totalCount: workspaceListTotalCount, isLoading: isWorkspaceListLoading } = useUserProfileGetWorkspacesQuery();
const { data: workspaceListByGroup, totalCount: workspaceListByGroupTotalCount, isLoading: isWorkspaceListByGroupLoading } = useUserProfileGetWorkspacesQuery(computed(() => {
    if (landingPageState.selectedWorkspaceGroupId === 'all' || !landingPageState.selectedWorkspaceGroupId) {
        return undefined;
    }
    return {
        workspace_group_id: landingPageState.selectedWorkspaceGroupId,
    };
}));
const { data: workspaceGroupList } = useUserProfileGetWorkspaceGroupsQuery();

/* Event Handler */
const handleClickShowAll = () => {
    state.isShowAll = true;
};
const handleClickButtonGroupToggle = () => {
    state.isButtonGroupOpened = !state.isButtonGroupOpened;
};
const handleOpenOverlay = () => {
    state.isOverlayOpen = true;
};
const handleChangeWorkspaceGroup = (selected: string) => {
    landingPageStore.setSelectedWorkspaceGroupId(selected);
};
</script>

<template>
    <div class="landing-group-workspaces">
        <div class="workspace-group-filter-container"
             :class="{ 'is-opened': state.isButtonGroupOpened }"
        >
            <p-button-tab :active-tab="landingPageState.selectedWorkspaceGroupId"
                          :tabs="state.workspaceFilterList"
                          keep-alive-all
                          @change="handleChangeWorkspaceGroup"
            >
                <template #additional-button>
                    <p-icon-button v-if="props.hasReadWriteAccess && storeState.isDomainAdmin"
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
                    <span class="cnt">({{ state.isAllWorkspaceTab ? workspaceListTotalCount : workspaceListByGroupTotalCount }})</span>
                </template>
            </p-field-title>
            <div class="right-part-wrapper">
                <p-button v-if="landingPageState.selectedWorkspaceGroupId !== 'all'"
                          style-type="tertiary"
                          size="md"
                          icon-left="ic_settings"
                          @click="handleOpenOverlay"
                >
                    {{ $t('LADING.SETTINGS') }}
                </p-button>
                <p-button v-if="props.hasReadWriteAccess && storeState.isDomainAdmin"
                          style-type="primary"
                          size="md"
                          icon-left="ic_plus_bold"
                          @click="emit('create')"
                >
                    {{ $t('LADING.CREATE') }}
                </p-button>
            </div>
        </div>
        <p-data-loader :loading="isLoading"
                       :data="state.workspaceBoardSets"
                       :loader-backdrop-color="gray[100]"
        >
            <div>
                <landing-workspace-board :board-sets="state.workspaceBoardSets"
                                         :board-type="BOARD_TYPE.ALL_WORKSPACE"
                                         :is-domain-admin="storeState.isDomainAdmin"
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
                </div>
            </div>
            <template #no-data>
                <landing-empty-contents v-if="showEmptyContents"
                                        :is-domain-admin="storeState.isDomainAdmin"
                />
                <p-empty v-else
                         show-image
                         image-size="sm"
                >
                    {{ $t('LADING.NO_WORKSPACE') }}
                </p-empty>
            </template>
        </p-data-loader>
        <landing-workspace-group-manage-overlay :is-overlay-open.sync="state.isOverlayOpen" />
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
