<script setup lang="ts">
import {
    PBoard, PLabel, PI,
} from '@cloudforet/mirinae';
import type { BoardSet } from '@cloudforet/mirinae/src/data-display/board/type';

import { useDashboardCreatePageStore } from '@/services/dashboards/stores/dashboard-create-page-store';


interface Props {
    templateSets: BoardSet[];
}

const dashboardCreatePageStore = useDashboardCreatePageStore();
const props = withDefaults(defineProps<Props>(), {
    templateSets: () => [],
});

/* Event */
const handleClickBoardItem = (boardItem: BoardSet) => {
    if (boardItem.template_id) {
        dashboardCreatePageStore.setSelectedTemplateId(boardItem.template_id);
    }
    dashboardCreatePageStore.setTemplateName(boardItem.name);
    dashboardCreatePageStore.setTemplateLabels(boardItem.labels);
    dashboardCreatePageStore.setDashboardLabels(boardItem.labels);
    dashboardCreatePageStore.setCreateType('SINGLE');
    dashboardCreatePageStore.setCurrentStep(2);
};
</script>

<template>
    <p-board :board-sets="props.templateSets"
             class="dashboard-create-template-board"
             selectable
             style-type="cards"
             @item-click="handleClickBoardItem"
    >
        <template #item-content="{board}">
            <div class="board-item-wrapper">
                <div class="left-part">
                    <div class="board-item-title">
                        {{ board.name }}
                    </div>
                    <div class="label-wrapper">
                        <slot name="bottom">
                            <p-label v-for="(label, idx) in board.labels"
                                     :key="`${label}-${idx}`"
                                     :text="label"
                            />
                        </slot>
                    </div>
                </div>
                <div class="right-part">
                    <p-i name="ic_arrow-right"
                         width="1rem"
                         height="1rem"
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
    }

    .board-item-title {
        @apply text-label-md flex items-center;
        margin-bottom: 0.5rem;
        gap: 0.375rem;
    }
}
</style>
