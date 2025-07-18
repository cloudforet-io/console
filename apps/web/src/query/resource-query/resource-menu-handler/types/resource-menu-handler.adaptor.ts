import type { MenuAttachHandler } from '@cloudforet/mirinae';

/* Resource Menu Handler */
export interface GetResourceMenuHandlerOptions {
    dataKey?: string;
    fixedFilters?: Record<string, any>;
}

export interface GetResourceMenuHandler {
    (options?: GetResourceMenuHandlerOptions): MenuAttachHandler;
}

export interface UseBaseResourceMenuHandlerReturnType {
    getResourceMenuHandler: GetResourceMenuHandler;
}

export interface UseResourceMenuHandlerReturnType {
    getHandler: GetResourceMenuHandler;
}

