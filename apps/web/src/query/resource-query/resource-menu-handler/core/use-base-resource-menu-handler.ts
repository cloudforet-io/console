import type { MenuAttachHandler } from '@cloudforet/mirinae';

import { referenceQueryClient as queryClient } from '@/query/clients';
import { useResourceQueryKey } from '@/query/core/query-key/use-resource-query-key';
import { RESOURCE_MENU_FETCH_CONFIG } from '@/query/resource-query/resource-menu-handler/config/resource-menu-fetch-config';
import { generateMenuQueryHandler } from '@/query/resource-query/resource-menu-handler/core/menu-query-handler.generator';
import type {
    GetResourceMenuHandlerOptions, UseBaseResourceMenuHandlerReturnType,
} from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.adaptor';
import type { ResourceMenuHandlerFetchConfig } from '@/query/resource-query/resource-menu-handler/types/resource-menu-handler.port';
import { RESOURCE_CONFIG_MAP } from '@/query/resource-query/shared/contants/resource-config-map';
import type { ResourceKeyType } from '@/query/resource-query/shared/types/resource-type';



interface UseResourceMenuHandlerOptions<TModelData extends Record<string, any>> {
    resourceType: ResourceKeyType;
    fetchConfig: ResourceMenuHandlerFetchConfig<TModelData>;
}


export const useBaseResourceMenuHandler = <TModelData extends Record<string, any>>({
    resourceType,
    fetchConfig,
}: UseResourceMenuHandlerOptions<TModelData>): UseBaseResourceMenuHandlerReturnType => {
    const { withSuffix: listQueryKeyWithSuffix } = useResourceQueryKey(resourceType, { verb: 'list' });
    const { withSuffix: statQueryKeyWithSuffix } = useResourceQueryKey(resourceType, { verb: 'stat' });


    const _queryClient = queryClient;
    const {
        makeListMenuHandler,
        makeStatMenuHandler,
    } = generateMenuQueryHandler(_queryClient);


    const getResourceMenuHandler = ({ dataKey, menuFilters }: GetResourceMenuHandlerOptions = {}): MenuAttachHandler => {
        let resultHandler: MenuAttachHandler;

        if (dataKey && fetchConfig.stat) {
            if (import.meta.env.DEV) {
                console.log(`[useBaseResourceMenuHandler] generated Stat Menu Handler for "${resourceType}"`);
            }
            resultHandler = makeStatMenuHandler(statQueryKeyWithSuffix, {
                fetcher: fetchConfig.stat,
                distinct: dataKey,
                menuFilters,
            });
        } else if (!dataKey && fetchConfig.list) {
            if (import.meta.env.DEV) {
                console.log(`[useBaseResourceMenuHandler] generated List Menu Handler for "${resourceType}"`);
            }
            const resourceConfig = RESOURCE_CONFIG_MAP[resourceType];
            const resourceMenuFetchConfig = RESOURCE_MENU_FETCH_CONFIG[resourceType];
            resultHandler = makeListMenuHandler(listQueryKeyWithSuffix, {
                fetcher: fetchConfig.list,
                idKey: resourceConfig.idKey,
                only: resourceMenuFetchConfig.only,
                searchTargets: resourceMenuFetchConfig.searchTargets,
                menuFilters,
            });
        } else {
            throw new Error(`No fetch config found for resource type: ${resourceType}`);
        }

        return resultHandler;
    };
    return {
        getResourceMenuHandler,
    };
};
