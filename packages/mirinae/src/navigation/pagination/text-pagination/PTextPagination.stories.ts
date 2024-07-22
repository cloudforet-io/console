import { computed, reactive, toRefs } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getTextPaginationArgTypes, getTextPaginationArgs, getTextPaginationParameters } from '@/navigation/pagination/text-pagination/story-helper';

import PTextPagination from './PTextPagination.vue';

type PTextPaginationPropsAndCustomArgs = ComponentProps<typeof PTextPagination>;

const meta : Meta<PTextPaginationPropsAndCustomArgs> = {
    title: 'Navigation/Pagination/Text Pagination',
    component: PTextPagination,
    argTypes: {
        ...getTextPaginationArgTypes(),
    },
    parameters: {
        ...getTextPaginationParameters(),
    },
    args: {
        ...getTextPaginationArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PTextPagination>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PTextPagination },
        template: `
            <div style="display:flex; align-items:center; justify-content:center;">
                <p-text-pagination
                    :all-page="allPage"
                    :this-page.sync="thisPage"
                    :show-page-number="showPageNumber"
                    :disable-next-page="disableNextPage"
                    :has-next-page="hasNextPage"
                />
            </div>
        `,
    }),
};

export const BasicTextPagination: Story = {
    render: () => ({
        components: { PTextPagination },
        template: `
            <div style="display:flex; align-items:center; justify-content:center;">
                <p-text-pagination
                    :all-page="allPage"
                    :this-page.sync="thisPage"
                />
            </div>
        `,
        setup() {
            const state = reactive({
                allPage: 3,
                thisPage: 1,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const WithoutPageNumber: Story = {
    render: () => ({
        components: { PTextPagination },
        template: `
            <div style="display: flex; align-items:center; justify-content:center;">
                <p-text-pagination
                    :all-page="allPage"
                    :this-page.sync="thisPage"
                    :show-page-number="false"
                />
            </div>
        `,
        setup() {
            const state = reactive({
                allPage: 3,
                thisPage: 1,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const DisableNextPageButton: Story = {
    render: () => ({
        components: { PTextPagination },
        template: `
            <div style="display: flex; align-items:center; justify-content:center;">
                <p-text-pagination
                    :this-page.sync="thisPage"
                    :all-page="3"
                    disable-next-page
                />
            </div>
        `,
        setup() {
            const state = reactive({
                thisPage: 1,
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const WithoutTotalPageCount: Story = {
    render: () => ({
        components: { PTextPagination },
        template: `
            <div style="display: flex; align-items:center; justify-content:center;">
                <p-text-pagination
                    :this-page.sync="thisPage"
                    :has-next-page="!isMax"
                />
            </div>
        `,
        setup() {
            const state = reactive({
                thisPage: 1,
                isMax: computed(() => state.thisPage === 3),
            });
            return {
                ...toRefs(state),
            };
        },
    }),
};

export const CustomContentsWithDefaultSlot: Story = {
    render: () => ({
        components: { PTextPagination },
        template: `
            <div style="display: flex; align-items:center; justify-content:center;">
                <p-text-pagination
                    :this-page.sync="thisPage"
                ><template #default>
                    <span>{{ thisPage }} page</span>
                </template>
                </p-text-pagination>
            </div>
        `,
        setup() {
            const state = reactive({
                thisPage: 1,
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
