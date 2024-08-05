import type { Meta, StoryObj } from '@storybook/vue';
import type { ComponentProps } from 'vue-component-type-helpers';

import { getDatePaginationArgTypes, getDatePaginationArgs, getDatePaginationParameters } from '@/navigation/pagination/date-pagination/story-helper';

import PDatePagination from './PDatePagination.vue';

type PDatePaginationPropsAndCustomArgs = ComponentProps<typeof PDatePagination>;

const meta : Meta<PDatePaginationPropsAndCustomArgs> = {
    title: 'Navigation/Pagination/Date Pagination',
    component: PDatePagination,
    argTypes: {
        ...getDatePaginationArgTypes(),
    },
    parameters: {
        ...getDatePaginationParameters(),
    },
    args: {
        ...getDatePaginationArgs(),
    },
};

export default meta;
type Story = StoryObj<typeof PDatePagination>;


const Template: Story = {
    render: (args, { argTypes }) => ({
        props: Object.keys(argTypes),
        components: { PDatePagination },
        template: `
            <div>
                <PDatePagination
                    :date.sync=date
                    :type=type
                    :allowFuture=allowFuture
                    :timezone=timezone
                />
                <div v-if="type === 'month'">
                    <p>previous month: {{ date.subtract(1, 'month').format('YYYY-MM') }}</p>
                    <b>current month: {{ date.format('YYYY-MM') }}</b>
                    <p>next month: {{ date.add(1, 'month').format('YYYY-MM') }}</p>
                </div>
                <div v-else>
                    <p>previous week: {{ date.subtract(1, 'week').format('YYYY-MM-DD') }} </p>
                    <b>current week: {{ date.format('YYYY-MM-DD') }}</b>
                    <p>next week: {{ date.add(1, 'week').format('YYYY-MM-DD') }}</p>
                </div>
                <br>
                <p>Timezone: {{ timezone }}</p>
            </div>
        `,
    }),
};

export const DatePagination: Story = {
    ...Template,
};

export const Playground: Story = {
    ...Template,
};
