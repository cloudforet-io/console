/* eslint-disable import/no-extraneous-dependencies */
import { reactive, toRefs } from 'vue';

import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import PSelectButtonGroup from './PSelectButtonGroup.vue';
import { getSelectButtonGroupDefaultArgs, getSelectButtonGroupArgTypes } from './story-helper';


type PSelectButtonGroupPropsAndCustomArgs = ComponentProps<typeof PSelectButtonGroup>;

const meta : Meta<PSelectButtonGroupPropsAndCustomArgs> = {
    title: 'Inputs/Buttons/Select Button Group',
    component: PSelectButtonGroup,
    argTypes: {
        ...getSelectButtonGroupArgTypes(),
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5131%3A126230',
        },
    },
    args: {
        ...getSelectButtonGroupDefaultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PSelectButtonGroup>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PSelectButtonGroup },
        template: `
            <div style="align-items:center; justify-content:center;">
                <p-select-button-group
                    :buttons="buttons"
                    :selected.sync="selected"
                    :theme="theme"
                    @clickButton="clickButton"
                    @click-one="clickOne"
                    @click-two="clickTwo"
                    @click-three="clickThree"
                    @click-four="clickFour"
                />
                <br>
                <p>selected button : {{ selected }}</p>
            </div>
        `,
        setup() {
            return {
                clickButton: action('clickButton'),
                clickOne: action('click-one'),
                clickTwo: action('click-two'),
                clickThree: action('click-three'),
                clickFour: action('click-four'),
            };
        },
    }),
};

export const LongCase: Story = {
    render: () => ({
        components: { PSelectButtonGroup },
        template: `
            <div style="align-items:center; justify-content:center;">
                <p-select-button-group
                    :buttons="buttons"
                    :selected.sync="selected"
                />
                <br>
                <p>selected button : {{ selected }}</p>
            </div>
        `,
        setup() {
            const state = reactive({
                buttons: [
                    { name: 'baseInformation', label: 'Base Information' },
                    { name: 'buckets', label: 'Buckets' },
                    { name: 'objects', label: 'Objects' },
                    { name: 'versioning', label: 'Versioning' },
                    { name: 'websiteHosting', label: 'Website Hosting' },
                    { name: 'serverAccessLogging', label: 'Server Access Logging' },
                    { name: 'encryption', label: 'Encryption' },
                    { name: 'objectLock', label: 'Object Lock' },
                    { name: 'transferAcceleration', label: 'Transfer Acceleration' },
                    { name: 'requesterPays', label: 'Requester Pays' },
                    { name: 'events', label: 'Events' },
                    { name: 'tags', label: 'Tags' },
                    { name: 'rawData', label: 'Raw Data' },
                ],
                selected: 'baseInformation',
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
