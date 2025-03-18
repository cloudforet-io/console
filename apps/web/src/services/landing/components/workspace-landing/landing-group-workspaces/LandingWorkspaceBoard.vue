<script setup lang="ts">
import { reactive, computed } from 'vue';
import type { Location } from 'vue-router';
import { useRouter } from 'vue-router/composables';

import dayjs from 'dayjs';

import {
    PBoard, PI, PPopover, PStatus, PLink,
} from '@cloudforet/mirinae';

import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleType } from '@/api-clients/identity/role/type';
import WorkspaceMemberImage from '@/assets/images/role/img_avatar_workspace-member.png';
import WorkspaceOwnerImage from '@/assets/images/role/img_avatar_workspace-owner.png';

import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';
import WorkspaceLogoIcon from '@/common/modules/navigations/top-bar/modules/top-bar-header/WorkspaceLogoIcon.vue';

import { gray } from '@/styles/colors';

import { workspaceStateFormatter } from '@/services/advanced/composables/refined-table-data';
import { WORKSPACE_STATE } from '@/services/advanced/constants/workspace-constant';
import { ADMIN_ADVANCED_ROUTE } from '@/services/advanced/routes/admin/route-constant';
import { BOARD_TYPE } from '@/services/landing/constants/landing-constants';
import { useLandingPageStore } from '@/services/landing/store/landing-page-store';
import type { WorkspaceBoardSet, BoardType } from '@/services/landing/type/type';
import { WORKSPACE_HOME_ROUTE } from '@/services/workspace-home/routes/route-constant';

interface Props {
    boardSets: WorkspaceBoardSet[],
    boardType?: BoardType,
    isDomainAdmin?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
    boardSets: () => ([]),
    boardType: undefined,
    isDomainAdmin: undefined,
});

const landingPageStore = useLandingPageStore();
const userWorkspaceStore = useUserWorkspaceStore();

const router = useRouter();


const state = reactive({
    popoverVisible: false,
    selectedPopoverItem: '',
    redirectLocation: computed<Location|undefined>(() => {
        if (!landingPageStore.state.redirectPath) return undefined;
        const resolvedRoute = router.resolve(landingPageStore.state.redirectPath).resolved;
        return {
            name: resolvedRoute.name as string,
            params: resolvedRoute.params,
            query: resolvedRoute.query,
        };
    }),
});

const roleTypeImageFormatter = (roleType: RoleType): string => {
    switch (roleType) {
    case ROLE_TYPE.WORKSPACE_OWNER:
        return WorkspaceOwnerImage;
    case ROLE_TYPE.WORKSPACE_MEMBER:
        return WorkspaceMemberImage;
    default:
        return '';
    }
};

const handleClickBoardItem = (item: WorkspaceBoardSet) => {
    if (item.is_dormant) {
        state.popoverVisible = true;
        state.selectedPopoverItem = item.workspace_id;
        return;
    }
    landingPageStore.setLoading(true);
    userWorkspaceStore.setCurrentWorkspace(item.workspace_id);
    if (state.redirectLocation) {
        router.replace({
            ...state.redirectLocation,
            params: { ...state.redirectLocation.params, workspaceId: item.workspace_id },
        });
    } else {
        router.replace({ name: WORKSPACE_HOME_ROUTE._NAME, params: { workspaceId: item.workspace_id } });
    }
};
</script>

