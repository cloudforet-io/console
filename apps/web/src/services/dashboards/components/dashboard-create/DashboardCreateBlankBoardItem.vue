<script setup lang="ts">
import {
    PBoard, PI,
} from '@cloudforet/mirinae';
import type { BoardSet } from '@cloudforet/mirinae/types/data-display/board/type';

import { useDashboardCreatePageStore } from '@/services/dashboards/stores/dashboard-create-page-store';


interface Props {
    templateSets: BoardSet[];
}

const dashboardCreatePageStore = useDashboardCreatePageStore();
const props = withDefaults(defineProps<Props>(), {
    templateSets: () => [],
});

/* Event */
const handleClickBlankBoardItem = () => {
    dashboardCreatePageStore.setCreateType('SINGLE');
    dashboardCreatePageStore.setCurrentStep(2);
};
</script>

<template>
    <p-board :board-sets="props.templateSets"
             class="dashboard-create-blank-board-item"
             selectable
             style-type="cards"
             @item-click="handleClickBlankBoardItem"
    >
        <template #item-content>
            <div class="board-item-wrapper">
                <div class="left-part">
                    <div class="board-item-title">
                        Blank
                    </div>
                    <div class="label-wrapper">
                        <span class="blank-description">
                            {{ $t('DASHBOARDS.CREATE.BLANK_DESC') }}
                        </span>
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
.dashboard-create-blank-board-item {
    .board-item-wrapper {
        display: flex;
        gap: 0.25rem;
        .left-part {
            flex-grow: 1;
            .blank-description {
                @apply text-paragraph-sm text-gray-500;
            }
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
