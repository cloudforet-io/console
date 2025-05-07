import { ref } from 'vue';

import type { Meta, StoryObj } from '@storybook/vue';

import { useTextEllipsis } from './use-text-ellipsis';

const meta: Meta = {
    title: 'Hooks/useTextEllipsis',
    parameters: {
        docs: {
            description: {
                component: 'A hook that checks if text content is ellipsized based on element size.',
            },
        },
    },
};

export default meta;
type Story = StoryObj;

const Template = {
    render: () => ({
        template: `
            <div class="w-full">
                <div class="w-64 border p-4">
                    <p ref="textEl" class="whitespace-nowrap overflow-hidden text-ellipsis">
                        This is a very long text that should be ellipsized when it exceeds the container width.
                    </p>
                    <p class="mt-2">Is Ellipsized: {{ isEllipsis }}</p>
                </div>
                <div class="w-64 border p-4 mt-4">
                    <p ref="textEl2" class="whitespace-nowrap overflow-hidden text-ellipsis">
                        Short text.
                    </p>
                    <p class="mt-2">Is Ellipsized: {{ isEllipsis2 }}</p>
                </div>
            </div>
        `,
        setup() {
            const textEl = ref<HTMLElement | null>(null);
            const textEl2 = ref<HTMLElement | null>(null);

            const { isEllipsis } = useTextEllipsis({ textEl });
            const { isEllipsis: isEllipsis2 } = useTextEllipsis({ textEl: textEl2 });

            return {
                textEl,
                textEl2,
                isEllipsis,
                isEllipsis2,
            };
        },
    }),
};

export const Default: Story = {
    ...Template,
};
