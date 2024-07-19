import { reactive, toRefs, computed } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getLabelArgTypes, getLabelArgs, getLabelParameters } from '@/data-display/label/story-helper';
import { I18nConnector } from '@/translations';

import PLabel from './PLabel.vue';

type PLabelPropsAndCustomArgs = ComponentProps<typeof PLabel>;

const meta : Meta<PLabelPropsAndCustomArgs> = {
    title: 'Data Display/Label',
    component: PLabel,
    argTypes: {
        ...getLabelArgTypes(),
    },
    parameters: {
        ...getLabelParameters(),
    },
    args: {
        ...getLabelArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PLabel>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        i18n: I18nConnector.i18n,
        components: { PLabel },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-label :text="text"
                         :left-icon="icon"
                         :deletable="deletable"
                         :clickable="clickable"
                         :background-color="theme"
                />
            </div>
        `,
        setup(props) {
            const state = reactive({
                text: computed(() => props.text),
                deletable: computed(() => props.deletable),
                clickable: computed(() => props.clickable),
                icon: computed(() => props.leftIcon),
                theme: computed(() => props.backgroundColor),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PLabel },
        template: `
            <div class="h-full w-full overflow p-8">
                <div class="flex items-center">
                    <p-label text="Label"/>
                    <p-label text="Label" clickable/>
                    <p-label left-icon="ic_lock-filled" text="Label"/>
                </div>
                <br/>
                <div class="flex items-center">
                    <p-label text="Label" deletable/>
                    <p-label text="Label" deletable clickable/>
                    <p-label left-icon="ic_globe-filled" text="Label" deletable/>
                </div>
            </div>
        `,
    }),
};

export const Clickable: Story = {
    render: () => ({
        components: { PLabel },
        template: `
            <div class="h-full w-full overflow p-8">
                <div class="flex items-center">
                    <span>Clickable : &nbsp;</span>
                    <p-label text="Click me" @item-click="handleItemClick" clickable/>
                    <h1 v-show="state.showEl">Hi~~ You clicked me~~</h1>
                </div>
            </div>
        `,
        setup() {
            const state = reactive({ showEl: false });
            const handleItemClick = () => { state.showEl = !state.showEl; };
            return { state, handleItemClick };
        },
    }),
};

export const ClickStop: Story = {
    render: () => ({
        components: { PLabel },
        template: `
            <div class="h-full w-full overflow p-8">
                <h1>ClickStop prop for event.stopPropagation()</h1>
                <br />
                <p-label text="I am not clickable" :click-stop="false" />
            </div>
        `,
    }),
};

export const Deletable: Story = {
    render: () => ({
        components: { PLabel },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-label text="Label1" deletable/>
                <p-label text="Label2" deletable clickable/>
            </div>
        `,
    }),
};

export const LeftIcon: Story = {
    render: () => ({
        components: { PLabel },
        template: `
            <div class="h-full w-full overflow p-8">
                <p-label left-icon="ic_lock-filled" text="Label"/>
                <p-label left-icon="ic_globe-filled" text="Label"/>
                <p-label left-icon="ic_question-mark-circle-filled" text="Label"/>
            </div>
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
