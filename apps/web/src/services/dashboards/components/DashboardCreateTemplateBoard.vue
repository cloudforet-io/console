<script setup lang="ts">
import { useRouter } from 'vue-router/composables';

import {
    PBoard, PButton, PLabel, PTextHighlighting, PI, screens,
} from '@spaceone/design-system';
import type { BoardSet } from '@spaceone/design-system/src/data-display/board/type';

import { DASHBOARDS_ROUTE } from '@/services/dashboards/routes/route-constant';
import type { DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';


interface Props {
    templateSets: BoardSet[];
    column?: number;
    showViewLink?: boolean;
    keyword: string;
}

const MOBILE_WINDOW_SIZE = screens.mobile.max;

const props = withDefaults(defineProps<Props>(), {
    templateSets: () => [],
    column: 1,
    showViewLink: false,
    keyword: '',
});
const emit = defineEmits<{(e: 'select-template', value: any)}>();
const router = useRouter();

/* Event */
const handleClickView = (template: DashboardModel) => {
    const dashboardId = template.private_dashboard_id || template.public_dashboard_id;
    if (!dashboardId) return;
    const routeData = router.resolve({ name: DASHBOARDS_ROUTE.DETAIL._NAME, params: { dashboardId: dahsboardId } });
    window.open(routeData.href, '_blank');
};
const handleClickCreate = (template: DashboardModel) => {
    emit('select-template', template);
};
const handleClickBoardItem = (template: DashboardModel) => {
    if (window.innerWidth <= MOBILE_WINDOW_SIZE) {
        emit('select-template', template);
    }
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
                        <p-i :name="board.display_info?.icon ?? 'ic_dashboard-template_others'"
                             width="1rem"
                             height="1rem"
                        />
                        <p-text-highlighting :text="board.name"
                                             :term="props.keyword"
                                             style-type="secondary"
                        />
                    </div>
                    <div class="board-item-labels">
                        <p-label v-for="(label, idx) in board.labels"
                                 :key="`${label}-${idx}`"
                                 :text="label"
                        />
                    </div>
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
        <template #item-custom-right-content="{ board }">
            <div class="overlay-wrapper">
                <p-button v-if="props.showViewLink"
                          size="md"
                          style-type="tertiary"
                          icon-right="ic_arrow-right-up"
                          @click="handleClickView(board)"
                >
                    {{ $t('DASHBOARDS.CREATE.VIEW') }}
                </p-button>
                <p-button size="md"
                          style-type="substitutive"
                          icon-right="ic_arrow-right"
                          @click="handleClickCreate(board)"
                >
                    {{ $t('DASHBOARDS.CREATE.CREATE') }}
                </p-button>
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
    .overlay-wrapper {
        @apply h-full flex items-center gap-3;
    }

    /* custom p-board-item */
    &:deep(.p-board-item) {
        cursor: default;
        .content-area {
            .right-overlay-wrapper {
                top: calc(50% - 1rem);
            }
        }
    }

    .arrow-icon {
        display: none;
    }
}

@screen mobile {
    .dashboard-create-template-board {
        .overlay-wrapper {
            display: none;
        }

        /* custom p-board-item */
        &:deep(.p-board-item) {
            cursor: pointer;
        }

        .arrow-icon {
            display: block;
        }
    }
}
</style>
