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

import type { DashboardScope } from '@/schema/dashboard/_types/dashboard-type';
import type { DashboardModel } from '@/schema/dashboard/dashboard/model';
import { store } from '@/store';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useDashboardStore } from '@/store/dashboard/dashboard-store';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import DashboardCloneModal from '@/services/dashboards/components/DashboardCloneModal.vue';
import DashboardDeleteModal from '@/services/dashboards/components/DashboardDeleteModal.vue';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';


const PAGE_SIZE = 10;
const DOMAIN_SCOPE_NAME = 'Workspace';

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

const appContextStore = useAppContextStore();
const dashboardStore = useDashboardStore();
const dashboardState = dashboardStore.state;
const storeState = reactive({
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});
const state = reactive({
    thisPage: 1,
    dashboardTotalCount: computed<number>(() => props.dashboardList.length ?? 0),
    projectItems: computed(() => store.getters['reference/projectItems']),
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

const convertBoardItemButtonSet = (dashboardItem: DashboardModel) => [
    {
        iconName: 'ic_edit',
        tooltipText: i18n.t('DASHBOARDS.ALL_DASHBOARDS.TOOLTIP_EDIT'),
        eventAction: () => {
            router.push({
                name: DASHBOARDS_ROUTE.CUSTOMIZE._NAME,
                params: {
                    dashboardId: dashboardItem.dashboard_id,
                },
            });
        },
    },
    {
        iconName: 'ic_duplicate',
        tooltipText: i18n.t('DASHBOARDS.ALL_DASHBOARDS.TOOLTIP_CLONE'),
        eventAction: () => {
            cloneModalState.dashboardConfig = { ...dashboardItem };
            cloneModalState.visible = true;
        },
    },
    {
        iconName: 'ic_delete',
        tooltipText: i18n.t('DASHBOARDS.ALL_DASHBOARDS.TOOLTIP_DELETE'),
        eventAction: () => handleClickDeleteDashboard(dashboardItem.dashboard_id),
    },
];

/* EVENT */
const handleClickBoardItem = (item: DashboardModel) => {
    router.push({
        name: DASHBOARDS_ROUTE.DETAIL._NAME,
        params: {
            dashboardId: item.dashboard_id,
        },
    });
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
        .addFilter({ k: 'label', o: '=', v: selectedLabel });
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
                <div class="board-item-title-wrapper">
                    <div class="favorite-button-wrapper">
                        <favorite-button :item-id="board.dashboard_id"
                                         :favorite-type="FAVORITE_TYPE.DASHBOARD"
                                         scale="0.666"
                        />
                    </div>
                    <p class="board-item-title">
                        {{ board.name }}
                    </p>
                </div>
                <div class="board-item-description">
                    <template v-if="board.tags.created_by">
                        <span>{{ board.tags.created_by }}</span>
                    </template>
                    <template v-if="!storeState.isAdminMode">
                        <p-i name="ic_dot"
                             width="0.125rem"
                             height="0.125rem"
                        />
                        <span v-if="props.scopeType === 'WORKSPACE'">{{ DOMAIN_SCOPE_NAME }}</span>
                        <span v-else>{{ board.label }}</span>
                    </template>
                </div>
                <div class="label-wrapper">
                    <p-label v-if="!storeState.isAdminMode"
                             :class="{'item-label': true, 'viewers-label': true, 'private-label': board.dashboard_type === 'PRIVATE'}"
                             :text="board.dashboard_type === 'PUBLIC' ? $t('DASHBOARDS.ALL_DASHBOARDS.LABEL_PUBLIC') : $t('DASHBOARDS.ALL_DASHBOARDS.LABEL_PRIVATE')"
                             :left-icon="board.dashboard_type === 'PUBLIC' ? 'ic_globe-filled' : 'ic_lock-filled'"
                    />
                    <p-label v-for="(label, idx) in board.labels"
                             :key="`${board.name}-label-${idx}`"
                             class="item-label"
                             :text="label"
                             clickable
                             @item-click="handleSetQuery(label)"
                    />
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

    .p-field-title {
        margin-bottom: 0.5rem;
    }
    .board-count {
        font-weight: normal;
        margin-left: 0.5rem;
    }
    .board {
        .board-item-title-wrapper {
            @apply flex w-full;
            min-height: 1.25rem;
            .favorite-button-wrapper {
                @apply flex items-center justify-center;
                width: 1.25rem;
                height: 1.25rem;
            }
            .board-item-title {
                @apply flex-grow w-full;
                margin-left: 0.125rem;
                font-size: 1rem;
                font-weight: bold;
                line-height: 1.25;
                word-break: break-all;
            }
        }
        .board-item-description {
            @apply flex items-center flex-wrap;
            gap: 0.5rem;
            font-size: 0.75rem;
            line-height: 1.25;
            color: gray;
            margin: 0.25rem 0 0.75rem;
        }

        .label-wrapper {
            @apply flex items-center flex-wrap;
            row-gap: 0.375rem;
        }

        .item-label {
            &.viewers-label {
                @apply border-0 bg-violet-200;
            }
            &.private-label {
                @apply bg-gray-200;
            }
        }
    }
    .dashboard-list-pagination {
        @apply w-full flex justify-center;
        margin-top: 0.5rem;
    }
}
</style>
