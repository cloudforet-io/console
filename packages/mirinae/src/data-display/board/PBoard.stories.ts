import { reactive, toRefs, computed } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { boardStandardItemSets, basicItemSets } from '@/data-display/board/mock';
import { getBoardArgTypes, getBoardParameters, getBoardArgs } from '@/data-display/board/story-helper';
import { I18nConnector } from '@/translations';

import PBoard from './PBoard.vue';

type PBoardPropsAndCustomArgs = ComponentProps<typeof PBoard>;

const meta : Meta<PBoardPropsAndCustomArgs> = {
    title: 'Data Display/Board',
    component: PBoard,
    argTypes: {
        ...getBoardArgTypes(),
    },
    parameters: {
        ...getBoardParameters(),
    },
    args: {
        ...getBoardArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PBoard>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PBoard },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-board
                    :style-type="styleType"
                    :board-sets="boardItemList"
                    :style-options="styleOptions"
                >
                    <template #item-content>
                        <strong>Example Title</strong>
                        <p>Any content can be here.</p>
                    </template>
                </p-board>
            </div>
        `,
        setup(props) {
            const state = reactive({
                boardItemList: computed(() => props.boardSets),
                styleType: computed(() => props.styleType),
                styleOptions: computed(() => props.styleOptions),
                pageLimit: computed(() => props.pageLimit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        props: Object.keys(getBoardArgTypes()),
        components: { PBoard },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-board
                    style-type="list"
                    :board-sets="boardItemList"
                >
                    <template #item-content="{board}" >
                        <strong>{{ board.title }}</strong>
                        <p>{{ board.description1 }}</p>
                        <p>{{ board.description2 }}</p>
                    </template>
                </p-board>
            </div>
            `,
        setup() {
            const state = reactive({
                boardItemList: basicItemSets,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const StyleType: Story = {
    render: () => ({
        components: { PBoard },
        template: `
            <div class="h-full w-full overflow p-8 flex flex-wrap">
                <div class="flex-grow p-4">
                    <strong>list</strong>
                    <br/>
                    <br/>
                    <p-board
                        style-type="list"
                        :board-sets="boardItemList"
                    >
                        <template #item-content>
                            <strong>Example Title</strong>
                            <p>Any content can be here.</p>
                        </template>
                    </p-board>
                </div>
                <div class="flex-grow p-4">
                    <strong>cards</strong>
                    <br/>
                    <br/>
                    <p-board
                        style-type="cards"
                        :board-sets="boardItemList"
                    >
                        <template #item-content>
                            <strong>Left Icon</strong>
                            <p>Collector tags icon</p>
                        </template>
                    </p-board>
                </div>
            </div>
            `,
        setup() {
            const state = reactive({
                boardItemList: boardStandardItemSets,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const StyleTypeCards: Story = {
    render: () => ({
        components: { PBoard },
        template: `
            <div class="h-full w-full overflow p-8">
                <strong>Column : 2</strong>
                <br/>
                <br/>
                <p-board
                    style-type="cards"
                    :board-sets="boardItemList"
                    :style-options="styleOptionsColumn2"
                >
                    <template #item-content>
                        <strong>Example Title</strong>
                        <p>Any content can be here.</p>
                    </template>
                </p-board>
                <br/>
                <br/>
                <strong>Column : 3</strong>
                <br/>
                <br/>
                <p-board
                    style-type="cards"
                    :board-sets="boardItemList"
                    :style-options="styleOptionsColumn3"
                >
                    <template #item-content>
                        <strong>Example Title</strong>
                        <p>Any content can be here.</p>
                    </template>
                </p-board>
            </div>
            `,
        setup() {
            const state = reactive({
                boardItemList: boardStandardItemSets,
                styleOptionsColumn2: { column: 2 },
                styleOptionsColumn3: { column: 3 },
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Selectable: Story = {
    render: () => ({
        components: { PBoard },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-board
                    :board-sets="boardItemList"
                    selectable
                >
                    <template #item-content>
                        <strong>Example Title</strong>
                        <p>Any content can be here.</p>
                    </template>
                </p-board>
            </div>
        `,
        setup() {
            const state = reactive({
                boardItemList: boardStandardItemSets,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
