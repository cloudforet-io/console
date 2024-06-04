<script setup lang="ts">
import type { Location } from 'vue-router';

import {
    PBoard, PLabel, PTextHighlighting, PI, PLink,
} from '@spaceone/design-system';
import type { BoardSet } from '@spaceone/design-system/src/data-display/board/type';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import type { DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';


interface Props {
    templateSets: BoardSet[];
    column?: number;
    showViewLink?: boolean;
    keyword: string;
}

const { getProperRouteLocation } = useProperRouteLocation();
const props = withDefaults(defineProps<Props>(), {
    templateSets: () => [],
    column: 1,
    showViewLink: false,
    keyword: '',
});
const emit = defineEmits<{(e: 'select-template', value: any)}>();

/* Event */
const getDashboardViewLink = (template: DashboardModel): Location|undefined => {
    const dashboardId = template.private_dashboard_id || template.dashboard_id;
    if (!dashboardId) return undefined;
    return getProperRouteLocation({ name: DASHBOARDS_ROUTE.DETAIL._NAME, params: { dashboardId } });
};
const handleClickBoardItem = (template: DashboardModel) => {
    emit('select-template', template);
};
</script>

<template>
    <p-board :board-sets="props.templateSets"
             class="dashboard-create-template-board"
             selectable
             style-type="cards"
             :style-options="{
                 column: props.column,
             }"
             @item-click="handleClickBoardItem"
    >
        <template #item-content="{board}">
            <div class="board-item-wrapper">
                <div class="left-part">
                    <div class="board-item-title">
                        <p-text-highlighting :text="board.name"
                                             :term="props.keyword"
                                             style-type="secondary"
                        />
                    </div>
                    <div class="label-wrapper">
                        <p-label v-for="(label, idx) in board.labels"
                                 :key="`${label}-${idx}`"
                                 :text="label"
                        />
                    </div>
                    <p-link v-if="props.showViewLink"
                            :action-icon="ACTION_ICON.INTERNAL_LINK"
                            new-tab
                            highlight
                            size="sm"
                            :to="getDashboardViewLink(board)"
                    >
                        {{ $t('DASHBOARDS.CREATE.VIEW_THIS_DASHBOARD') }}
                    </p-link>
                </div>
                <div class="right-part">
                    <p-i name="ic_chevron-right"
                         width="1.5rem"
                         height="1.5rem"
                         class="arrow-icon"
                    />
                </div>
            </div>
        </template>
    </p-board>
</template>

<style lang="postcss" scoped>
.dashboard-create-template-board {
    .board-item-wrapper {
        display: flex;
        gap: 0.25rem;
        .left-part {
            flex-grow: 1;
        }
        .right-part {
            align-items: center;
            justify-content: center;
            display: flex;
        }
        .label-wrapper {
            padding-bottom: 0.5rem;
        }
    }

    .board-item-title {
        @apply text-label-md flex items-center;
        margin-bottom: 0.5rem;
        gap: 0.375rem;
    }
}
</style>
