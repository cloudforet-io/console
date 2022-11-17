<template>
    <div class="p-board" :class="{ [`${styleType}-style`]: true }">
        <template v-for="(board, index) in boardList">
            <p-board-item :key="`board-${index}`"
                          class="p-board-item"
                          :class="{ 'first-list-item': index === 0, 'last-list-item': index === boardList.length - 1}"
                          :left-icon="board.leftIcon"
                          :icon-button-sets="board.iconButtonSets"
                          :rounded="board.rounded"
                          @click.stop="handleClickBoardItem(board, index)"
            >
                <template #left-content>
                    <slot name="item-left-content" v-bind="{...$props, board, index}" />
                </template>
                <template #content>
                    <slot name="item-content" v-bind="{...$props, board, index}" />
                </template>
                <template #custom-right-content>
                    <slot name="item-custom-right-content" v-bind="{...$props, board, index}" />
                </template>
            </p-board-item>
        </template>
    </div>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';
import type { PropType, SetupContext } from 'vue';

import PBoardItem from '@/data-display/board-item/PBoardItem.vue';
import { BOARD_STYLE_TYPE } from '@/data-display/board/type';
import type { BoardProps, BoardSet } from '@/data-display/board/type';


export default defineComponent<BoardProps>({
    name: 'PBoard',
    components: { PBoardItem },
    props: {
        styleType: {
            type: String,
            default: BOARD_STYLE_TYPE.list,
            validator(styleType: any) {
                return Object.values(BOARD_STYLE_TYPE).includes(styleType);
            },
        },
        boardSets: {
            type: Array as PropType<BoardSet[]>,
            default: () => [],
        },
        pageLimit: {
            type: Number,
            default: 10,
        },
    },
    setup(props, { emit }: SetupContext) {
        const state = reactive({
            boardList: computed<BoardSet[]>(() => props.boardSets),
        });

        const handleClickBoardItem = (item: BoardSet, index) => {
            emit('item-click', item, index);
        };

        return {
            ...toRefs(state),
            handleClickBoardItem,
        };
    },
});
</script>

<style lang="postcss">
.p-board {
    @apply flex flex-col;
}
.list-style {
    .p-board-item {
        @apply border-b-0;
    }
    .first-list-item {
        @apply rounded-t-md;
    }
    .last-list-item {
        @apply rounded-b-md border-b;
    }
}
.cards-style {
    row-gap: 0.5rem;
    .p-board-item {
        @apply rounded-md;
    }
}
</style>
