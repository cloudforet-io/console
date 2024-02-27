<script setup lang="ts">
import { computed, reactive } from 'vue';

import {
    PBoard, PButton, PLazyImg, PLabel,
} from '@spaceone/design-system';
import type { BoardSet } from '@spaceone/design-system/src/data-display/board/type';

import { store } from '@/store';

import type { ProviderReferenceMap } from '@/store/modules/reference/provider/type';

interface Props {
    templateSets: BoardSet[];
    column?: number;
    showViewLink?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    templateSets: () => [],
    column: 1,
    showViewLink: false,
});

const state = reactive({
    providers: computed<ProviderReferenceMap>(() => store.getters['reference/providerItems']),
});

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
                <p class="board-item-title">
                    <p-lazy-img v-if="board.provider !== 'blank'"
                                :src="state.providers[board.provider]?.icon"
                                width="1rem"
                                height="1rem"
                    />
                    {{ board.title }}
                </p>
                <p class="board-item-description">
                    {{ board.description }}
                </p>
                <div class="board-item-labels">
                    <p-label v-for="(label, idx) in board.labels"
                             :key="`${label}-${idx}`"
                             :text="label"
                    />
                </div>
            </div>
        </template>
        <template #item-custom-right-content>
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
        @apply text-label-md;
        margin-bottom: 0.5rem;
    }
    .board-item-description {
        @apply text-label-md text-gray-700;
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
