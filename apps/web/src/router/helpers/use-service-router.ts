import type { Location, VueRouter } from 'vue-router/types/router';

import { useGlobalConfigSchemaStore } from '@/store/global-config-schema/global-config-schema-store';

import type { MenuId } from '@/lib/menu/config';

type RouterOptionsType = {
    feature: MenuId;
    routeKey: string;
    name?: string;
    params?: Record<string, any>;
};
type NavigateOptionsType = RouterOptionsType & {
    method: 'push' | 'replace';
};

export const useServiceRouter = (router: VueRouter) => {
    const globalConfigSchemaStore = useGlobalConfigSchemaStore();
    const globalConfigSchemaState = globalConfigSchemaStore.state;

    const transformParams = (
        paramConfig: Record<string, any>,
        sourceParams: Record<string, any>,
    ): Record<string, any> => {
        const result: Record<string, any> = {};

        Object.entries(paramConfig).forEach(([key, targetKey]) => {
            if (sourceParams[key] !== undefined) {
                result[targetKey] = sourceParams[key];
            }
        });

        return result;
    };

    const getLocation = (options: RouterOptionsType): Location => {
        const {
            feature, routeKey, params,
        } = options;

        const featureMetadata = globalConfigSchemaState.routeMetadataSchema[feature.toUpperCase()];
        const convertedParams = params ? transformParams(featureMetadata[routeKey].params || {}, params) : undefined;

        if (!featureMetadata) {
            return { name: feature, params: convertedParams };
        }

        const routeConfig = featureMetadata[routeKey];
        if (!routeConfig) {
            return { name: feature, params: convertedParams };
        }

        return {
            name: routeConfig.name,
            params: convertedParams,
        };
    };

    const navigate = async (options: NavigateOptionsType) => {
        const { method } = options;
        const location = getLocation(options);
        return router[method](location);
    };

    const resolve = (options: RouterOptionsType) => {
        const location = getLocation(options);
        return router.resolve(location);
    };

    return {
        push: (options: RouterOptionsType) => navigate({ ...options, method: 'push' }),
        replace: (options: RouterOptionsType) => navigate({ ...options, method: 'replace' }),
        getLocation,
        resolve,
    };
};

