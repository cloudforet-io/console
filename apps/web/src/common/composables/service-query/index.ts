import type { Location } from 'vue-router';
import { useRouter } from 'vue-router/composables';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';

import type { RouteQueryString } from '@/lib/router-query-string';
import {
    primitiveToQueryString, arrayToQueryString, objectToQueryString,
} from '@/lib/router-query-string';

import { serviceNavigationSpecMap } from '@/common/composables/service-query/spec';
import type {
    ServiceNavigationSpec, ServiceName, ServiceParamsMap, ServiceQueryMap,
} from '@/common/composables/service-query/type';

export const useServiceNavigation = () => {
    const appContextStore = useAppContextStore();
    const userWorkspaceStore = useUserWorkspaceStore();
    const router = useRouter();

    const convertQueryToString = <TQuery extends Record<string, any>>(query: TQuery): Record<string, RouteQueryString> => Object.entries(query).reduce((acc, [key, value]) => {
        if (value === undefined) return acc;

        if (Array.isArray(value)) {
            acc[key] = arrayToQueryString(value);
        } else if (typeof value === 'object' && value !== null) {
            acc[key] = objectToQueryString(value);
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            acc[key] = primitiveToQueryString(value);
        }

        return acc;
    }, {} as Record<string, RouteQueryString>);

    const validateParams = <TParams>(spec: ServiceNavigationSpec<TParams, any>, params: TParams) => {
        const requiredParams = spec.params.required as (keyof TParams)[];
        const missingParams = requiredParams?.filter((param) => params[param] === undefined);
        if (missingParams?.length > 0) {
            throw new Error(`Missing required params for ${spec.route.name}: ${missingParams.join(', ')}`);
        }
    };

    const validateQuery = <TQuery>(spec: ServiceNavigationSpec<any, TQuery>, query: TQuery) => {
        if (!query) return;

        const requiredQueries = spec.query.required as (keyof TQuery)[];
        if (requiredQueries) {
            const missingQueries = requiredQueries?.filter((q) => query[q] === undefined);
            if (missingQueries?.length > 0) {
                throw new Error(`Missing required queries for ${spec.route.name}: ${missingQueries.join(', ')}`);
            }
        }
    };

    const buildNavigation = <TService extends ServiceName>(
        service: TService,
        params: ServiceParamsMap[TService],
        query: ServiceQueryMap[TService],
    ): Location => {
        const spec = serviceNavigationSpecMap[service];
        validateParams(spec, params);
        validateQuery<ServiceQueryMap[TService]>(spec, query);

        const isAdmin = appContextStore.getters.isAdminMode;
        const currentWorkspaceId = userWorkspaceStore.getters.currentWorkspaceId;

        const location: Location = {
            name: isAdmin ? spec.route.adminName : spec.route.name,
            params: {
                ...(params as unknown as Record<string, string>),
                ...(isAdmin ? {} : { workspaceId: currentWorkspaceId }),
            },
            query: convertQueryToString(query),
        };

        return location;
    };

    const navigate = <TService extends ServiceName>(
        service: TService,
        params: ServiceParamsMap[TService],
        query: ServiceQueryMap[TService],
        options?: { openInNewTab?: boolean },
    ) => {
        const navigation = buildNavigation(service, params, query);
        if (options?.openInNewTab) {
            window.open(router.resolve(navigation).href, '_blank');
        } else {
            router.push(navigation).catch(() => {});
        }
    };

    const getLocation = <TService extends ServiceName>(
        service: TService,
        params: ServiceParamsMap[TService],
        query: ServiceQueryMap[TService],
    ): Location => buildNavigation(service, params, query);

    const getHref = <TService extends ServiceName>(
        service: TService,
        params: ServiceParamsMap[TService],
        query: ServiceQueryMap[TService],
    ): string => router.resolve(buildNavigation(service, params, query)).href;

    return { navigate, getLocation, getHref };
};
