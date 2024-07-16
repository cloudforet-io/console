import Vue from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PToastAlert from '@/feedbacks/alert/toast-alert/PToastAlert.vue';
import { getToastAlertDefaultArgs, getToastAlertArgTypes } from '@/feedbacks/alert/toast-alert/story-helper';
import PButton from '@/inputs/buttons/button/PButton.vue';


type PToastAlertPropsAndCustomArgs = ComponentProps<typeof PToastAlert>;

const meta : Meta<PToastAlertPropsAndCustomArgs> = {
    title: 'Feedbacks/Alert/Toast Alert',
    component: PToastAlert,
    argTypes: {
        ...getToastAlertArgTypes(),
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/IS6P8y1Wn2nfBC4jGlSiya/Components?node-id=10%3A88918&t=kwTRXVZQtJLDw0Ei-4',
        },
    },
    args: {
        ...getToastAlertDefaultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PToastAlert>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PToastAlert, PButton },
        template: `
            <div>
                <div>
                    <p-toast-alert group="toastTopCenter" />
                    <p-toast-alert group="toastTopLeft" />
                    <p-toast-alert group="toastTopRight" />
                    <p-toast-alert group="toastBottomLeft" />
                    <p-toast-alert group="toastBottomRight" />
                </div>
                <div>
                    <p-button @click="displayToast">Launch Toast Alert</p-button>
                </div>
            </div>
        `,
        setup(props) {
            const displayToast = () => {
                Vue.notify({
                    group: props.group,
                    type: 'alert',
                    title: 'This is Title',
                    text: 'This is Contents.',
                    duration: 200000,
                    speed: 1000,
                });
            };
            return {
                displayToast,
            };
        },
    }),
};

export const AlertType: Story = {
    render: () => ({
        components: { PToastAlert, PButton },
        template: `
            <div>
                <div>
                    <p-toast-alert group="toastTopCenter" position="top center" />
                </div>
                <p-button style-type="negative-primary" class="mr-2" @click="displayToast('alert')">Alert Toast</p-button>
                <p-button style-type="positive" class="mr-2" @click="displayToast('success')">Success Toast</p-button>
                <p-button :style="{'background-color': '#FFCE02'}" class="mr-2" @click="displayToast('warning')">Warning Toast</p-button>
                <p-button style-type="tertiary" @click="displayToast('info')">Info Toast</p-button>
                <br/><br/>
                <p-button style-type="tertiary" @click="displayToast('loading')">Loading Toast</p-button>
            </div>
            <!--<div>-->
        `,
        setup() {
            const displayToast = (alertType) => {
                Vue.notify({
                    group: 'toastTopCenter',
                    type: alertType,
                    title: 'This is Title',
                    text: 'This is Contents.',
                    duration: 2000,
                    speed: 1000,
                });
            };
            return {
                displayToast,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
