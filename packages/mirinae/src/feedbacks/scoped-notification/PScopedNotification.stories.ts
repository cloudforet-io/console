import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import {
    getScopedNotificationArgs, getScopedNotificationArgTypes, getScopedNotificationParameters,
} from '@/feedbacks/scoped-notification/story-helper';

import PScopedNotification from './PScopedNotification.vue';



type ScopedNotificationPropsAndCustomArgs = ComponentProps<typeof PScopedNotification>;

const meta: Meta<ScopedNotificationPropsAndCustomArgs> = {
    title: 'Feedbacks/Scoped Notification',
    component: PScopedNotification,
    argTypes: {
        ...getScopedNotificationArgTypes(),
    },
    parameters: {
        ...getScopedNotificationParameters(),
    },
    args: {
        ...getScopedNotificationArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PScopedNotification>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PScopedNotification },
        template: `
            <p-scoped-notification v-bind="$props"></p-scoped-notification>
        `,
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PScopedNotification },
        template: `
            <div>
            <p-scoped-notification type="information"
                                   layout="full-width"
                                   icon="ic_info-circle"
                                   title="Title"
                                   :visible="true"
            >
                <template #default>
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                </template>
                <template #right>
                    right slot
                </template>
            </p-scoped-notification>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};

export const Type: Story = {
    render: () => ({
        components: { PScopedNotification },
        template: `
            <div>
                <template v-for="type in ['information', 'danger', 'warning', 'success', 'discovery', 'tip']">
                    <p>{{ type }}</p>
                    <p-scoped-notification
                        :key="type"
                        :type="type"
                        layout="full-width"
                        icon="ic_error-filled"
                        title="Title"
                        :visible="true"
                        class="mb-4"
                    >
                        <template #default>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        </template>
                        <template #right>
                            right slot
                        </template>
                    </p-scoped-notification>
                </template>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};

export const Layout: Story = {
    render: () => ({
        components: { PScopedNotification },
        template: `
            <div>
                <template v-for="layout in ['full-width', 'in-section']">
                    <p>{{ layout }}</p>
                    <p-scoped-notification
                        :key="layout"
                        :layout="layout"
                        icon="ic_info-circle"
                        :title="layout"
                        :visible="true"
                        class="mb-4"
                    >
                        <template #default>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        </template>
                    </p-scoped-notification>
                </template>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};

export const Icon: Story = {
    render: () => ({
        components: { PScopedNotification },
        template: `
            <div>
                <template v-for="icon in ['ic_info-circle', 'ic_error-filled', 'ic_warning-filled']">
                    <p-scoped-notification
                        :key="icon"
                        layout="full-width"
                        :icon="icon"
                        title="Title"
                        :visible="true"
                        class="mb-2"
                    />
                </template>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};

export const Title: Story = {
    render: () => ({
        components: { PScopedNotification },
        template: `
            <div>
                <p>Title</p>
                <p-scoped-notification
                    layout="full-width"
                    icon="ic_info-circle"
                    title="Title!!"
                    :visible="true"
                    class="mb-4"
                >
                    <template #default>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                    </template>
                </p-scoped-notification>
                <p>No Title</p>
                <p-scoped-notification
                    layout="full-width"
                    icon="ic_info-circle"
                    :visible="true"
                >
                    <template #default>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                    </template>
                </p-scoped-notification>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};

export const CloseButton: Story = {
    render: () => ({
        components: { PScopedNotification },
        template: `
            <div>
                <p>No Close Button (default)</p>
                <p-scoped-notification
                    layout="full-width"
                    icon="ic_info-circle"
                    title="Title"
                    :visible="true"
                    class="mb-4"
                >
                </p-scoped-notification>
                <p>Show Close Button</p>
                <p-scoped-notification
                    layout="full-width"
                    icon="ic_info-circle"
                    title="Title"
                    :visible="true"
                    show-close-button
                >
                </p-scoped-notification>
            </div>
        `,
        setup() {
            return {};
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
