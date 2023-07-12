<script lang="ts" setup>
import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import {
    PBoard, PFieldTitle, PI, PLabel, PPagination,
} from '@spaceone/design-system';
import type { BoardSet } from '@spaceone/design-system/types/data-display/board/type';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { MENU_ID } from '@/lib/menu/config';

import DeleteModal from '@/common/components/modals/DeleteModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { useManagePermissionState } from '@/common/composables/page-manage-permission';
import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

import { DASHBOARD_SCOPE, DASHBOARD_VIEWER } from '@/services/dashboards/config';
import type { DashboardScope } from '@/services/dashboards/config';
import type { DashboardModel } from '@/services/dashboards/model';
import { DASHBOARDS_ROUTE } from '@/services/dashboards/route-config';
import DashboardCloneModal from '@/services/dashboards/shared/DashboardCloneModal.vue';

const PAGE_SIZE = 10;
const DOMAIN_SCOPE_KEY = 'domain_dashboard_id';
const PROJECT_SCOPE_KEY = 'project_dashboard_id';
const DOMAIN_SCOPE_NAME = 'Workspace';

interface DashboardBoardListProps {
    scopeType: DashboardScope;
    fieldTitle: string;
    dashboardList: DashboardModel[];
}

const props = withDefaults(defineProps<DashboardBoardListProps>(), {
    scopeType: undefined,
    fieldTitle: undefined,
    dashboardList: () => [],
});
const { t } = useI18n();
const router = useRouter();
const store = useStore();

const state = reactive({
    thisPage: 1,
    dashboardTotalCount: computed<number>(() => props.dashboardList.length ?? 0),
    dashboardScopeKey: computed(() => (props.scopeType === DASHBOARD_SCOPE.DOMAIN ? DOMAIN_SCOPE_KEY : PROJECT_SCOPE_KEY)),
    projectItems: computed(() => store.getters['reference/projectItems']),
    hasManagePermission: computed(() => {
        const routeName = props.scopeType === DASHBOARD_SCOPE.DOMAIN ? MENU_ID.DASHBOARDS_WORKSPACE : MENU_ID.DASHBOARDS_PROJECT;
        return useManagePermissionState(routeName).value;
    }),
    dashboardListByBoardSets: computed<BoardSet[]>(() => props.dashboardList
        .slice((state.thisPage - 1) * PAGE_SIZE, state.thisPage * PAGE_SIZE)
        .map((d) => {
            const dashboardWithBoardSet = {
                ...d,
                iconButtonSets: state.hasManagePermission ? convertBoardItemButtonSet(d) : [],
            };
            const projectId = 'project_id';
            if (d[projectId]) {
                return (
                    {
                        ...dashboardWithBoardSet,
                        groupLabel: state.projectItems[d[projectId]]?.label,
                    }
                );
            }
            return dashboardWithBoardSet;
        })),
});

const deleteModalState = reactive({
    headerTitle: t('DASHBOARDS.FORM.DELETE_TITLE'),
    visible: false,
    loading: false,
    selectedId: undefined as string|undefined,
});

const cloneModalState = reactive({
    visible: false,
    dashboardConfig: {} as Partial<DashboardModel>,
});

const convertBoardItemButtonSet = (dashboardItem: DashboardModel) => [
    {
        iconName: 'ic_edit',
        tooltipText: t('DASHBOARDS.ALL_DASHBOARDS.TOOLTIP_EDIT'),
        eventAction: () => {
            const routeName = props.scopeType ? DASHBOARDS_ROUTE.PROJECT.CUSTOMIZE._NAME : DASHBOARDS_ROUTE.WORKSPACE.CUSTOMIZE._NAME;
            router.push({
                name: routeName,
                params: {
                    dashboardId: dashboardItem[state.dashboardScopeKey],
                },
            });
        },
    },
    {
        iconName: 'ic_duplicate',
        tooltipText: t('DASHBOARDS.ALL_DASHBOARDS.TOOLTIP_CLONE'),
        eventAction: () => {
            cloneModalState.dashboardConfig = { ...dashboardItem };
            cloneModalState.visible = true;
        },
    },
    {
        iconName: 'ic_delete',
        tooltipText: t('DASHBOARDS.ALL_DASHBOARDS.TOOLTIP_DELETE'),
        /* TODO: Implementation */
        eventAction: () => handleClickDeleteDashboard(dashboardItem[state.dashboardScopeKey]),
    },
];

