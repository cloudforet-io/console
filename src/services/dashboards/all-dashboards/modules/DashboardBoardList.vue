<template>
    <div class="dashboard-board-list">
        <p-field-title class="p-field-title">
            <template>
                <span>{{ fieldTitle }}</span>
                <span class="board-count">({{ dashboardListByBoardSets.length }})</span>
            </template>
        </p-field-title>
        <p-board :board-sets="dashboardListByBoardSets"
                 class="board"
        >
            <template #item-content="{board}">
                <div class="board-item-title-wrapper">
                    <div class="favorite-button-wrapper">
                        <favorite-button :item-id="board.domain_dashboard_id"
                                         :favorite-type="FAVORITE_TYPE.DASHBOARD"
                                         scale="0.666"
                        />
                    </div>
                    <span class="board-item-title">{{ board.name }}</span>
                </div>
                <p class="board-item-description">
                    What item I fill in this area?
                </p>
                <p-label :class="{'viewers-label': true, 'private-label': board.viewers === 'PRIVATE'}"
                         :text="board.viewers === 'PUBLIC' ? 'Public' : 'Private'"
                         :left-icon="board.viewers === 'PUBLIC' ? 'ic_public' : 'ic_private'"
                />
                <p-label v-for="(label, idx) in board.labels"
                         :key="`${board.domain_dashboard_id}-label-${idx}`"
                         :text="label"
                         clickable
                />
            </template>
        </p-board>
    </div>
</template>

<script lang="ts">
import { computed, reactive, toRefs } from 'vue';

import { PBoard, PFieldTitle, PLabel } from '@spaceone/design-system';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';

import FavoriteButton from '@/common/modules/favorites/favorite-button/FavoriteButton.vue';

export default {
    name: 'DashboardBoardList',
    components: {
        PLabel, FavoriteButton, PBoard, PFieldTitle,
    },
    props: {
        fieldTitle: {
            type: String,
            default: undefined,
        },
        dashboardList: {
            type: Array,
            default: () => [],
        },
    },
    setup(props) {
        const state = reactive({
            boardItemIconButtonSets: [
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
                    eventAction: () => console.log('delete!'),
                },
            ],
            dashboardListByBoardSets: computed(() => props.dashboardList.map((d) => ({ ...d, iconButtonSets: state.boardItemIconButtonSets }))),
        });

        return {
            ...toRefs(state),
            FAVORITE_TYPE,
        };
    },
};
</script>

<style lang="postcss" scoped>
.dashboard-board-list {

    padding-top: 1.125rem;
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

        /* custom design-system component - p-label */
        :deep(.viewers-label) {
            @apply border-0 bg-violet-200;
            &.private-label {
                @apply bg-gray-200;
            }
        }
    }
}
</style>
