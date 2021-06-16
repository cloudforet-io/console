import { ArgTypes } from '@storybook/addons';
import { getTabHookArgTypes, Inner } from '@/hooks/tab/story-helper';

export const getButtonTabArgTypes = (): ArgTypes => ({
    ...getTabHookArgTypes(),
});


export { Inner };
