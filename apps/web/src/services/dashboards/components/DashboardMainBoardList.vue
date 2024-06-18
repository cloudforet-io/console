<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PBoard, PFieldTitle, PI, PLabel, PPagination,
} from '@spaceone/design-system';
import type { BoardSet } from '@spaceone/design-system/types/data-display/board/type';

import { QueryHelper } from '@cloudforet/core-lib/query';

import { i18n } from '@/translations';

import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';
import { FAVORITE_TYPE } from '@/common/modules/favorites/favorite-button/type';

import DashboardCloneModal from '@/services/dashboards/components/DashboardCloneModal.vue';
import DashboardDeleteModal from '@/services/dashboards/components/DashboardDeleteModal.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import type { DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';
import type { DashboardScope } from '@/services/dashboards/types/dashboard-view-type';


const PAGE_SIZE = 10;

interface Props {
    scopeType?: DashboardScope;
    fieldTitle?: string;
    dashboardList?: DashboardModel[];
}
const props = withDefaults(defineProps<Props>(), {
    scopeType: undefined,
    fieldTitle: undefined,
    dashboardList: () => ([]),
});
type DashboardBoardSet = BoardSet & DashboardModel;

const router = useRouter();

const { getProperRouteLocation } = useProperRouteLocation();
const allReferenceStore = useAllReferenceStore();
const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
const state = reactive({
    thisPage: 1,
    dashboardTotalCount: computed<number>(() => props.dashboardList.length ?? 0),
    projectItems: computed(() => allReferenceStore.getters.project),
    dashboardListByBoardSets: computed<DashboardBoardSet[]>(() => props.dashboardList
        .slice((state.thisPage - 1) * PAGE_SIZE, state.thisPage * PAGE_SIZE)
        .map((d) => {
            const dashboardWithBoardSet = {
                ...d,
                iconButtonSets: convertBoardItemButtonSet(d),
            };
            if (d.project_id) {
                return (
                    {
                        ...dashboardWithBoardSet,
                        label: state.projectItems[d.project_id]?.label || d.project_id,
                    }
                );
            }
            return dashboardWithBoardSet;
        })),
});

const deleteModalState = reactive({
    visible: false,
    selectedId: undefined as string|undefined,
});

const cloneModalState = reactive({
    visible: false,
    dashboardConfig: {} as Partial<DashboardModel>,
});

const convertBoardItemButtonSet = (dashboardItem: DashboardModel) => {
    const dashboardId = dashboardItem.dashboard_id || '';
    const manageButtonSet = [
        // {
        //     iconName: 'ic_duplicate',
        //     tooltipText: i18n.t('DASHBOARDS.ALL_DASHBOARDS.TOOLTIP_CLONE'),
        //     eventAction: () => {
        //         cloneModalState.dashboardConfig = { ...dashboardItem };
        //         cloneModalState.visible = true;
        //     },
        // },
    ];
    const defaultButtonSet = [
        {
            iconName: 'ic_delete',
            tooltipText: i18n.t('DASHBOARDS.ALL_DASHBOARDS.TOOLTIP_DELETE'),
            eventAction: () => handleClickDeleteDashboard(dashboardId),
        },
    ];
    if (dashboardItem.version === '1.0') return defaultButtonSet;
    return manageButtonSet.concat(defaultButtonSet);
};

/* EVENT */
const handleClickBoardItem = (item: DashboardModel) => {
    router.push(getProperRouteLocation({
        name: DASHBOARDS_ROUTE.DETAIL._NAME,
        params: {
            dashboardId: item.dashboard_id || '',
        },
    }));
};
const handleUpdateCloneModal = (visible: boolean) => {
    if (visible) return;
    cloneModalState.dashboardConfig = {};
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
const handlePage = (page: number) => {
    state.thisPage = page;
};

watch(() => props.dashboardList, () => {
    state.thisPage = 1;
});
</script>

<template>
    <div class="dashboard-board-list">
        <p-field-title v-if="props.fieldTitle"
                       class="p-field-title"
        >
            <template #default>
                <span>{{ props.fieldTitle }}</span>
                <span class="board-count">({{ state.dashboardTotalCount }})</span>
            </template>
        </p-field-title>
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
                            <p-i v-if="scopeType === 'PRIVATE'"
                                 name="ic_lock-filled"
                                 width="0.75rem"
                                 height="0.75rem"
                                 color="gray900"
                                 class="private-icon"
                            />
                            <span v-if="board.tags?.created_by"
                                  class="board-item-title-sub-text"
                            >{{ board.tags?.created_by }}</span>
                            <span v-if="board.tags?.created_by && props.scopeType === 'PROJECT'"
                                  class="board-item-title-sub-text"
                            >•</span>
                            <span class="board-item-title-sub-text">{{ props.scopeType === 'PROJECT' ? board.label : '' }}</span>
                        </div>
                    </div>
                    <div class="labels-wrapper">
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
        <div v-if="state.dashboardTotalCount >= 10"
             class="dashboard-list-pagination"
        >
            <p-pagination :total-count="state.dashboardTotalCount"
                          :page-size="PAGE_SIZE"
                          :this-page="state.thisPage"
                          @change="handlePage"
            />
        </div>
        <dashboard-delete-modal
            :visible.sync="deleteModalState.visible"
            :dashboard-id="deleteModalState.selectedId"
        />
        <dashboard-clone-modal :visible.sync="cloneModalState.visible"
                               :dashboard="cloneModalState.dashboardConfig"
                               @update:visible="handleUpdateCloneModal"
        />
    </div>
</template>

<style lang="postcss" scoped>
.dashboard-board-list {
    @apply w-full flex-grow;
    margin-top: 0.5rem;
    margin-bottom: 1.25rem;

    .p-field-title {
        margin-bottom: 0.5rem;
    }
    .board-count {
        font-weight: normal;
        margin-left: 0.5rem;
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
                row-gap: 0.375rem;
            }
        }
    }
    .dashboard-list-pagination {
        @apply w-full flex justify-center;
        margin-top: 0.5rem;
    }
}
</style>
