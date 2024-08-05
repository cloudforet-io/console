import { reactive, ref, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/inputs/buttons/button/PButton.vue';
import { getOverlayLayoutArgTypes, getOverlayLayoutArgs, getOverlayLayoutParameters } from '@/layouts/overlay-layout/story-helper';


import POverlayLayout from './POverlayLayout.vue';

type POverlayLayoutPropsAndCustomArgs = ComponentProps<typeof POverlayLayout>;

const meta : Meta<POverlayLayoutPropsAndCustomArgs> = {
    title: 'Layouts/Overlay Layout',
    component: POverlayLayout,
    argTypes: {
        ...getOverlayLayoutArgTypes(),
    },
    parameters: {
        ...getOverlayLayoutParameters(),
    },
    args: {
        ...getOverlayLayoutArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof POverlayLayout>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: {
            POverlayLayout,
            PButton,
        },
        template: `
            <div class="w-full h-full fixed">
                <p-button @click="() => {isVisible = !isVisible}">Toggle Overlay</p-button>
                <p-overlay-layout :visible.sync="isVisible"
                                :size="size"
                                :title="title"
                                :style-type="styleType"
                                :is-fixed-size="isFixedSize"
                                :hide-header="hideHeader"
                >
                    <template>
                        <div class="font-bold text-lg">
                            {{ text }}
                        </div>
                    </template>
                    <template v-if="titleRightExtraSlot" #title-right-extra><div v-html="titleRightExtraSlot"/></template>
                    <template v-if="footerSlot" #footer><div v-html="footerSlot"/></template>
                </p-overlay-layout>
            </div>
        `,
        setup() {
            const state = reactive({
                isVisible: false,
                text: 'Contents',
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: {
            POverlayLayout,
            PButton,
        },
        template: `
            <div class="w-full h-full">
                <p-button @click="() => {show = !show}">Toggle Overlay</p-button>
                <p-overlay-layout :visible.sync="show"  size="lg" title="Overlay Layout Title">
                    <template #default>
                        <div class="font-bold text-lg">
                            {{ faker?.lorem.paragraph(100) }}
                        </div>
                    </template>
                    <template #footer>
                        <div>footer</div>
                    </template>
                </p-overlay-layout>
            </div>
        `,
        setup() {
            const show = ref(false);
            return {
                show,
            };
        },
    }),
    decorators: [() => ({
        template: '<story style="height: 500px; width: 100%;" />',
    })],
};

export const Playground: Story = {
    ...Template,
    decorators: [() => ({
        template: '<story style="height: 500px; position: relative;" />',
    })],
};
