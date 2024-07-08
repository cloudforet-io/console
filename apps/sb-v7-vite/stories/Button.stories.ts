import type { Meta, StoryObj } from '@storybook/vue';

import Button  from './Button.vue';

const meta : Meta<typeof Button> = {
    component: Button
}


export default meta;
type Story = StoryObj<typeof Button>;
 
export const Primary: Story = {
};