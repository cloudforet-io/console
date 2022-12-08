<template>
    <div class="dashboard-board-list">
        <p-field-title class="p-field-title">
            <template>
                <span>{{ fieldTitle }}</span>
                <span class="board-count">({{ dashboardList.length }})</span>
            </template>
        </p-field-title>
        <p-board :board-sets="dashboardListByBoardSets"
                 class="board"
        >
            <template #item-content="{board}">
                <div class="board-item-title-wrapper">
                    <div class="favorite-button-wrapper">
                        <!--TODO: implementation about id-->
                        <favorite-button :item-id="board[`${dashboardScopeType}_dashboard_id`]"
                                         :favorite-type="FAVORITE_TYPE.DASHBOARD"
                                         scale="0.666"
                        />
                    </div>
                    <span class="board-item-title">{{ board.name }}</span>
                </div>
                <p class="board-item-description">
                    What item I fill in this area?
                </p>
                <div class="label-wrapper">
                    <p-label :class="{'viewers-label': true, 'private-label': board.viewers === 'PRIVATE'}"
                             :text="board.viewers === 'PUBLIC' ? 'Public' : 'Private'"
                             :left-icon="board.viewers === 'PUBLIC' ? 'ic_public' : 'ic_private'"
                    />
                    <p-label v-for="(label, idx) in board.labels"
                             :key="`${board.name}-label-${idx}`"
                             :text="label"
                             clickable
                             @item-click="handleSetQuery(label)"
                    />
                </div>
            </template>
        </p-board>
        <div v-if="dashboardList.length >= 10"
             class="dashboard-list-pagination"
        >
            <p-pagination :total-count="dashboardList.length"
                          :page-size="PAGE_SIZE"
                          :current-page="thisPage"
                          @change="handlePage"
            />
        </div>
    </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import {
    PBoard, PFieldTitle, PLabel, PPagination,
} from '@spaceone/design-system';

import { QueryHelper } from '@cloudforet/core-lib/query';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { QueryStoreFilterValue } from '@/query/type';
import { store } from '@/store';

import type { DashboardItem, ScopeType } from '@/store/modules/dashboard/type';
import { SCOPE_TYPE } from '@/store/modules/dashboard/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

const PAGE_SIZE = 10;

interface DashboardBoardListProps {
    scopeType: ScopeType;
    fieldTitle: string;
    // TODO: implementation
    dashboardList: DashboardItem[];
}

export default defineComponent<DashboardBoardListProps>({
    name: 'DashboardBoardList',
    components: {
        PPagination,
        PLabel,
        FavoriteButton,
        PBoard,
        PFieldTitle,
    },
    props: {
        scopeType: {
            type: String as PropType<ScopeType>,
            default: undefined,
        },
        fieldTitle: {
            type: String,
            default: undefined,
        },
        dashboardList: {
            type: Array as PropType<DashboardItem[]>,
            default: () => [],
        },
    },
    setup(props) {
        const state = reactive({
            thisPage: 1,
            dashboardScopeType: computed(() => (props.scopeType === SCOPE_TYPE.DOMAIN ? 'domain' : 'project')),
            dashboardListByBoardSets: computed(() => props.dashboardList
                .slice((state.thisPage - 1) * PAGE_SIZE, state.thisPage * PAGE_SIZE)
                .map((d) => (
                    {
                        ...d,
                        iconButtonSets: convertBoardItemButtonSet(d[`${state.dashboardScopeType}_dashboard_id`]),
                    }
                ))),
        });

        const convertBoardItemButtonSet = (dashboardId) => [
            {
                iconName: 'ic_edit',
                eventAction: () => console.log('edit!'),
            },
            {
                iconName: 'ic_duplicate',
                eventAction: () => console.log('dup!'),
            },
            {
                iconName: 'ic_trashcan',
                /* TODO: Implementation */
                eventAction: async () => {
                    await SpaceConnector.clientV2.dashboard[`${state.dashboardScopeType}Dashboard`].delete({
                        [`${state.dashboardScopeType}_dashboard_id`]: dashboardId,
                    });
                },
            },
        ];

        const labelQueryHelper = new QueryHelper();
        const handleSetQuery = (selectedLabel: QueryStoreFilterValue | QueryStoreFilterValue[]) => {
            labelQueryHelper.setFilters(store.state.dashboard.searchFilters).addFilter({ k: 'label', o: '=', v: selectedLabel });
            store.dispatch('dashboard/setSearchFilters', labelQueryHelper.filters);
        };
        const handlePage = (page: number) => {
            state.thisPage = page;
        };

        return {
            ...toRefs(state),
            handleSetQuery,
            handlePage,
            FAVORITE_TYPE,
            SCOPE_TYPE,
            PAGE_SIZE,
        };
    },
});
</script>

<style lang="postcss" scoped>
.dashboard-board-list {
    flex-grow: 1;

    /* custom design-system component - p-field-title */
    :deep(.p-field-title) {
        margin-bottom: 0.5rem;
    }
    .board-count {
        font-weight: normal;
        margin-left: 0.5rem;
    }
    .board {
        .board-item-title-wrapper {
            @apply flex items-center;
            height: 1.25rem;
            .favorite-button-wrapper {
                @apply flex items-center justify-center;
                width: 1.25rem;
                height: 1.25rem;
            }
            .board-item-title {
                margin-left: 0.125rem;
                font-size: 1rem;
                font-weight: bold;
                line-height: 1.25;
            }
        }
        .board-item-description {
            font-size: 0.75rem;
            line-height: 1.25;
            color: gray;
            margin: 0.25rem 0 0.75rem;
        }

        .label-wrapper {
            @apply flex items-center;
        }

        /* custom design-system component - p-label */
        :deep(.viewers-label) {
            @apply border-0 bg-violet-200;
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
