import type { ArgTypes, Parameters, Args } from '@storybook/vue';

import { getUseContextMenuItemsArgs, getUseContextMenuItemsArgTypes } from '@/hooks/use-context-menu-items/story-helper';
import { getUseContextMenuStyleArgs, getUseContextMenuStyleArgTypes } from '@/hooks/use-context-menu-style/story-helper';

import type { UseContextMenuControllerOptions } from './use-context-menu-controller';

export const getUseContextMenuControllerArgs = (): Args => {
    const useContextMenuStyleArgs = getUseContextMenuStyleArgs();
    const useContextMenuItemsArgs = getUseContextMenuItemsArgs();

    useContextMenuStyleArgs.contextMenuRef = useContextMenuStyleArgs.menuRef;
    delete useContextMenuStyleArgs.menuRef;

    useContextMenuItemsArgs.useFixedStyle = useContextMenuStyleArgs.useFixedMenuStyle;
    delete useContextMenuStyleArgs.useFixedMenuStyle;

    const args: Args = {
        ...useContextMenuStyleArgs,
        ...useContextMenuItemsArgs,
    };

    return args;
};

export const getUseContextMenuControllerParameters = (): Parameters => ({});

export const getUseContextMenuControllerArgTypes = (): ArgTypes<UseContextMenuControllerOptions> => {
    const useContextMenuStyleArgTypes: any = getUseContextMenuStyleArgTypes();
    const useContextMenuItemsArgTypes = getUseContextMenuItemsArgTypes();

    const contextMenuRefArgType = { ...useContextMenuStyleArgTypes.menuRef };
    contextMenuRefArgType.name = 'contextMenuRef';
    delete useContextMenuStyleArgTypes.menuRef;

    const useFixedStyleArgType = { ...useContextMenuStyleArgTypes.useFixedMenuStyle };
    useFixedStyleArgType.name = 'useFixedStyle';
    delete useContextMenuStyleArgTypes.useFixedMenuStyle;

    const argTypes: ArgTypes<UseContextMenuControllerOptions> = {
        ...useContextMenuStyleArgTypes,
        ...useContextMenuItemsArgTypes,
        contextMenuRef: contextMenuRefArgType,
        useFixedStyle: useFixedStyleArgType,
    };

    return argTypes;
};
