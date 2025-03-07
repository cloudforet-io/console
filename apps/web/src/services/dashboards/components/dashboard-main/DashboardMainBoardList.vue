<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';
import type { TranslateResult } from 'vue-i18n';
import { useRouter } from 'vue-router/composables';

import {
    PBadge, PBoard, PI, PLabel,
} from '@cloudforet/mirinae';
import type { BoardSet } from '@cloudforet/mirinae/types/data-display/board/type';


import type { DashboardModel } from '@/api-clients/dashboard/_types/dashboard-type';
import type { PrivateDashboardModel } from '@/api-clients/dashboard/private-dashboard/schema/model';
import type { PublicDashboardModel } from '@/api-clients/dashboard/public-dashboard/schema/model';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import DashboardDeleteModal from '@/services/dashboards/components/DashboardDeleteModal.vue';
import { ADMIN_DASHBOARDS_ROUTE } from '@/services/dashboards/routes/admin/route-constant';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';


interface Props {
    isCollapsed?: boolean;
    fieldTitle?: TranslateResult;
    dashboardList?: Array<PublicDashboardModel|PrivateDashboardModel>;
}
const props = withDefaults(defineProps<Props>(), {
    isCollapsed: false,
    fieldTitle: undefined,
    dashboardList: () => ([]),
});
type DashboardBoardSet = BoardSet & DashboardModel;

const router = useRouter();

const appContextStore = useAppContextStore();
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    isCollapsed: false,
    dashboardTotalCount: computed<number>(() => props.dashboardList.length ?? 0),
    dashboardListByBoardSets: computed<DashboardBoardSet[]>(() => props.dashboardList
        .map((d) => ({
            ...d,
            iconButtonSets: convertBoardItemButtonSet(d),
        }))),
});

const deleteModalState = reactive({
    visible: false,
    selectedId: undefined as string|undefined,
});

/* Util */
const convertBoardItemButtonSet = (dashboardItem: DashboardModel) => {
    if (!storeState.isAdminMode && dashboardItem.resource_group === 'DOMAIN') return [];
    const dashboardId = dashboardItem.dashboard_id || '';
    return [
        {
            iconName: 'ic_delete',
            tooltipText: i18n.t('DASHBOARDS.ALL_DASHBOARDS.TOOLTIP_DELETE'),
            eventAction: () => handleClickDeleteDashboard(dashboardId),
        },
    ];
};
const showBadge = (board: DashboardModel): boolean => {
    if (board.version === '1.0') return true;
    if (board.shared) {
        if (board.scope === 'PROJECT') return false; // HACK: temp code for legacy project dashboard
        return true;
    }
    return false;
};
const getBadgeStyleType = (board: DashboardModel): string|undefined => {
    if (board.shared) {
        if (board.scope === 'PROJECT') return 'primary3';
        return 'indigo100';
    }
    if (board.version === '1.0') return 'red100';
    return undefined;
};
const getBadgeText = (board: DashboardModel): TranslateResult|undefined => {
    if (board.version === '1.0') return i18n.t('DASHBOARDS.ALL_DASHBOARDS.DEPRECATED');
    if (board.user_id) return i18n.t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE');
    if (board.shared) {
        if (storeState.isAdminMode) {
            if (board.scope === 'PROJECT') return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_ALL_PROJECTS');
            return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_WORKSPACES');
        }
        if (board.scope === 'PROJECT') return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_ALL_PROJECTS');
        return i18n.t('DASHBOARDS.DETAIL.SHARED_BY_ADMIN');
    }
    return undefined;
};
const isPrivate = (dashboardId: string): boolean => dashboardId.startsWith('private');

/* EVENT */
const handleClickBoardItem = (item: DashboardModel) => {
    const dashboardDetailRouteName = storeState.isAdminMode
        ? ADMIN_DASHBOARDS_ROUTE.DETAIL._NAME
        : DASHBOARDS_ROUTE.DETAIL._NAME;
    router.push({
        name: dashboardDetailRouteName,
        params: {
            dashboardId: item.dashboard_id || '',
        },
    });
};

const handleClickDeleteDashboard = (dashboardId: string) => {
    deleteModalState.selectedId = dashboardId;
    deleteModalState.visible = true;
};

