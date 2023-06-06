<template>
    <div class="p-board"
         :class="[ [`${styleType}-style`] ]"
         :style="state.styleVariableByOptions"
    >
        <template v-for="(board, index) in state.boardList"
                  :key="`board-${board.value}-${index}`"
        >
            <p-board-item v-model:selected="selectedItem"
                          class="p-board-item"
                          :class="{
                              'first-list-item': index === 0,
                              'last-list-item': index === state.boardList.length - 1,
                              'selectable': selectable
                          }"
                          :value="board.value"
                          :left-icon="board.leftIcon"
                          :icon-button-sets="board.iconButtonSets"
                          :rounded="board.rounded"
                          @click.stop="handleClickBoardItem(board, index)"
            >
                <template #left-content>
                    <slot name="item-left-content"
                          v-bind="{...$props, board, index}"
                    />
                </template>
                <template #content>
                    <slot name="item-content"
                          v-bind="{...$props, board, index}"
                    />
                </template>
                <template #custom-right-content>
                    <slot name="item-custom-right-content"
                          v-bind="{...$props, board, index}"
                    />
                </template>
                <template #overlay-content>
                    <slot name="item-overlay-content"
                          v-bind="{...$props, board, index}"
                    />
                </template>
            </p-board-item>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    computed, reactive,
} from 'vue';
import type { PropType } from 'vue';


import PBoardItem from '@/data-display/board-item/PBoardItem.vue';
import { BOARD_STYLE_TYPE } from '@/data-display/board/type';
import type { BoardSet, StyleOptions } from '@/data-display/board/type';


/* HACK: This defineProps is Bandage solution.
    Because props validation can't use with props generic type.
    So, if I find the solution, I will change this code.
* */
const props = defineProps({
    styleType: {
        type: String,
        default: BOARD_STYLE_TYPE.list,
        validator(styleType: any) {
            return Object.values(BOARD_STYLE_TYPE).includes(styleType);
        },
    },
    styleOptions: {
        type: Object as PropType<StyleOptions>,
        default: undefined,
    },
    boardSets: {
        type: Array as PropType<BoardSet[]>,
        default: () => [],
    },
    pageLimit: {
        type: Number,
        default: 10,
    },
    selectable: {
        type: Boolean,
        default: false,
    },
    selectedItem: {
        type: String,
        default: undefined,
    },
});

const emit = defineEmits<{(e: 'item-click', item: BoardSet, index: number): void;}>();

const state = reactive({
    boardList: computed<BoardSet[]>(() => props.boardSets),
    styleVariableByOptions: computed(() => {
        const styles = {} as {[prop: string]: any};
        if (!props.styleOptions) return styles;
        if (BOARD_STYLE_TYPE.cards) {
            if (props.styleOptions.column) {
                styles['--columns'] = props.styleOptions.column;
            }
        }
        return styles;
    }),
});

const handleClickBoardItem = (item: BoardSet, index: number) => {
    emit('item-click', item, index);
};

</script>

<style lang="postcss">
.list-style {
    @apply flex flex-col;
    .p-board-item {
        @apply border-b-0;
    }
    .first-list-item {
        @apply rounded-t-lg;
    }
    .last-list-item {
        @apply rounded-b-lg border-b;
    }
}
.cards-style {
    @apply grid;

    --columns: 1;
    gap: 0.5rem;
    grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
    .p-board-item {
        @apply rounded-lg;
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.06);
    }

    @screen tablet {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
}
</style>
