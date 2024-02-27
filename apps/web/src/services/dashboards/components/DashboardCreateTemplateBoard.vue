<script setup lang="ts">

import {
    PBoard, PButton, PLabel, PTextHighlighting, PLazyImg,
} from '@spaceone/design-system';
import type { BoardSet } from '@spaceone/design-system/src/data-display/board/type';


// import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

import type { DashboardModel } from '@/services/dashboards/types/dashboard-api-schema-type';

interface Props {
    templateSets: BoardSet[];
    column?: number;
    showViewLink?: boolean;
    keyword: string;
}

const props = withDefaults(defineProps<Props>(), {
    templateSets: () => [],
    column: 1,
    showViewLink: false,
    keyword: '',
});

const emit = defineEmits<{(e: 'select-template', value: any)}>();
//
// const state = reactive({
//     providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
// });

const handleClickTemplate = (template: DashboardModel) => {
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
    >
        <template #item-content="{board}">
            <div class="board-item-wrapper">
                <div class="board-item-title">
                    <p-lazy-img :src="board.description?.icon ?? 'ic_dashboard-template_blank'"
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
        </template>
        <template #item-custom-right-content="{ board }">
            <div class="overlay-wrapper">
                <p-button v-if="props.showViewLink"
                          size="md"
                          style-type="tertiary"
                          icon-right="ic_arrow-right-up"
                >
                    View
                </p-button>
                <p-button size="md"
                          style-type="substitutive"
                          icon-right="ic_arrow-right"
                          @click="handleClickTemplate(board)"
                >
                    Create
                </p-button>
            </div>
        </template>
    </p-board>
</template>

<style lang="postcss" scoped>
.dashboard-create-template-board {

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
        .content-area {
            .right-overlay-wrapper {
                top: calc(50% - 1rem);
            }
        }
    }
}
</style>