onMounted(() => {
    if (props.isCollapsed) state.isCollapsed = true;
});
</script>

<template>
    <div class="dashboard-board-list"
         :class="{ 'is-collapsed': state.isCollapsed }"
    >
        <div v-if="props.fieldTitle"
             class="title-wrapper"
             @click="state.isCollapsed = !state.isCollapsed"
        >
            <p-i name="ic_chevron-down"
                 width="1.25rem"
                 height="1.25rem"
                 color="inherit transparent"
                 class="arrow-button"
            />
            <span>{{ props.fieldTitle }}</span>
            <span class="board-count">({{ state.dashboardTotalCount }})</span>
        </div>
        <p-board :board-sets="state.dashboardListByBoardSets"
                 selectable
                 class="board"
                 @item-click="handleClickBoardItem"
        >
            <template #item-content="{board}">
                <div class="content-wrapper">
                    <div class="board-item-title-wrapper">
                        <div class="left-part">
                            <favorite-button :item-id="board.dashboard_id"
                                             :favorite-type="FAVORITE_TYPE.DASHBOARD"
                                             scale="0.8"
                                             class="favorite-button"
                            />
                            <span class="board-item-title">
                                {{ board.name }}
                            </span>
                        </div>
                        <div class="right-part">
                            <span v-if="board.tags?.created_by"
                                  class="board-item-title-sub-text"
                            >{{ board.tags?.created_by }}</span>
                        </div>
                    </div>
                    <div class="labels-wrapper">
                        <p-badge v-if="showBadge(board)"
                                 badge-type="subtle"
                                 :style-type="getBadgeStyleType(board)"
                        >
                            {{ getBadgeText(board) }}
                        </p-badge>
                        <p-badge v-if="isPrivate(board.dashboard_id)"
                                 badge-type="subtle"
                                 style-type="gray150"
                        >
                            <p-i name="ic_lock-filled"
                                 width="0.75rem"
                                 height="0.75rem"
                                 color="gray900"
                                 class="mr-1"
                            />
                            {{ $t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE') }}
                        </p-badge>
                        <p-label v-for="(label, idx) in board.labels"
                                 :key="`${board.name}-label-${idx}`"
                                 :text="label"
                        />
                    </div>
                </div>
            </template>
        </p-board>
        <dashboard-delete-modal
            :visible.sync="deleteModalState.visible"
            :dashboard-id="deleteModalState.selectedId"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-board-list {
    @apply w-full flex-grow;
    margin-top: 0.5rem;
    margin-bottom: 1.25rem;

    .title-wrapper {
        @apply text-label-lg rounded-md;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: 0.25rem;
        padding: 0.25rem 0.75rem 0.25rem 0.25rem;
        .arrow-button {
            transition: transform 0.3s ease-in-out;
        }
    }
    .board {
        /* custom p-board-item */
        &:deep(.p-board-item) {
            .content-area {
                overflow: unset;
                .right-overlay-wrapper {
                    top: calc(50% - 1rem);
                }
            }
        }

        .content-wrapper {
            @apply flex flex-col gap-2;
            .board-item-title-wrapper {
                @apply flex w-full items-center;
                gap: 0.375rem;
                .left-part, .right-part {
                    @apply flex items-center;
                    gap: 0.375rem;
                }
                .board-item-title {
                    @apply text-label-md text-gray-900;
                }
                .board-item-title-sub-text {
                    @apply text-label-sm text-gray-500;
                }
            }

            @screen tablet {
                .board-item-title-wrapper {
                    display: block;
                    .right-part {
                        @apply text-gray-500 flex items-center;
                        gap: 0.25rem;
                        padding-top: 0.25rem;
                    }
                }
            }

            .labels-wrapper {
                @apply flex items-center flex-wrap;
                gap: 0.25rem;
            }
        }
    }
    &.is-collapsed {
        .title-wrapper {
            .arrow-button {
                transform: rotate(-90deg);
            }
        }
        .board {
            display: none;
            height: 0;
            margin: 0;
            padding: 0;
            opacity: 0;
            transition: opacity 0s ease;
        }
    }
}
</style>
