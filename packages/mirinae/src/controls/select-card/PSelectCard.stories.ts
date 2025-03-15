import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import { range } from 'lodash';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getSelectCardParameters, getSelectCardArgs, getSelectCardArgTypes } from '@/controls/select-card/story-helper';
import { getAllAvailableIcons } from '@/foundation/icons/story-helper';
import { useProxyValue } from '@/hooks';
import PLink from '@/navigation/link/PLink.vue';

import * as colors from '@/styles/colors.cjs';

import PSelectCard from './PSelectCard.vue';

const { peacock } = colors;


type PSelectCardPropsAndCustomArgs = ComponentProps<typeof PSelectCard>;

const meta : Meta<PSelectCardPropsAndCustomArgs> = {
    title: 'Controls/Select Card',
    component: PSelectCard,
    argTypes: {
        ...getSelectCardArgTypes(),
    },
    parameters: {
        ...getSelectCardParameters(),
    },
    args: {
        ...getSelectCardArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PSelectCard>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PSelectCard },
        template: `
        <div class="h-full w-full overflow p-8">
            <p-select-card :value="value"
                v-model="proxySelected"
                :disabled="disabled"
                :predicate="predicate"
                :multi-selectable="multiSelectable"
                :block="block"
                :label="label"
                :image-url="imageUrl"
                :icon="icon"
                :icon-color="iconColor"
                @change="onChange"
                style="min-width: 12rem; max-width: 100%; height: 100%; max-height: 12rem;"
            >
                <span v-if="defaultSlot" v-html="defaultSlot" />
            </p-select-card>
        </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxySelected: useProxyValue('selected', props, emit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PSelectCard },
        template: `
            <div class="w-full overflow p-8 flex flex-wrap">
                <p-select-card v-for="(value, index) in values" :key="value"
                    :tab-index="index"
                    :value="value"
                    v-model="selected"
                    :icon="icons[value]"
                    :label="icons[value]"
                    style="min-width: 10rem; max-width: 10rem; min-height: 10rem; max-height: 10rem; margin: 1rem;"
                />
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                selected: undefined,
                values: range(8),
                icons: getAllAvailableIcons(),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const ShowSelectMarker: Story = {
    render: () => ({
        components: { PSelectCard },
        template: `
            <div class="w-full overflow p-8 flex flex-wrap">
                <p-select-card v-for="(value, index) in values" :key="value" 
                    :tab-index="index"
                    :value="value"
                    v-model="selected"
                    :icon="icons[value]"
                    :label="icons[value]"
                    :show-select-marker="index === 1"
                    style="min-width: 10rem; max-width: 10rem; min-height: 10rem; max-height: 10rem; margin: 1rem;"
                               
                />
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                selected: undefined,
                values: range(2),
                icons: getAllAvailableIcons(),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Block: Story = {
    render: () => ({
        components: { PSelectCard },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-select-card v-for="(value, index) in values" :key="value"
                    :tab-index="index"
                    :value="value" block
                    v-model="selected"
                    :icon="icons[value]"
                    :label="icons[value]"
                    class="mb-4"
                />
            </div>
        `,
        setup() {
            const state = reactive({
                selected: undefined,
                values: range(8),
                icons: getAllAvailableIcons(),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const LabelOnly: Story = {
    render: () => ({
        components: { PSelectCard },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-select-card v-for="(value, index) in values" :key="value"
                    :tab-index="index"
                    :value="value" block
                    v-model="selected"
                    :label="icons[value]"
                    class="mb-4"
                />
            </div>
        `,
        setup() {
            const state = reactive({
                selected: undefined,
                values: range(8),
                icons: getAllAvailableIcons(),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const WithDefaultIcon: Story = {
    render: () => ({
        components: { PSelectCard },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-select-card v-for="(value, index) in values" :key="value"
                    :tab-index="index"
                    :value="value"
                    v-model="selected"
                    :label="'label-' + value"
                    :icon="true"
                    style="min-width: 10rem; max-width: 10rem; min-height: 10rem; max-height: 10rem; margin: 1rem;"
                />
            </div>
        `,
        setup() {
            const state = reactive({
                selected: undefined,
                values: range(8),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const MultiSelect: Story = {
    render: () => ({
        components: { PSelectCard },
        template: `
            <div class="w-full overflow p-8 flex flex-wrap">
                <p-select-card v-for="(value, index) in values" :key="value"
                    :tab-index="index"
                    multi-selectable
                    :value="value"
                    v-model="selected"
                    :icon="icons[value]"
                    :label="icons[value]"
                    style="min-width: 10rem; max-width: 10rem; min-height: 10rem; max-height: 10rem; margin: 1rem;"
                />
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                selected: [],
                values: range(8),
                icons: getAllAvailableIcons(),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Advanced: Story = {
    render: () => ({
        components: { PSelectCard },
        template: `
            <div class="w-full overflow p-8 grid gap-4 grid-cols-3">
                <p-select-card v-for="(value, index) in values" :key="value.key"
                    :tab-index="index"
                    v-model="selected"
                    :value="value"
                    :label="value.name"
                    :predicate="predicate"
                    class="mb-4"
                />
            </div>
        `,
        setup() {
            const state = reactive({
                selected: undefined,
                values: [
                    { key: 'hello', name: 'Hello' },
                    { key: 'world', name: 'World!' },
                    { key: 'spaceone', name: 'SpaceONE' },
                ],
            });
            const predicate = (value, current) => current && value.key === current.key;
            return {
                ...toRefs(state),
                predicate,
            };
        },
    }),
};

export const ContentsSlot: Story = {
    render: () => ({
        components: { PSelectCard },
        template: `
            <div class="w-full overflow p-8 flex flex-wrap">
                <p-select-card v-for="(value, index) in values" :key="value"
                    :tab-index="index"
                    :value="value"
                    v-model="selected"
                    style="min-width: 8rem; min-height: 8rem; margin: 1rem;"
                >
                    <strong :style="{color: value}">{{value}}</strong>
                </p-select-card>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                selected: undefined,
                values: range(8).map((d) => peacock[(d + 1) * 100]),
            });
            return {
                ...toRefs(state),
                peacock,
            };
        },
    }),
};

export const BottomSlot: Story = {
    render: () => ({
        components: { PSelectCard, PLink },
        template: `
            <div class="w-full overflow p-8 flex flex-wrap">
                <p-select-card v-for="(value, index) in values" :key="value"
                    :value="value"
                    v-model="selected"
                    :label="icons[index]"
                    :icon="icons[index]"
                    :tab-index="index"
                    style="min-width: 8rem; min-height: 8rem; margin: 1rem;"
                >
                    <template #bottom>
                        <p-link highlight>Preview</p-link>
                    </template>
                </p-select-card>
            </div>
        `,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setup(props) {
            const state = reactive({
                selected: undefined,
                values: range(4).map((d) => peacock[(d + 1) * 100]),
                icons: getAllAvailableIcons(),
            });
            return {
                ...toRefs(state),
                peacock,
            };
        },
    }),
};

export const Disabled: Story = {
    ...Template,
    args: {
        disabled: true,
    },
};

export const Playground: Story = {
    ...Template,
};
