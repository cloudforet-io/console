import { ArgTypes } from '@storybook/addons';
import { argTypes as tabArgTypes, Inner } from '@/hooks/tab/story-helper';
import { BOX_TAB_STYLE_TYPE } from '@/navigation/tabs/box-tab/config';

export const argTypes: ArgTypes = {
    ...tabArgTypes,
    styleType: {
        name: 'styleType',
        type: { name: 'string' },
        description: `Box style types. ${Object.values(BOX_TAB_STYLE_TYPE)} are available.`,
        defaultValue: BOX_TAB_STYLE_TYPE.white,
        table: {
            type: {
                summary: 'string',
            },
            category: 'props',
            defaultValue: {
                summary: `"${BOX_TAB_STYLE_TYPE.white}"`,
            },
        },
        control: {
            type: 'select',
            options: Object.values(BOX_TAB_STYLE_TYPE),
        },
    },
};


export { Inner };
