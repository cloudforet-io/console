import { reactive, toRefs } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PButton from '@/inputs/buttons/button/PButton.vue';

import PNotificationBar from './PNotificationBar.vue';
import { getNotificationBarDefaultArgs, getNotificationBarArgTypes } from './stroy-helper';



type PNotificationBarPropsAndCustomArgs = ComponentProps<typeof PNotificationBar>;

const meta : Meta<PNotificationBarPropsAndCustomArgs> = {
    title: 'Feedbacks/Notification Bar',
    component: PNotificationBar,
    argTypes: {
        ...getNotificationBarArgTypes(),
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=8791%3A189001',
        },
    },
    args: {
        ...getNotificationBarDefaultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PNotificationBar>;

const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes).filter((d) => d !== 'visible'),
        components: { PNotificationBar, PButton },
        template: `
            <div class="w-full h-full">
                <p-button :style-type="visible ? 'primary' : 'highlight'"
                          @click="visible = !visible;">
                    {{visible ? 'close' : 'open' }}
                </p-button>
                <p-notification-bar v-model="visible"
                                    :style-type="styleType"
                                    class="mt-4 flex-grow"
                                    @close="onClose"
                >
                    {{$props.default}}
                </p-notification-bar>
                <div class="flex items-center justify-center bg-primary3" style="height: 300px;">
                    BODY
                </div>
            </div>
        `,
        setup() {
            const state = reactive({
                visible: true,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

const PlaygroundTemplate: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PNotificationBar },
        template: `
                <p-notification-bar :visible="visible"
                                    class="mt-4 flex-grow"
                                    @close="onClose"
                >
                    {{$props.default}}
                </p-notification-bar>
        `,
    }),
};

export const Basic: Story = {
    ...Template,
};

export const LongContents: Story = {
    ...Template,
    args: {
        default: faker.lorem.lines(30),
    },
};

export const Playground: Story = {
    ...PlaygroundTemplate,
};
