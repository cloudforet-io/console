import { reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { useProxyValue } from '@/hooks';
import { getFileUploaderArgs, getFileUploaderArgTypes, getFileUploaderParameters } from '@/inputs/file-uploader/story-helper';

import PFileUploader from './PFileUploader.vue';

type PFileUploaderPropsAndCustomArgs = ComponentProps<typeof PFileUploader>;

const meta : Meta<PFileUploaderPropsAndCustomArgs> = {
    title: 'Inputs/File Uploader',
    component: PFileUploader,
    argTypes: {
        ...getFileUploaderArgTypes(),
    },
    parameters: {
        ...getFileUploaderParameters(),
    },
    args: {
        ...getFileUploaderArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PFileUploader>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PFileUploader },
        template: `
            <div>
                <p-file-uploader
                    :uploaded-files.sync="proxyUploadedFiles"
                />
            </div>
        `,
        setup(props, { emit }) {
            const state = reactive({
                proxyUploadedFiles: useProxyValue('uploadedFiles', props, emit),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const Basic: Story = {
    render: () => ({
        components: { PFileUploader },
        template: `
            <p-file-uploader />
        `,
    }),
};

export const Playground: Story = {
    ...Template,
};