<template>
    <p-board :board-sets="props.boardSets"
             selectable
             style-type="cards"
             class="landing-workspace-board"
             @item-click="handleClickBoardItem"
    >
        <template #item-content="{board}">
            <div class="workspace-board-item-wrapper"
                 :class="{'is-dormant': board.is_dormant}"
            >
                <workspace-logo-icon :text="board?.name || ''"
                                     :theme="board?.tags?.theme"
                                     :size="props.boardType === BOARD_TYPE.ALL_WORKSPACE ? 'sm' : 'md'"
                />
                <div class="text-wrapper">
                    <p class="workspace-name">
                        <span class="name">{{ board?.name }}</span>
                        <template v-if="board.is_dormant">
                            <p-popover v-if="state.selectedPopoverItem === board.workspace_id"
                                       ignore-outside-click
                                       trigger="click"
                                       position="top"
                                       boundary="body"
                                       class="dormant-popover"
                            >
                                <p-status v-bind="workspaceStateFormatter(WORKSPACE_STATE.DORMANT)"
                                          class="capitalize"
                                />
                                <template #content>
                                    <div class="popover-content">
                                        <strong class="title">{{ $t('LADING.DORMANT_WORKSPACE') }}</strong>
                                        <img alt="cost-threshold-chart"
                                             src="/images/domain-settings/img_auto-dormancy-configuration_cost-threshold-chart.png"
                                             srcset="/images/domain-settings/img_auto-dormancy-configuration_cost-threshold-chart@2x.png 2x,
                                            /images/domain-settings/img_auto-dormancy-configuration_cost-threshold-chart@3x.png 3x"
                                             class="cost-threshold-chart"
                                        >
                                        <i18n :path="props.isDomainAdmin ? 'LADING.DORMANT_WORKSPACE_POPOVER_ADMIN' : 'LADING.DORMANT_WORKSPACE_POPOVER'"
                                              tag="span"
                                              class="desc"
                                        >
                                            <template #date>
                                                <span class="date">{{ dayjs(board?.dormant_updated_at).format('YYYY-MM-DD') }}</span>
                                            </template>
                                            <template v-if="props.isDomainAdmin"
                                                      #name
                                            >
                                                <span>{{ board.name }}</span>
                                            </template>
                                        </i18n>
                                        <p-link :text="$t('LADING.GO_TO_DORMANT_CONFIG')"
                                                highlight
                                                :to="{
                                                    name: ADMIN_ADVANCED_ROUTE.AUTO_DORMANCY_CONFIGURATION._NAME
                                                }"
                                        />
                                    </div>
                                </template>
                            </p-popover>
                            <p-status v-else
                                      v-bind="workspaceStateFormatter(WORKSPACE_STATE.DORMANT)"
                                      class="capitalize"
                            />
                        </template>
                    </p>
                    <div v-if="board?.role_type"
                         class="workspace-info"
                    >
                        <img :src="roleTypeImageFormatter(board?.role_type)"
                             alt="role-type-icon"
                             class="role-type-icon"
                        >
                        <p class="role-type">
                            {{ board?.role_name }}
                        </p>
                    </div>
                </div>
                <div class="toolset-wrapper">
                    <favorite-button :item-id="board?.workspace_id"
                                     :favorite-type="FAVORITE_TYPE.WORKSPACE"
                                     scale="0.8"
                                     class="favorite-button"
                    />
                    <p-i name="ic_chevron-right-thin"
                         width="1.5rem"
                         height="1.5rem"
                         :color="gray[900]"
                    />
                </div>
            </div>
        </template>
    </p-board>
</template>

<style scoped lang="postcss">
.landing-workspace-board {
    @apply grid grid-cols-2 gap-2;
    .workspace-board-item-wrapper {
        @apply flex items-center;
        width: 100%;
        max-width: 19.875rem;
        gap: 0.75rem;
        .text-wrapper {
            @apply flex flex-col text-label-md truncate;
            flex: 1;
            gap: 0.125rem;
            .workspace-info {
                @apply flex items-center;
                gap: 0.25rem;
                .role-type-icon {
                    @apply rounded-full;
                    width: 1rem;
                    height: 1rem;
                }
                .role-type {
                    @apply text-label-sm text-gray-700 truncate;
                    width: 100%;
                }
            }
            .workspace-name {
                @apply truncate;
                width: 100%;
            }
            .dormant-popover {
                .popover-content {
                    @apply flex flex-col;
                    gap: 0.5rem;
                    width: 13rem;
                    .title {
                        @apply text-coral-500;
                    }
                    .desc {
                        @apply block text-paragraph-md text-gray-500;
                        white-space: pre-line;
                        max-width: 13rem;
                        .date {
                            @apply text-gray-900;
                        }
                    }
                }
            }

            /* custom design-system component - p-popover */
            :deep(.p-popover) {
                .visible {
                    z-index: 1000;
                }
            }
        }
        .toolset-wrapper {
            @apply flex items-center;
            margin-left: auto;
            gap: 0.375rem;
            :deep(.favorite-btn) {
                &:not(.active) {
                    @apply hidden;
                }
            }
        }

        &.is-dormant {
            .workspace-name {
                @apply flex;
                .name {
                    @apply truncate block;
                    width: 9.5rem;
                }
            }
        }
        &:not(.is-dormant) {
            &:hover {
                .toolset-wrapper {
                    :deep(.favorite-btn) {
                        &:not(.active) {
                            @apply block;
                        }
                    }
                }
            }
        }
    }

    /* custom design-system component - p-board-item */
    :deep(.p-board-item) {
        padding: 0.75rem 1rem;
        width: 22rem;
        min-height: 4.25rem;

        @screen mobile {
            width: 19.5rem;
        }
    }

    @screen mobile {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
}
</style>
