<script lang="ts" setup>
import { computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import { QueryHelper } from '@cloudforet/core-lib/query';
import {
    PBadge, PBoard, PI, PLabel,
} from '@cloudforet/mirinae';
import type { BoardSet } from '@cloudforet/mirinae/types/data-display/board/type';


import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import DashboardDeleteModal from '@/services/dashboards/components/DashboardDeleteModal.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import type { DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';


interface Props {
    dashboardType?: 'SHARED' | 'PRIVATE' | 'DEPRECATED';
    fieldTitle?: string;
    dashboardList?: DashboardModel[];
}
const props = withDefaults(defineProps<Props>(), {
    dashboardType: 'SHARED',
    fieldTitle: undefined,
    dashboardList: () => ([]),
});
type DashboardBoardSet = BoardSet & DashboardModel;

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();
const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
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
    badgeStyleType: computed(() => {
        if (props.dashboardType === 'SHARED') return 'indigo100';
        if (props.dashboardType === 'PRIVATE') return 'gray150';
        return 'red100';
    }),
    badgeText: computed(() => {
        if (props.dashboardType === 'SHARED') {
            if (storeState.isAdminMode) return i18n.t('DASHBOARDS.DETAIL.SHARED_TO_WORKSPACES');
            return i18n.t('DASHBOARDS.DETAIL.SHARED_BY_ADMIN');
        }
        if (props.dashboardType === 'PRIVATE') return i18n.t('DASHBOARDS.ALL_DASHBOARDS.PRIVATE');
        return i18n.t('DASHBOARDS.ALL_DASHBOARDS.DEPRECATED');
    }),
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
    if (props.dashboardType === 'PRIVATE' || props.dashboardType === 'DEPRECATED') return true;
    if (board?.workspace_id === '*') return true;
    return false;
};
const isPrivate = (dashboardId: string): boolean => dashboardId.startsWith('private');

/* EVENT */
const handleClickBoardItem = (item: DashboardModel) => {
    router.push(getProperRouteLocation({
        name: DASHBOARDS_ROUTE.DETAIL._NAME,
        params: {
            dashboardId: item.dashboard_id || '',
        },
    }));
};

const handleClickDeleteDashboard = (dashboardId: string) => {
    deleteModalState.selectedId = dashboardId;
    deleteModalState.visible = true;
};

const labelQueryHelper = new QueryHelper();
const handleSetQuery = (selectedLabel: string | string[]) => {
    labelQueryHelper.setFilters(dashboardState.searchFilters)
        .addFilter({ k: 'labels', o: '=', v: selectedLabel });
    dashboardStore.setSearchFilters(labelQueryHelper.filters);
};

onMounted(() => {
    if (props.dashboardType === 'DEPRECATED') state.isCollapsed = true;
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
                                 :style-type="state.badgeStyleType"
                        >
                            <p-i v-if="props.dashboardType === 'PRIVATE'"
                                 name="ic_lock-filled"
                                 width="0.75rem"
                                 height="0.75rem"
                                 color="gray900"
                                 class="mr-1"
                            />
                            {{ state.badgeText }}
                        </p-badge>
                        <p-badge v-if="props.dashboardType === 'DEPRECATED' && isPrivate(board.dashboard_id)"
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
                                 clickable
                                 @item-click="handleSetQuery(label)"
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
        @apply text-label-md;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-weight: bold;
        cursor: pointer;
        margin-bottom: 0.5rem;
        .arrow-button {
            transition: transform 0.3s ease-in-out;
        }
        .board-count {
            font-weight: normal;
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
                gap: 0.375rem;
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
