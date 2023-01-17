<template>
    <div class="p-board"
         :class="[ [`${styleType}-style`] ]"
         :style="styleVariableByOptions"
    >
        <template v-for="(board, index) in boardList">
            <p-board-item :key="`board-${board.value}-${index}`"
                          class="p-board-item"
                          :class="{
                              'first-list-item': index === 0,
                              'last-list-item': index === boardList.length - 1,
                              'selectable': selectable
                          }"
                          :value="board.value"
                          :left-icon="board.leftIcon"
                          :icon-button-sets="board.iconButtonSets"
                          :rounded="board.rounded"
                          :selected.sync="selectedItem"
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
import type { BoardProps, BoardSet, StyleOptions } from '@/data-display/board/type';


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
    },
    setup(props, { emit }: SetupContext) {
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

        return {
            ...toRefs(state),
            handleClickBoardItem,
        };
    },
});
</script>

<style lang="postcss">
.list-style {
    @apply flex flex-col;
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
    @apply grid;

    --columns: 1;
    gap: 0.5rem;
    grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
    .p-board-item {
        @apply rounded-md;
    }

    @screen tablet {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
}
</style>
