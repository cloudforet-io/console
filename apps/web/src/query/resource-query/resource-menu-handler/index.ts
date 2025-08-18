import { resourceMenuHandlerMap } from '@/query/resource-query/resource-menu-handler/adapters/registry';
import type { UseResourceMenuHandlerReturnType } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';
import { makeResourceProxy } from '@/query/resource-query/shared/utils/resource-proxy-helper';

/**
 * @name useResourceMenuHandler
 * @description
 * A hook that returns a proxy object for getting resource-specific menu handlers.
 * When a property (e.g., `app`) is accessed on the returned proxy, it finds the corresponding handler implementation
 * from `resourceMenuHandlerMap` (e.g., `useAppResourceMenuHandler`), executes it, and returns its `getHandler` method.
 * An error is thrown if the handler for the given resource type is not found.
 *
 * @example
 * ```ts
 * import { useResourceMenuHandler } from '@/query/resource-query/resource-menu-handler/use-resource-menu-handler';
 *
 * const resourceMenuHandler = useResourceMenuHandler();
 *
 * // Get the handler for the 'product' resource type.
 * // This will internally call `useProductResourceMenuHandler` and return its `getHandler` method.
 * const getProductMenuHandler = resourceMenuHandler.product; // get handler for stat verb
 *
 * // Get the handler for the 'workspace' resource type.
 * const getWorkspaceMenuHandler = resourceMenuHandler.workspace; // get handler for list verb
 *
 * // The returned handlers can then be used to perform actions.
 * // The specific arguments will depend on each handler's implementation.
 * const productMenuHanlder = getProductMenuHandler({ dataKey: 'region', fixedFilters: { provider: 'AWS' } }); // for stat verb
 * const workspaceMenuHandler = getWorkspaceMenuHandler({ fixedFilters: { state: 'ENABLED' } }); // for list verb
 * ```
 */

const proxy = makeResourceProxy<typeof resourceMenuHandlerMap, UseResourceMenuHandlerReturnType['getHandler']>(resourceMenuHandlerMap, (target, prop) => {
    if (!(prop in target)) {
        throw new Error(`[useResourceMenuHandler] Resource Menu Handler for "${prop}" not found`);
    }

    const handler = target[prop as keyof typeof target]();
    return handler.getHandler;
});

export const useResourceMenuHandlerMap = () => proxy;
