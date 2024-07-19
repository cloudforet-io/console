import Vue from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PNoticeAlert from '@/feedbacks/alert/notice-alert/PNoticeAlert.vue';
import { getNoticeAlertArgs, getNoticeAlertArgTypes, getNoticeAlertParameters } from '@/feedbacks/alert/notice-alert/story-helper';
import PButton from '@/inputs/buttons/button/PButton.vue';

type PNoticeAlertPropsAndCustomArgs = ComponentProps<typeof PNoticeAlert>;

const meta : Meta<PNoticeAlertPropsAndCustomArgs> = {
    title: 'Feedbacks/Alert/Notice Alert',
    component: PNoticeAlert,
    argTypes: {
        ...getNoticeAlertArgTypes(),
    },
    parameters: {
        ...getNoticeAlertParameters(),
    },
    args: {
        ...getNoticeAlertArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PNoticeAlert>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PNoticeAlert },
        template: `
            <div>
                <div>
                    <p-notice-alert group="noticeTopLeft" position="top left" />
                    <p-notice-alert group="noticeTopRight" position="top right" />
                    <p-notice-alert group="noticeBottomLeft" position="bottom left" />
                    <p-notice-alert group="noticeBottomRight" position="bottom right" />
                </div>
                <div>
                    <button @click="displayNotice">Launch Notice Alert</button>
                </div>
            </div>
        `,
        setup(props) {
            const displayNotice = () => {
                Vue.notify({
                    group: props.group,
                    type: 'info',
                    title: 'This is Title',
                    text: 'This is Contents.',
                    duration: 2000,
                    speed: 1000,
                });
            };
            return {
                displayNotice,
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PNoticeAlert, PButton },
        template: `
            <div>
                <div>
                    <p-notice-alert group="noticeBottomRight" position="bottom right" />
                </div>
                <p-button style-type="negative-primary" class="mr-2" @click="displayNotice('alert')">Alert Notice</p-button>
                <p-button style-type="positive" class="mr-2" @click="displayNotice('success')">Success Notice</p-button>
                <p-button :style="{'background-color': '#FFCE02'}" class="mr-2" @click="displayNotice('warning')">Warning Notice</p-button>
                <p-button style-type="tertiary" class="mr-2" @click="displayNotice('info')">Info Notice</p-button>
            </div>
            <!--<div>-->
        `,
        setup() {
            const displayNotice = (alertType) => {
                Vue.notify({
                    group: 'noticeBottomRight',
                    type: alertType,
                    title: 'This is Title',
                    text: 'This is Contents.',
                    duration: 2000,
                    speed: 1000,
                });
            };
            return {
                displayNotice,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
