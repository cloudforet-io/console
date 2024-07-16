import { reactive, toRefs } from 'vue';

import { faker } from '@faker-js/faker';
import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getLazyImgDefaultArgs, getLazyImgArgTypes } from '@/feedbacks/loading/lazy-img/story-helper';
import PI from '@/foundation/icons/PI.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';



import PLazyImg from './PLazyImg.vue';

type PLazyImgPropsAndCustomArgs = ComponentProps<typeof PLazyImg>;

const meta : Meta<PLazyImgPropsAndCustomArgs> = {
    title: 'Feedbacks/Loading/Lazy Image',
    component: PLazyImg,
    argTypes: {
        ...getLazyImgArgTypes(),
        error: { table: { disable: true } },
        preloader: { table: { disable: true } },
    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=6132%3A133538',
        },
    },
    args: {
        ...getLazyImgDefaultArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PLazyImg>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PLazyImg },
        template: `
            <p-lazy-img
                :height="height"
                :width="width"
                :src="src"
                :errorIcon="errorIcon"
                :errorIconColor="errorIconColor"
                :loading="loading"
                :alt="alt"
            ></p-lazy-img>
        `,
    }),
};

export const Basic: Story = {
    ...Template,
    args: {
        src: faker.image.image(100, 100, true),
    },
};

export const FailedtoLoadImage: Story = {
    render: () => ({
        components: { PLazyImg },
        template: `
            <div>
                <div class="flex items-center mb-4">
                    <h2 class=" mr-4">Default: </h2>
                    <p-lazy-img src="" />
                </div>
                <div class="flex items-center mb-4">
                    <h2 class=" mr-4">Custom Error Icon Color: </h2>
                    <p-lazy-img src="" error-icon-color="red white" />
                </div>
                <div class="flex items-center mb-4">
                    <h2 class=" mr-4">Custom Error Icon: </h2>
                    <p-lazy-img src="" error-icon="img_avatar_admin" />
                </div>
                <div class="flex items-center">
                    <h2 class=" mr-4">Using Error Slot: </h2>
                    <p-lazy-img src="">
                        <template #error>
                            <img :src="errorImage"/>
                        </template>
                    </p-lazy-img>
                </div>
            </div>
        `,
        setup() {
            return {
                errorImage: faker.image.image(100, 100, true),
            };
        },
    }),
};

export const CustomLoader: Story = {
    render: () => ({
        components: { PLazyImg, PI },
        template: `
            <p-lazy-img loading>
                <template #preloader>
                    <p-i name="ic_settings-filled" animation="spin" :size="2"></p-i>
                </template>
            </p-lazy-img>
        `,
    }),
};

export const ManualControl: Story = {
    render: () => ({
        components: {
            PLazyImg,
            PButton,
        },
        template: `
            <div class="flex items-center">
                <p-button class="mr-4" @click="getData">Load Image</p-button>
                <p-lazy-img :src="src"
                    :loading="loading"
                />
            </div>
        `,
        setup() {
            const state = reactive({
                src: '',
                loading: false,
            });
            const getData = () => {
                state.src = '';
                state.loading = true;
                setTimeout(() => {
                    state.src = faker.image.image(100, 100, true);
                    state.loading = false;
                }, 2000);
            };
            return {
                ...toRefs(state),
                getData,
            };
        },
    }),
};

export const Playground: Story = {
    ...Template,
};
