import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import type { MenuAttachHandler } from '@cloudforet/mirinae';

/* Resource Menu Handler */
export interface GetResourceMenuHandlerOptions {
    dataKey?: string;
    menuFilters?: ConsoleFilter[];
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