/* EVENT */
const handleClickBoardItem = (item: DashboardModel) => {
    const routeName = props.scopeType === DASHBOARD_SCOPE.PROJECT ? DASHBOARDS_ROUTE.PROJECT.DETAIL._NAME : DASHBOARDS_ROUTE.WORKSPACE.DETAIL._NAME;
    router.push({
        name: routeName,
        params: {
            dashboardId: item[state.dashboardScopeKey],
        },
    });
};
const handleUpdateCloneModal = (visible: boolean) => {
    if (visible) return;
    cloneModalState.dashboardConfig = {};
};

const handleClickDeleteDashboard = (dashboardId) => {
    deleteModalState.selectedId = dashboardId;
    deleteModalState.visible = true;
};

const handleDeleteDashboardConfirm = async () => {
    try {
        deleteModalState.loading = true;
        if (props.scopeType === 'domain') {
            await SpaceConnector.clientV2.dashboard.domainDashboard.delete({
                domain_dashboard_id: deleteModalState.selectedId,
            });
            await store.dispatch('dashboard/loadDomainDashboard');
        } else {
            await SpaceConnector.clientV2.dashboard.projectDashboard.delete({
                project_dashboard_id: deleteModalState.selectedId,
            });
            await store.dispatch('dashboard/loadProjectDashboard');
        }
        showSuccessMessage(t('DASHBOARDS.FORM.ALT_S_DELETE_DASHBOARD'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('DASHBOARDS.FORM.ALT_E_DELETE_DASHBOARD'));
    } finally {
        deleteModalState.loading = false;
        deleteModalState.visible = false;
        deleteModalState.selectedId = undefined;
    }
};

const labelQueryHelper = new QueryHelper();
const handleSetQuery = (selectedLabel: string | string[]) => {
    labelQueryHelper.setFilters(store.state.dashboard.searchFilters)
        .addFilter({ k: 'label', o: '=', v: selectedLabel });
    store.dispatch('dashboard/setSearchFilters', labelQueryHelper.filters);
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
        <p-field-title class="p-field-title">
            <template #default>
                <span>{{ fieldTitle }}</span>
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
                        <favorite-button :item-id="board[state.dashboardScopeKey]"
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
                        <p-i name="ic_dot"
                             width="0.125rem"
                             height="0.125rem"
                        />
                    </template>
                    <span v-if="scopeType === DASHBOARD_SCOPE.DOMAIN">{{ DOMAIN_SCOPE_NAME }}</span>
                    <span v-else>{{ board.groupLabel }}</span>
                </div>
                <div class="label-wrapper">
                    <p-label :class="{'item-label': true, 'viewers-label': true, 'private-label': board.viewers === DASHBOARD_VIEWER.PRIVATE}"
                             :text="board.viewers === DASHBOARD_VIEWER.PUBLIC ? t('DASHBOARDS.ALL_DASHBOARDS.LABEL_PUBLIC') : t('DASHBOARDS.ALL_DASHBOARDS.LABEL_PRIVATE')"
                             :left-icon="board.viewers === DASHBOARD_VIEWER.PUBLIC ? 'ic_globe-filled' : 'ic_lock-filled'"
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
        <delete-modal v-model:visible="deleteModalState.visible"
                      :header-title="deleteModalState.headerTitle"
                      :loading="deleteModalState.loading"
                      @confirm="handleDeleteDashboardConfirm"
        />
        <dashboard-clone-modal v-model:visible="cloneModalState.visible"
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
